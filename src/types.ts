import type { ResolveOptions } from 'exsolve'

import type { MinifyOptions as OXCMinifyOptions } from 'oxc-minify'
import type { TransformOptions } from 'oxc-transform'
import type {
  InputOptions,
  MinifyOptions,
  OutputOptions,
  RolldownBuild,
  RolldownPluginOption,
} from 'rolldown'
import type { Options as DtsOptions } from 'rolldown-plugin-dts'

export type OutputFormat = 'esm' | 'cjs' | 'iife' | 'umd'
export type Platform = 'browser' | 'node' | 'neutral'
export type Target = 'es5' | 'es2015' | 'es2016' | 'es2017' | 'es2018' | 'es2019' | 'es2020' | 'es2021' | 'es2022' | 'esnext'

export interface BuildContext {
  pkgDir: string
  pkg: { name: string } & Record<string, unknown>
}

export interface _BuildEntry {
  /**
   * Output directory relative to project root.
   *
   * Defaults to `dist/` if not provided.
   */
  outDir?: string

  /**
   * Avoid actual build but instead link to the source files.
   */
  stub?: boolean

  /**
   * Output format(s) for the build.
   *
   * Defaults to `['esm']` if not provided.
   */
  format?: OutputFormat | OutputFormat[]

  /**
   * Target platform for the build.
   *
   * Defaults to `'node'` if not provided.
   */
  platform?: Platform

  /**
   * Target ES version for the build.
   *
   * Defaults to `'es2022'` if not provided.
   */
  target?: Target

  /**
   * Global variable name for IIFE/UMD formats.
   */
  globalName?: string

  /**
   * Module path aliases.
   *
   * Allows defining path mappings for imports.
   */
  alias?: Record<string, string>

  /**
   * Clean output directory before build.
   *
   * Defaults to `true` if not provided.
   */
  clean?: boolean | string[]

  /**
   * Environment variables to inject at compile time.
   */
  env?: Record<string, any>

  /**
   * Define constants to replace at compile time.
   */
  define?: Record<string, string>

  /**
   * External dependencies that should not be bundled.
   */
  external?: (string | RegExp)[] | ((id: string, importer?: string) => boolean)

  /**
   * Dependencies that should be bundled even if they're in node_modules.
   */
  noExternal?: (string | RegExp)[] | ((id: string, importer?: string) => boolean)
}

export type BundleEntry = _BuildEntry & {
  type: 'bundle'

  /**
   * Entry point(s) to bundle relative to the project root.
   */
  input: string | string[]

  /**
   * Minify the output using rolldown.
   *
   * Defaults to `false` if not provided.
   */
  minify?: boolean | 'dce-only' | MinifyOptions

  /**
   * Options passed to rolldown.
   *
   * See [rolldown config options](https://rolldown.rs/reference/config-options) for more details.
   */
  rolldown?: InputOptions & { plugins?: RolldownPluginOption[] }

  /**
   * Declaration generation options.
   *
   * See [rolldown-plugin-dts](https://github.com/sxzz/rolldown-plugin-dts) for more details.
   *
   * Options are inferred from the `tsconfig.json` file if available.
   *
   * Set to `false` to disable.
   */
  dts?: boolean | DtsOptions
}

export type TransformEntry = _BuildEntry & {
  type: 'transform'

  /**
   * Directory to transform relative to the project root.
   */
  input: string

  /**
   * Minify the output using oxc-minify.
   *
   * Defaults to `false` if not provided.
   */
  minify?: boolean | OXCMinifyOptions

  /**
   * Options passed to oxc-transform.
   *
   * See [oxc-transform](https://www.npmjs.com/package/oxc-transform) for more details.
   */
  oxc?: TransformOptions

  /**
   * Options passed to exsolve for module resolution.
   *
   * See [exsolve](https://github.com/unjs/exsolve) for more details.
   */
  resolve?: Omit<ResolveOptions, 'from'>
}

export type BuildEntry = BundleEntry | TransformEntry

export interface BuildHooks {
  start?: (ctx: BuildContext) => void | Promise<void>
  end?: (ctx: BuildContext) => void | Promise<void>
  entries?: (entries: BuildEntry[], ctx: BuildContext) => void | Promise<void>
  rolldownConfig?: (
    cfg: InputOptions,
    ctx: BuildContext,
  ) => void | Promise<void>
  rolldownOutput?: (
    cfg: OutputOptions,
    res: RolldownBuild,
    ctx: BuildContext,
  ) => void | Promise<void>
}

export interface WatchOptions {
  /**
   * Enable watch mode.
   *
   * Defaults to `false` if not provided.
   */
  enabled?: boolean

  /**
   * Glob patterns for files to watch.
   *
   * Defaults to watching all source files if not provided.
   */
  include?: string[]

  /**
   * Glob patterns for files to ignore.
   *
   * Defaults to common ignore patterns if not provided.
   */
  exclude?: string[]

  /**
   * Delay in milliseconds before rebuilding after a file change.
   *
   * Defaults to `100` if not provided.
   */
  delay?: number

  /**
   * Whether to ignore the initial build when starting watch mode.
   *
   * Defaults to `false` if not provided.
   */
  ignoreInitial?: boolean

  /**
   * Whether to watch for new files being added.
   *
   * Defaults to `true` if not provided.
   */
  watchNewFiles?: boolean
}

export interface BuildConfig {
  cwd?: string | URL
  entries?: (BuildEntry | string)[]
  hooks?: BuildHooks
  watch?: WatchOptions
}
