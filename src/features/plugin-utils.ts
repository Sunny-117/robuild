import type { Plugin as RolldownPlugin } from 'rolldown'
import type { RobuildPlugin, RobuildPluginContext, RobuildPluginFactory } from '../types'

/**
 * Helper function to call a rolldown plugin hook safely
 */
function callHook(hook: any, ...args: any[]): any {
  if (typeof hook === 'function') {
    return hook(...args)
  }
  if (hook && typeof hook.handler === 'function') {
    return hook.handler(...args)
  }
  return null
}

/**
 * Create a robuild plugin with enhanced hooks
 */
export function createRobuildPlugin(
  name: string,
  hooks: Partial<RobuildPlugin>,
): RobuildPlugin {
  return {
    name,
    meta: {
      framework: 'robuild',
      robuild: true,
    },
    ...hooks,
  }
}

/**
 * Create a plugin factory function
 */
export function createPluginFactory<T = any>(
  name: string,
  factory: (options?: T) => Partial<RobuildPlugin>,
): RobuildPluginFactory<T> {
  return (options?: T) => createRobuildPlugin(name, factory(options))
}

/**
 * Extend a rolldown plugin with robuild-specific hooks
 */
export function extendRolldownPlugin(
  plugin: RolldownPlugin,
  robuildHooks: {
    robuildSetup?: (context: RobuildPluginContext) => void | Promise<void>
    robuildBuildStart?: (context: RobuildPluginContext) => void | Promise<void>
    robuildBuildEnd?: (context: RobuildPluginContext, result?: any) => void | Promise<void>
  },
): RobuildPlugin {
  return {
    ...plugin,
    ...robuildHooks,
    meta: {
      ...(plugin as any).meta,
      framework: 'robuild',
      robuild: true,
      rollup: true,
    },
  }
}

/**
 * Create a simple transform plugin
 */
export function createTransformPlugin(
  name: string,
  transform: (code: string, id: string, context: RobuildPluginContext) => string | null | Promise<string | null>,
  filter?: RegExp,
): RobuildPlugin {
  return createRobuildPlugin(name, {
    transform: async (code: string, id: string) => {
      if (filter && !filter.test(id)) {
        return null
      }
      const result = await transform(code, id, {} as RobuildPluginContext)
      return result ? { code: result } : null
    },
  })
}

/**
 * Create a simple load plugin
 */
export function createLoadPlugin(
  name: string,
  load: (id: string, context: RobuildPluginContext) => string | null | Promise<string | null>,
  filter?: RegExp,
): RobuildPlugin {
  return createRobuildPlugin(name, {
    load: async (id: string) => {
      if (filter && !filter.test(id)) {
        return null
      }
      return await load(id, {} as RobuildPluginContext)
    },
  })
}

/**
 * Create a simple resolve plugin
 */
export function createResolvePlugin(
  name: string,
  resolveId: (id: string, importer: string | undefined, context: RobuildPluginContext) => string | null | Promise<string | null>,
  filter?: RegExp,
): RobuildPlugin {
  return createRobuildPlugin(name, {
    resolveId: async (id: string, importer?: string) => {
      if (filter && !filter.test(id)) {
        return null
      }
      return await resolveId(id, importer, {} as RobuildPluginContext)
    },
  })
}

/**
 * Combine multiple plugins into one
 */
export function combinePlugins(name: string, plugins: RobuildPlugin[]): RobuildPlugin {
  const combinedPlugin: RobuildPlugin = {
    name,
    meta: {
      framework: 'robuild',
      robuild: true,
    },
  }

  // Combine hooks from all plugins
  for (const plugin of plugins) {
    // Standard rolldown hooks
    if (plugin.buildStart) {
      const prevHook = combinedPlugin.buildStart
      combinedPlugin.buildStart = async (opts) => {
        if (prevHook)
          await callHook(prevHook, opts)
        await callHook(plugin.buildStart!, opts)
      }
    }

    if (plugin.buildEnd) {
      const prevHook = combinedPlugin.buildEnd
      combinedPlugin.buildEnd = async (error) => {
        if (prevHook)
          await callHook(prevHook, error)
        await callHook(plugin.buildEnd!, error)
      }
    }

    if (plugin.resolveId) {
      const prevHook = combinedPlugin.resolveId
      combinedPlugin.resolveId = async (id, importer) => {
        if (prevHook) {
          const result = await callHook(prevHook, id, importer)
          if (result)
            return result
        }
        return await callHook(plugin.resolveId!, id, importer)
      }
    }

    if (plugin.load) {
      const prevHook = combinedPlugin.load
      combinedPlugin.load = async (id) => {
        if (prevHook) {
          const result = await callHook(prevHook, id)
          if (result)
            return result
        }
        return await callHook(plugin.load!, id)
      }
    }

    if (plugin.transform) {
      const prevHook = combinedPlugin.transform
      combinedPlugin.transform = async (code, id) => {
        let currentCode = code
        if (prevHook) {
          const result = await callHook(prevHook, currentCode, id)
          if (result) {
            currentCode = typeof result === 'string' ? result : result.code
          }
        }
        const result = await callHook(plugin.transform!, currentCode, id)
        return result
      }
    }

    // Robuild-specific hooks
    if (plugin.robuildSetup) {
      const prevHook = combinedPlugin.robuildSetup
      combinedPlugin.robuildSetup = async (context) => {
        if (prevHook)
          await prevHook(context)
        await plugin.robuildSetup!(context)
      }
    }

    if (plugin.robuildBuildStart) {
      const prevHook = combinedPlugin.robuildBuildStart
      combinedPlugin.robuildBuildStart = async (context) => {
        if (prevHook)
          await prevHook(context)
        await plugin.robuildBuildStart!(context)
      }
    }

    if (plugin.robuildBuildEnd) {
      const prevHook = combinedPlugin.robuildBuildEnd
      combinedPlugin.robuildBuildEnd = async (context, result) => {
        if (prevHook)
          await prevHook(context, result)
        await plugin.robuildBuildEnd!(context, result)
      }
    }
  }

  return combinedPlugin
}
