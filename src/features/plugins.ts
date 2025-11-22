import type {
  BuildConfig,
  BuildEntry,
  PluginBuild,
  PluginContext,
  RobuildPlugin,
} from '../types'

/**
 * Plugin manager for handling plugin lifecycle and execution
 */
export class PluginManager {
  private plugins: RobuildPlugin[] = []
  private context: PluginContext

  constructor(config: BuildConfig, entry: BuildEntry) {
    this.context = {
      config,
      entry,
      plugins: config.plugins || [],
      hooks: config.hooks || {},
    }
    this.plugins = config.plugins || []
  }

  /**
   * Initialize all plugins
   */
  async initialize(): Promise<void> {
    for (const plugin of this.plugins) {
      if (plugin.setup) {
        const pluginBuild = this.createPluginBuild()
        await plugin.setup(pluginBuild)
      }
    }
  }

  /**
   * Execute a specific hook across all plugins
   */
  async executeHook(hookName: keyof RobuildPlugin, ...args: any[]): Promise<any[]> {
    const results: any[] = []

    for (const plugin of this.plugins) {
      const hook = plugin[hookName] as (...args: any[]) => any
      if (typeof hook === 'function') {
        try {
          const result = await hook.apply(plugin, args)
          results.push(result)
        }
        catch (error) {
          console.error(`Plugin ${plugin.name} hook ${hookName} failed:`, error)
          throw error
        }
      }
    }

    return results
  }

  /**
   * Create plugin build context for setup
   */
  private createPluginBuild(): PluginBuild {
    const resolveCallbacks: Array<{ filter: RegExp, namespace?: string, callback: (...args: any[]) => any }> = []
    const loadCallbacks: Array<{ filter: RegExp, namespace?: string, callback: (...args: any[]) => any }> = []
    const transformCallbacks: Array<{ filter: RegExp, callback: (...args: any[]) => any }> = []

    return {
      onResolve: (options, callback) => {
        resolveCallbacks.push({ ...options, callback })
      },
      onLoad: (options, callback) => {
        loadCallbacks.push({ ...options, callback })
      },
      onTransform: (options, callback) => {
        transformCallbacks.push({ ...options, callback })
      },
      resolve: async (path: string, options?: any) => {
        // Implement resolve logic
        for (const { filter, callback } of resolveCallbacks) {
          if (filter.test(path)) {
            const result = await callback({ path, ...options })
            if (result)
              return result
          }
        }
        return null
      },
      getConfig: () => this.context.config,
    }
  }

  /**
   * Get all plugins
   */
  getPlugins(): RobuildPlugin[] {
    return this.plugins
  }

  /**
   * Add a plugin
   */
  addPlugin(plugin: RobuildPlugin): void {
    this.plugins.push(plugin)
    this.context.plugins = this.plugins
  }

  /**
   * Remove a plugin by name
   */
  removePlugin(name: string): boolean {
    const index = this.plugins.findIndex(p => p.name === name)
    if (index !== -1) {
      this.plugins.splice(index, 1)
      this.context.plugins = this.plugins
      return true
    }
    return false
  }
}

/**
 * Create a Rollup plugin adapter for robuild
 */
export function createRollupPluginAdapter(rollupPlugin: any): RobuildPlugin {
  const plugin: RobuildPlugin = {
    name: rollupPlugin.name || 'rollup-plugin',
    meta: {
      framework: 'rollup',
      rollup: true,
    },
  }

  // Map Rollup hooks to robuild hooks
  if (rollupPlugin.buildStart) {
    plugin.buildStart = rollupPlugin.buildStart
  }
  if (rollupPlugin.buildEnd) {
    plugin.buildEnd = rollupPlugin.buildEnd
  }
  if (rollupPlugin.resolveId) {
    plugin.resolveId = rollupPlugin.resolveId
  }
  if (rollupPlugin.load) {
    plugin.load = rollupPlugin.load
  }
  if (rollupPlugin.transform) {
    plugin.transform = rollupPlugin.transform
  }
  if (rollupPlugin.generateBundle) {
    plugin.generateBundle = rollupPlugin.generateBundle
  }
  if (rollupPlugin.writeBundle) {
    plugin.writeBundle = rollupPlugin.writeBundle
  }

  return plugin
}

/**
 * Create a Vite plugin adapter for robuild
 */
export function createVitePluginAdapter(vitePlugin: any): RobuildPlugin {
  const plugin: RobuildPlugin = {
    name: vitePlugin.name || 'vite-plugin',
    meta: {
      framework: 'vite',
      vite: true,
    },
  }

  // Map Vite hooks to robuild hooks
  if (vitePlugin.buildStart) {
    plugin.buildStart = vitePlugin.buildStart
  }
  if (vitePlugin.buildEnd) {
    plugin.buildEnd = vitePlugin.buildEnd
  }
  if (vitePlugin.resolveId) {
    plugin.resolveId = vitePlugin.resolveId
  }
  if (vitePlugin.load) {
    plugin.load = vitePlugin.load
  }
  if (vitePlugin.transform) {
    plugin.transform = vitePlugin.transform
  }
  if (vitePlugin.config) {
    plugin.config = vitePlugin.config
  }
  if (vitePlugin.configResolved) {
    plugin.configResolved = vitePlugin.configResolved
  }

  return plugin
}

/**
 * Create an Unplugin adapter for robuild
 */
export function createUnpluginAdapter(unplugin: any): RobuildPlugin {
  const plugin: RobuildPlugin = {
    name: unplugin.name || 'unplugin',
    unplugin: true,
    meta: {
      framework: 'unplugin',
      rollup: true,
      vite: true,
      webpack: true,
      esbuild: true,
    },
  }

  // Unplugin provides a unified interface
  if (unplugin.buildStart) {
    plugin.buildStart = unplugin.buildStart
  }
  if (unplugin.buildEnd) {
    plugin.buildEnd = unplugin.buildEnd
  }
  if (unplugin.resolveId) {
    plugin.resolveId = unplugin.resolveId
  }
  if (unplugin.load) {
    plugin.load = unplugin.load
  }
  if (unplugin.transform) {
    plugin.transform = unplugin.transform
  }

  return plugin
}

/**
 * Detect plugin type and create appropriate adapter
 */
export function adaptPlugin(plugin: any): RobuildPlugin {
  // If it's already a robuild plugin, return as-is
  if (plugin.name && (plugin.setup || plugin.buildStart || plugin.resolveId)) {
    return plugin as RobuildPlugin
  }

  // Check for unplugin
  if (plugin.unplugin || plugin.meta?.unplugin) {
    return createUnpluginAdapter(plugin)
  }

  // Check for Vite plugin
  if (plugin.config || plugin.configResolved || plugin.configureServer) {
    return createVitePluginAdapter(plugin)
  }

  // Default to Rollup plugin
  return createRollupPluginAdapter(plugin)
}

/**
 * Load and adapt plugins from configuration
 */
export function loadPlugins(plugins: any[]): RobuildPlugin[] {
  return plugins.map((plugin) => {
    if (typeof plugin === 'function') {
      // Plugin factory function
      return adaptPlugin(plugin())
    }
    return adaptPlugin(plugin)
  })
}
