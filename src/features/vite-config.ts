import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import type { BuildConfig, BuildEntry } from '../types'
import { logger } from './logger'

/**
 * Vite config interface (simplified)
 */
interface ViteConfig {
  build?: {
    lib?: {
      entry?: string | string[] | Record<string, string>
      formats?: string[]
      name?: string
      fileName?: string | ((format: string) => string)
    }
    outDir?: string
    minify?: boolean
    target?: string
    rollupOptions?: {
      external?: string[] | ((id: string) => boolean)
    }
  }
  define?: Record<string, any>
  resolve?: {
    alias?: Record<string, string>
  }
}

/**
 * Load Vite configuration and convert to robuild config
 */
export async function loadViteConfig(cwd: string): Promise<Partial<BuildConfig>> {
  const configFiles = [
    'vite.config.ts',
    'vite.config.js',
    'vite.config.mts',
    'vite.config.mjs',
    'vitest.config.ts',
    'vitest.config.js',
  ]

  let configPath: string | undefined
  for (const file of configFiles) {
    const fullPath = resolve(cwd, file)
    if (existsSync(fullPath)) {
      configPath = fullPath
      break
    }
  }

  if (!configPath) {
    logger.warn('No Vite config file found, skipping Vite config loading')
    return {}
  }

  try {
    logger.verbose(`Loading Vite config from: ${configPath}`)
    
    // Dynamic import to load the config
    const configModule = await import(configPath)
    const viteConfig: ViteConfig = configModule.default || configModule

    return convertViteConfig(viteConfig)
  } catch (error) {
    logger.error(`Failed to load Vite config from ${configPath}:`, error)
    return {}
  }
}

/**
 * Convert Vite config to robuild config
 */
function convertViteConfig(viteConfig: ViteConfig): Partial<BuildConfig> {
  const config: Partial<BuildConfig> = {}

  if (viteConfig.build?.lib) {
    const lib = viteConfig.build.lib
    const entries: BuildEntry[] = []

    // Convert entry points
    if (typeof lib.entry === 'string') {
      entries.push({
        type: 'bundle',
        input: lib.entry,
        format: convertFormats(lib.formats),
        globalName: lib.name,
        minify: viteConfig.build.minify,
        target: convertTarget(viteConfig.build.target),
        external: convertExternal(viteConfig.build.rollupOptions?.external),
      })
    } else if (Array.isArray(lib.entry)) {
      for (const entry of lib.entry) {
        entries.push({
          type: 'bundle',
          input: entry,
          format: convertFormats(lib.formats),
          globalName: lib.name,
          minify: viteConfig.build.minify,
          target: convertTarget(viteConfig.build.target),
          external: convertExternal(viteConfig.build.rollupOptions?.external),
        })
      }
    } else if (lib.entry && typeof lib.entry === 'object') {
      for (const [name, entry] of Object.entries(lib.entry)) {
        entries.push({
          type: 'bundle',
          input: entry,
          format: convertFormats(lib.formats),
          globalName: lib.name || name,
          minify: viteConfig.build.minify,
          target: convertTarget(viteConfig.build.target),
          external: convertExternal(viteConfig.build.rollupOptions?.external),
        })
      }
    }

    if (entries.length > 0) {
      config.entries = entries
    }
  }

  return config
}

/**
 * Convert Vite formats to robuild formats
 */
function convertFormats(formats?: string[]): any[] | undefined {
  if (!formats) return undefined

  const formatMap: Record<string, string> = {
    es: 'esm',
    cjs: 'cjs',
    umd: 'umd',
    iife: 'iife',
  }

  return formats.map(format => formatMap[format] || format).filter(Boolean)
}

/**
 * Convert Vite target to robuild target
 */
function convertTarget(target?: string): import('../types').Target | undefined {
  if (!target) return undefined

  // Map common Vite targets to robuild targets
  const targetMap: Record<string, import('../types').Target> = {
    es2015: 'es2015',
    es2016: 'es2016',
    es2017: 'es2017',
    es2018: 'es2018',
    es2019: 'es2019',
    es2020: 'es2020',
    es2021: 'es2021',
    es2022: 'es2022',
    esnext: 'esnext',
  }

  return targetMap[target as keyof typeof targetMap] || undefined
}

/**
 * Convert Vite external config to robuild external
 */
function convertExternal(external?: string[] | ((id: string) => boolean)): string[] | ((id: string) => boolean) | undefined {
  return external
}
