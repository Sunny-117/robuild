import type { BuildContext } from '../types'
import { builtinModules } from 'node:module'

export type ExternalConfig = (string | RegExp)[] | ((id: string, importer?: string) => boolean)
export type NoExternalConfig = (string | RegExp)[] | ((id: string, importer?: string) => boolean)

/**
 * Build external dependencies list from package.json dependencies and peerDependencies.
 * This is the shared logic used by both bundle and watch modes.
 */
export function buildExternalDeps(ctx: BuildContext): (string | RegExp)[] {
  return [
    ...builtinModules,
    ...builtinModules.map(m => `node:${m}`),
    ...[
      ...Object.keys(ctx.pkg.dependencies || {}),
      ...Object.keys(ctx.pkg.peerDependencies || {}),
    ].flatMap(p => [p, new RegExp(`^${p}/`)]),
  ]
}

/**
 * Escape special regex characters in a string
 */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Apply noExternal configuration to filter out dependencies that should be bundled.
 * Supports both function and array forms.
 */
export function applyNoExternal(
  externalDeps: (string | RegExp)[],
  noExternal: NoExternalConfig | undefined,
  ctx: BuildContext,
): (string | RegExp)[] {
  if (!noExternal) {
    return externalDeps
  }

  if (typeof noExternal === 'function') {
    const predicate = noExternal
    const depNames = [
      ...Object.keys(ctx.pkg.dependencies || {}),
      ...Object.keys(ctx.pkg.peerDependencies || {}),
    ]
    const excludedNames = new Set<string>()

    for (const name of depNames) {
      try {
        if (predicate(name))
          excludedNames.add(name)
      }
      catch {
        // Ignore predicate errors and treat as not excluded
      }
    }

    return externalDeps.filter((dep) => {
      if (typeof dep === 'string') {
        return !excludedNames.has(dep)
      }
      if (dep instanceof RegExp) {
        // Match any RegExp we generated for an excluded package (source starts with ^<pkg>/)
        for (const name of Array.from(excludedNames)) {
          if (dep.source.startsWith(`^${escapeRegExp(name)}/`))
            return false
        }
        return true
      }
      return true
    })
  }

  if (Array.isArray(noExternal)) {
    const rules = noExternal

    return externalDeps.filter((dep) => {
      for (const rule of rules) {
        if (typeof rule === 'string') {
          if (typeof dep === 'string') {
            if (dep === rule)
              return false
          }
          else if (dep instanceof RegExp) {
            // dep was created as new RegExp(`^${p}/`)
            if (dep.source.startsWith(`^${escapeRegExp(rule)}/`))
              return false
          }
        }
        else if (rule instanceof RegExp) {
          if (typeof dep === 'string') {
            if (rule.test(dep))
              return false
          }
          else if (dep instanceof RegExp) {
            // Compare pattern source and flags
            if (dep.source === rule.source && dep.flags === rule.flags)
              return false
          }
        }
      }
      return true
    })
  }

  return externalDeps
}

/**
 * Add custom external dependencies to the list.
 * Only handles array form; function form is handled separately.
 */
export function addCustomExternal(
  externalDeps: (string | RegExp)[],
  external: ExternalConfig | undefined,
): (string | RegExp)[] {
  if (external && typeof external !== 'function') {
    return [...externalDeps, ...external]
  }
  return externalDeps
}

/**
 * Build the complete external configuration for rolldown.
 * Returns either a function (if entry.external is a function) or the processed array.
 */
export function resolveExternalConfig(
  ctx: BuildContext,
  options: {
    external?: ExternalConfig
    noExternal?: NoExternalConfig
  },
): ExternalConfig {
  // Build base external deps
  let externalDeps = buildExternalDeps(ctx)

  // Apply noExternal filter
  externalDeps = applyNoExternal(externalDeps, options.noExternal, ctx)

  // Add custom external
  externalDeps = addCustomExternal(externalDeps, options.external)

  // Return function form if provided, otherwise return the array
  if (typeof options.external === 'function') {
    return options.external
  }

  return externalDeps
}
