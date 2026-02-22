/**
 * Core module - demonstrates plugin architecture
 */

import type { UserConfig, BuildOptions, EventHandler, Result } from '@types'
import { generateId, deepMerge } from '@utils'

export interface RobuildPlugin {
  name: string
  setup: (ctx: PluginContext) => void | Promise<void>
}

export interface PluginContext {
  config: UserConfig
  options: BuildOptions
  on: <T>(event: string, handler: EventHandler<T>) => void
  emit: <T>(event: string, data: T) => void
}

export interface RobuildOptions {
  name?: string
  plugins?: RobuildPlugin[]
}

export class Robuild {
  readonly name: string
  private plugins: RobuildPlugin[] = []
  private eventHandlers: Map<string, Set<EventHandler<unknown>>> = new Map()
  private config: UserConfig = { name: 'default' }
  private options: BuildOptions = {}

  constructor(options: RobuildOptions = {}) {
    this.name = options.name || `robuild-${generateId()}`
    if (options.plugins) {
      this.plugins = [...options.plugins]
    }
  }

  use(plugin: RobuildPlugin | ((ctx: PluginContext) => void)): this {
    if (typeof plugin === 'function') {
      this.plugins.push({
        name: `anonymous-${generateId()}`,
        setup: plugin,
      })
    } else {
      this.plugins.push(plugin)
    }
    return this
  }

  configure(config: Partial<UserConfig>): this {
    this.config = deepMerge(this.config, config)
    return this
  }

  setOptions(options: Partial<BuildOptions>): this {
    this.options = deepMerge(this.options, options)
    return this
  }

  private createContext(): PluginContext {
    return {
      config: this.config,
      options: this.options,
      on: <T>(event: string, handler: EventHandler<T>) => {
        if (!this.eventHandlers.has(event)) {
          this.eventHandlers.set(event, new Set())
        }
        this.eventHandlers.get(event)!.add(handler as EventHandler<unknown>)
      },
      emit: <T>(event: string, data: T) => {
        const handlers = this.eventHandlers.get(event)
        if (handlers) {
          for (const handler of handlers) {
            handler(data)
          }
        }
      },
    }
  }

  async build(): Promise<Result<{ outputFiles: string[] }>> {
    const ctx = this.createContext()

    // Initialize plugins
    for (const plugin of this.plugins) {
      try {
        await plugin.setup(ctx)
      } catch (error) {
        return {
          success: false,
          error: error as Error,
        }
      }
    }

    // Emit build events
    ctx.emit('build:start', { timestamp: Date.now() })

    // Simulate build process
    const outputFiles = ['dist/index.mjs', 'dist/index.cjs', 'dist/index.d.ts']

    ctx.emit('build:end', { timestamp: Date.now(), outputFiles })

    return {
      success: true,
      data: { outputFiles },
    }
  }
}

export function definePlugin(plugin: RobuildPlugin): RobuildPlugin {
  return plugin
}
