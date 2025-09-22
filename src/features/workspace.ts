import type { BuildConfig } from '../types'
import { readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { glob } from 'glob'

export interface WorkspacePackage {
  name: string
  path: string
  packageJson: any
  buildConfig?: BuildConfig
}

export interface WorkspaceConfig {
  packages: string[]
  filter?: string | string[]
  exclude?: string | string[]
}

/**
 * Discover workspace packages based on patterns
 */
export async function discoverWorkspacePackages(
  workspaceRoot: string,
  patterns: string[] = ['packages/*', 'apps/*'],
): Promise<WorkspacePackage[]> {
  const packages: WorkspacePackage[] = []

  for (const pattern of patterns) {
    const packagePaths = await glob(pattern, {
      cwd: workspaceRoot,
      onlyDirectories: true,
    })

    for (const packagePath of packagePaths) {
      const fullPath = resolve(workspaceRoot, packagePath)
      const packageJsonPath = join(fullPath, 'package.json')

      try {
        const packageJsonContent = await readFile(packageJsonPath, 'utf-8')
        const packageJson = JSON.parse(packageJsonContent)

        packages.push({
          name: packageJson.name || packagePath,
          path: fullPath,
          packageJson,
        })
      }
      catch {
        // Skip packages without valid package.json
        continue
      }
    }
  }

  return packages
}

/**
 * Filter workspace packages based on filter patterns
 */
export function filterWorkspacePackages(
  packages: WorkspacePackage[],
  filter?: string | string[],
  exclude?: string | string[],
): WorkspacePackage[] {
  let filtered = packages

  // Apply include filters
  if (filter) {
    const filters = Array.isArray(filter) ? filter : [filter]
    filtered = filtered.filter(pkg =>
      filters.some(f => matchesPattern(pkg.name, f) || matchesPattern(pkg.path, f)),
    )
  }

  // Apply exclude filters
  if (exclude) {
    const excludes = Array.isArray(exclude) ? exclude : [exclude]
    filtered = filtered.filter(pkg =>
      !excludes.some(e => matchesPattern(pkg.name, e) || matchesPattern(pkg.path, e)),
    )
  }

  return filtered
}

/**
 * Check if a string matches a pattern (supports wildcards)
 */
function matchesPattern(str: string, pattern: string): boolean {
  // Convert glob pattern to regex
  const regexPattern = pattern
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.')
    .replace(/\[([^\]]+)\]/g, '[$1]')

  const regex = new RegExp(`^${regexPattern}$`)
  return regex.test(str)
}

/**
 * Load workspace configuration from package.json or workspace config file
 */
export async function loadWorkspaceConfig(workspaceRoot: string): Promise<WorkspaceConfig | null> {
  try {
    // Try to load from package.json workspaces field
    const packageJsonPath = join(workspaceRoot, 'package.json')
    const packageJsonContent = await readFile(packageJsonPath, 'utf-8')
    const packageJson = JSON.parse(packageJsonContent)

    if (packageJson.workspaces) {
      const workspaces = Array.isArray(packageJson.workspaces)
        ? packageJson.workspaces
        : packageJson.workspaces.packages || []

      return {
        packages: workspaces,
      }
    }

    // Try to load from pnpm-workspace.yaml
    try {
      const { load } = await import('js-yaml')
      const pnpmWorkspacePath = join(workspaceRoot, 'pnpm-workspace.yaml')
      const pnpmWorkspaceContent = await readFile(pnpmWorkspacePath, 'utf-8')
      const pnpmWorkspace = load(pnpmWorkspaceContent) as any

      if (pnpmWorkspace?.packages) {
        return {
          packages: pnpmWorkspace.packages,
        }
      }
    }
    catch {
      // pnpm-workspace.yaml not found or invalid
    }

    // Try to load from lerna.json
    try {
      const lernaJsonPath = join(workspaceRoot, 'lerna.json')
      const lernaJsonContent = await readFile(lernaJsonPath, 'utf-8')
      const lernaJson = JSON.parse(lernaJsonContent)

      if (lernaJson.packages) {
        return {
          packages: lernaJson.packages,
        }
      }
    }
    catch {
      // lerna.json not found or invalid
    }

    return null
  }
  catch {
    return null
  }
}

/**
 * Build workspace packages in dependency order
 */
export async function buildWorkspacePackages(
  packages: WorkspacePackage[],
  buildFn: (pkg: WorkspacePackage) => Promise<void>,
): Promise<void> {
  // For now, build packages in parallel
  // TODO: Implement dependency graph resolution for proper ordering
  await Promise.all(packages.map(buildFn))
}

/**
 * Get package dependencies within the workspace
 */
export function getWorkspaceDependencies(
  pkg: WorkspacePackage,
  allPackages: WorkspacePackage[],
): WorkspacePackage[] {
  const dependencies = new Set<string>()

  // Collect all dependencies
  if (pkg.packageJson.dependencies) {
    Object.keys(pkg.packageJson.dependencies).forEach(dep => dependencies.add(dep))
  }
  if (pkg.packageJson.devDependencies) {
    Object.keys(pkg.packageJson.devDependencies).forEach(dep => dependencies.add(dep))
  }
  if (pkg.packageJson.peerDependencies) {
    Object.keys(pkg.packageJson.peerDependencies).forEach(dep => dependencies.add(dep))
  }

  // Find workspace packages that are dependencies
  return allPackages.filter(p => dependencies.has(p.name))
}
