import type { Plugin as RolldownPlugin } from 'rolldown'
import type {
  BuildConfig,
  BuildEntry,
  RobuildPlugin,
  RobuildPluginContext,
  RobuildPluginOption,
} from '../types'

/**
 * Simplified plugin manager that leverages rolldown's plugin system
 */
export class RobuildPluginManager {
  private plugins: RobuildPlugin[] = []
  private context: RobuildPluginContext

  constructor(config: BuildConfig, entry: BuildEntry, pkgDir: string) {
    this.context = {
      config,
      entry,
      pkgDir,
      outDir: entry.outDir || 'dist',
      format: entry.format || 'es',
      platform: entry.platform || 'node',
      target: entry.target || 'es2022',
    }
    this.plugins = this.normalizePlugins(config.plugins || [])
  }

  /**
   * Normalize plugin options to RobuildPlugin instances
   */
  private normalizePlugins(pluginOptions: RobuildPluginOption[]): RobuildPlugin[] {
    return pluginOptions.map(pluginOption => this.normalizePlugin(pluginOption))
  }

  /**
   * Normalize a single plugin option
   */
  private normalizePlugin(pluginOption: RobuildPluginOption): RobuildPlugin {
    // If it's a function (plugin factory), call it
    if (typeof pluginOption === 'function') {
      return this.normalizePlugin(pluginOption())
    }

    // If it's already a plugin object
    if (typeof pluginOption === 'object' && pluginOption !== null) {
      // Check if it's already a RobuildPlugin
      if (this.isRobuildPlugin(pluginOption)) {
        return pluginOption
      }

      // Check if it's a rolldown/rollup plugin
      if (this.isRolldownPlugin(pluginOption)) {
        return this.adaptRolldownPlugin(pluginOption)
      }

      // Check if it's a Vite plugin
      if (this.isVitePlugin(pluginOption)) {
        return this.adaptVitePlugin(pluginOption)
      }

      // Check if it's an Unplugin
      if (this.isUnplugin(pluginOption)) {
        return this.adaptUnplugin(pluginOption)
      }

      // Fallback: treat as rolldown plugin
      return this.adaptRolldownPlugin(pluginOption)
    }

    throw new Error(`Invalid plugin option: ${typeof pluginOption}`)
  }

  /**
   * Check if plugin is already a RobuildPlugin
   */
  private isRobuildPlugin(plugin: any): plugin is RobuildPlugin {
    return plugin.meta?.robuild === true
      || plugin.robuildSetup
      || plugin.robuildBuildStart
      || plugin.robuildBuildEnd
  }

  /**
   * Check if plugin is a rolldown/rollup plugin
   */
  private isRolldownPlugin(plugin: any): plugin is RolldownPlugin {
    return plugin.name && (
      plugin.buildStart
      || plugin.buildEnd
      || plugin.resolveId
      || plugin.load
      || plugin.transform
      || plugin.generateBundle
      || plugin.writeBundle
    )
  }

  /**
   * Check if plugin is a Vite plugin
   */
  private isVitePlugin(plugin: any): boolean {
    return plugin.config
      || plugin.configResolved
      || plugin.configureServer
      || plugin.meta?.vite === true
  }

  /**
   * Check if plugin is an Unplugin
   */
  private isUnplugin(plugin: any): boolean {
    return plugin.unplugin === true
      || plugin.meta?.unplugin === true
  }

  /**
   * Adapt rolldown plugin to RobuildPlugin
   */
  private adaptRolldownPlugin(plugin: RolldownPlugin): RobuildPlugin {
    return {
      ...plugin,
      meta: {
        ...(plugin as any).meta,
        framework: 'rolldown',
        robuild: true,
        rollup: true,
      },
    }
  }

  /**
   * Adapt Vite plugin to RobuildPlugin
   */
  private adaptVitePlugin(plugin: any): RobuildPlugin {
    return {
      ...plugin,
      meta: {
        ...plugin.meta,
        framework: 'vite',
        robuild: true,
        vite: true,
      },
    }
  }

  /**
   * Adapt Unplugin to RobuildPlugin
   */
  private adaptUnplugin(plugin: any): RobuildPlugin {
    return {
      ...plugin,
      meta: {
        ...plugin.meta,
        framework: 'unplugin',
        robuild: true,
        unplugin: true,
        rollup: true,
        vite: true,
        webpack: true,
        esbuild: true,
      },
    }
  }

  /**
   * Initialize robuild-specific plugin hooks
   */
  async initializeRobuildHooks(): Promise<void> {
    for (const plugin of this.plugins) {
      if (plugin.robuildSetup) {
        await plugin.robuildSetup(this.context)
      }
    }
  }

  /**
   * Execute robuild buildStart hooks
   */
  async executeRobuildBuildStart(): Promise<void> {
    for (const plugin of this.plugins) {
      if (plugin.robuildBuildStart) {
        await plugin.robuildBuildStart(this.context)
      }
    }
  }

  /**
   * Execute robuild buildEnd hooks
   */
  async executeRobuildBuildEnd(result?: any): Promise<void> {
    for (const plugin of this.plugins) {
      if (plugin.robuildBuildEnd) {
        await plugin.robuildBuildEnd(this.context, result)
      }
    }
  }

  /**
   * Get rolldown-compatible plugins for direct use
   */
  getRolldownPlugins(): RolldownPlugin[] {
    return this.plugins.map((plugin) => {
      // Remove robuild-specific properties for rolldown compatibility
      const { robuildSetup: _setup, robuildBuildStart: _start, robuildBuildEnd: _end, ...rolldownPlugin } = plugin
      return rolldownPlugin
    })
  }

  /**
   * Get all plugins
   */
  getPlugins(): RobuildPlugin[] {
    return this.plugins
  }

  /**
   * Update context (useful when build parameters change)
   */
  updateContext(updates: Partial<RobuildPluginContext>): void {
    this.context = { ...this.context, ...updates }
  }
}
