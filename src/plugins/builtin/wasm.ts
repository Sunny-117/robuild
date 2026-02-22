import type { Plugin } from 'rolldown'
import type { WasmOptions } from '../../types'

/**
 * Default WASM configuration
 */
export const DEFAULT_WASM_CONFIG: Required<WasmOptions> = {
  enabled: true,
  maxFileSize: 14 * 1024, // 14KB
  fileName: '[hash][extname]',
  publicPath: '',
  targetEnv: 'auto',
}

/**
 * Normalize WASM configuration
 */
export function normalizeWasmConfig(config: boolean | WasmOptions | undefined): WasmOptions | null {
  if (!config) {
    return null
  }

  if (config === true) {
    return { ...DEFAULT_WASM_CONFIG }
  }

  if (!config.enabled) {
    return null
  }

  return {
    ...DEFAULT_WASM_CONFIG,
    ...config,
  }
}

/**
 * Create WASM plugin for robuild
 *
 * This is a wrapper that dynamically imports rolldown-plugin-wasm
 * to avoid making it a required dependency.
 *
 * @param config WASM configuration options
 * @returns Rolldown plugin for WASM support
 */
export async function createWasmPlugin(config: WasmOptions): Promise<Plugin | null> {
  try {
    // Dynamically import the wasm plugin to make it optional
    const { wasm } = await import('rolldown-plugin-wasm')

    return wasm({
      maxFileSize: config.maxFileSize,
      fileName: config.fileName,
      publicPath: config.publicPath,
      targetEnv: config.targetEnv,
    }) as Plugin
  }
  catch (error) {
    // If the plugin is not installed, return null and let the caller handle it
    if ((error as NodeJS.ErrnoException).code === 'ERR_MODULE_NOT_FOUND') {
      return null
    }
    throw error
  }
}

/**
 * Check if rolldown-plugin-wasm is installed
 */
export async function isWasmPluginAvailable(): Promise<boolean> {
  try {
    await import('rolldown-plugin-wasm')
    return true
  }
  catch {
    return false
  }
}
