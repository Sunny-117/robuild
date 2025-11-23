import type { ResolveOptions } from 'exsolve'

import type { MinifyOptions as OXCMinifyOptions } from 'oxc-minify'
import type { TransformOptions } from 'oxc-transform'
import type {
  InputOptions,
  MinifyOptions,
  OutputOptions,
  RolldownBuild,
  Plugin as RolldownPlugin,
  RolldownPluginOption,
} from 'rolldown'
import type { Options as DtsOptions } from 'rolldown-plugin-dts'

export type OutputFormat = 'esm' | 'cjs' | 'iife' | 'umd'
export type Platform = 'browser' | 'node' | 'neutral'
export type Target = 'es5' | 'es2015' | 'es2016' | 'es2017' | 'es2018' | 'es2019' | 'es2020' | 'es2021' | 'es2022' | 'esnext'

// Copy functionality types
export interface CopyEntry {
  from: string
  to: string
}

export type CopyOptions = Array<string | CopyEntry>

// Banner/Footer types
export type ChunkAddon = string | Record<string, string>

// Output extensions types
export type OutExtensionFactory = (format: OutputFormat) => {
  js?: string
  dts?: string
}

// Loader types
export type LoaderType = 'js' | 'jsx' | 'ts' | 'tsx' | 'json' | 'css' | 'text' | 'binary' | 'file' | 'dataurl' | 'empty'

export interface LoaderConfig {
  loader: LoaderType
  options?: Record<string, any>
}

// Shims types
export interface ShimsConfig {
  /**
   * Enable __dirname and __filename shims for ESM.
   *
   * @default true
   */
  dirname?: boolean

  /**
   * Enable require() shim for ESM.
   *
   * @default true
   */
  require?: boolean

  /**
   * Enable module.exports shim for ESM.
   *
   * @default true
   */
  exports?: boolean

  /**
   * Enable process.env shim for browser.
   *
   * @default false
   */
  env?: boolean
}

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
   * Copy files to output directory.
   *
   * @example
   * ```ts
   * copy: ['src/assets', { from: 'src/assets', to: 'dist/assets' }]
   * ```
   */
  copy?: CopyOptions

  /**
   * Add banner/footer to output files.
   *
   * @example
   * ```ts
   * banner: '// Copyright 2024'
   * footer: '// End of file'
   * ```
   */
  banner?: string | ChunkAddon
  footer?: string | ChunkAddon

  /**
   * Add content hash to output filenames.
   *
   * @default false
   */
  hash?: boolean

  /**
   * Use fixed extensions (.cjs/.mjs) for output files.
   *
   * @default false
   */
  fixedExtension?: boolean

  /**
   * Custom output file extensions.
   */
  outExtensions?: OutExtensionFactory

  /**
   * Handle Node.js protocol imports.
   *
   * - `true`: Add `node:` prefix to built-in modules
   * - `'strip'`: Remove `node:` prefix from imports
   * - `false`: Keep imports unchanged
   *
   * @default false
   */
  nodeProtocol?: 'strip' | boolean

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
   * Generate source maps for built files.
   *
   * - `true` - emit separate `.map` files
   * - `'inline'` - embed source maps in generated files
   * - `'hidden'` - emit map files but do not add sourceMappingURL comment
   */
  sourcemap?: boolean | 'inline' | 'hidden' | Record<string, any>

  /**
   * External dependencies that should not be bundled.
   */
  external?: (string | RegExp)[] | ((id: string, importer?: string) => boolean)

  /**
   * Dependencies that should be bundled even if they're in node_modules.
   */
  noExternal?: (string | RegExp)[] | ((id: string, importer?: string) => boolean)

  /**
   * File type loaders configuration.
   */
  loaders?: Record<string, LoaderConfig>

  /**
   * CommonJS default export handling.
   *
   * - `true`: Preserve CommonJS default exports
   * - `false`: Transform to ES module default exports
   * - `'auto'`: Auto-detect based on file content
   *
   * @default 'auto'
   */
  cjsDefault?: boolean | 'auto'

  /**
   * Enable CJS/ESM compatibility shims.
   *
   * @default false
   */
  shims?: boolean | ShimsConfig

  /**
   * Skip bundling node_modules dependencies.
   *
   * @default false
   */
  skipNodeModules?: boolean

  /**
   * Unbundle mode - preserve file structure without bundling.
   *
   * @default false
   */
  unbundle?: boolean
}

export type BundleEntry = _BuildEntry & {
  type: 'bundle'

  /**
   * Entry point(s) to bundle relative to the project root.
   *
   * Supports multiple formats:
   * - Single file: `'src/index.ts'`
   * - Multiple files: `['src/index.ts', 'src/cli.ts']`
   * - Named entries: `{ index: 'src/index.ts', cli: 'src/cli.ts' }`
   *
   * @alias entry (tsup compatibility)
   */
  input?: string | string[] | Record<string, string>

  /**
   * Entry point(s) to bundle (tsup-style alias for `input`)
   *
   * @alias input
   */
  entry?: string | string[] | Record<string, string>

  /**
   * Minify the output using rolldown.
   *
   * Defaults to `false` if not provided.
   */
  minify?: boolean | 'dce-only' | MinifyOptions

  /**
   * Enable code splitting.
   *
   * When enabled, shared code will be extracted into separate chunks.
   *
   * @default false
   */
  splitting?: boolean

  /**
   * Tree shaking configuration.
   *
   * - `true`: Enable tree shaking (default)
   * - `false`: Disable tree shaking
   * - Object: Pass directly to Rolldown's treeshake option
   *
   * @default true
   */
  treeshake?: boolean | InputOptions['treeshake']

  /**
   * Inject environment variables at build time.
   *
   * @example
   * ```ts
   * env: {
   *   NODE_ENV: 'production',
   *   API_URL: 'https://api.example.com'
   * }
   * ```
   */
  env?: Record<string, string>

  /**
   * Advanced rolldown configuration.
   *
   * This allows passing any rolldown InputOptions and OutputOptions directly.
   * These options have the highest priority and will override other robuild settings.
   *
   * Use with caution as it may conflict with robuild's built-in features.
   *
   * See [rolldown config options](https://rolldown.rs/reference/config-options) for more details.
   *
   * @example
   * ```ts
   * {
   *   rolldown: {
   *     treeshake: false,
   *     logLevel: 'debug',
   *     plugins: [customPlugin()],
   *     output: {
   *       generatedCode: { arrowFunctions: true }
   *     }
   *   }
   * }
   * ```
   */
  rolldown?: Partial<InputOptions> & {
    plugins?: RolldownPluginOption[]
    output?: Partial<OutputOptions>
  }

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

  /**
   * Only generate declaration files without JavaScript output.
   *
   * @default false
   */
  dtsOnly?: boolean
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

/**
 * Robuild plugin extends rolldown plugin with additional hooks
 */
export interface RobuildPlugin extends RolldownPlugin {
  // Robuild-specific hooks for build lifecycle
  robuildSetup?: (context: RobuildPluginContext) => void | Promise<void>
  robuildBuildStart?: (context: RobuildPluginContext) => void | Promise<void>
  robuildBuildEnd?: (context: RobuildPluginContext, result?: any) => void | Promise<void>

  // Plugin metadata for compatibility detection
  meta?: {
    framework?: 'rolldown' | 'rollup' | 'vite' | 'unplugin' | 'robuild'
    robuild?: boolean
    rollup?: boolean
    vite?: boolean
    webpack?: boolean
    esbuild?: boolean
    unplugin?: boolean
  }
}

/**
 * Context provided to robuild-specific plugin hooks
 */
export interface RobuildPluginContext {
  config: BuildConfig
  entry: BuildEntry
  pkgDir: string
  outDir: string
  format: OutputFormat | OutputFormat[]
  platform: Platform
  target: string
}

/**
 * Plugin factory function type
 */
export type RobuildPluginFactory<T = any> = (options?: T) => RobuildPlugin

/**
 * Union type for all supported plugin types
 */
export type RobuildPluginOption
  = | RobuildPlugin
    | RolldownPlugin
    | RobuildPluginFactory
    | any // For external plugins (rollup/vite/unplugin)

// Glob import types
export interface GlobImportOptions {
  /**
   * Enable glob imports support
   * @default false
   */
  enabled?: boolean

  /**
   * Glob patterns to match
   * @default ['**\/*']
   */
  patterns?: string[]

  /**
   * Whether to import as URLs
   * @default false
   */
  asUrls?: boolean

  /**
   * Whether to import eagerly
   * @default false
   */
  eager?: boolean
}

export interface BuildHooks {
  /**
   * Called at the start of the build process
   */
  start?: (ctx: BuildContext) => void | Promise<void>

  /**
   * Called at the end of the build process
   */
  end?: (ctx: BuildContext) => void | Promise<void>

  /**
   * Called after entries are normalized
   */
  entries?: (entries: BuildEntry[], ctx: BuildContext) => void | Promise<void>

  /**
   * Called before rolldown config is finalized
   */
  rolldownConfig?: (
    cfg: InputOptions,
    ctx: BuildContext,
  ) => void | Promise<void>

  /**
   * Called before rolldown output config is finalized
   */
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

export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'verbose'

export type OnSuccessCallback = string | ((result: BuildResult) => void | Promise<void>)

export interface BuildResult {
  entries: Array<{
    format: OutputFormat
    name: string
    exports: string[]
    deps: string[]
    size: number
    gzipSize: number
    sideEffectSize: number
  }>
  duration: number
}

export interface BuildConfig {
  cwd?: string | URL

  /**
   * Build entries configuration.
   *
   * Supports multiple formats:
   * - Array of entries: `[{ type: 'bundle', input: 'src/index.ts' }]`
   * - String shortcuts: `['src/index.ts']`
   * - Single entry object (tsup-style): omit `entries` and use top-level config
   */
  entries?: (BuildEntry | string)[]

  /**
   * Entry point(s) for tsup-style configuration.
   *
   * When using this, you don't need to specify `entries`.
   *
   * @example
   * ```ts
   * {
   *   entry: ['src/index.ts', 'src/cli.ts'],
   *   format: ['esm', 'cjs'],
   *   dts: true
   * }
   * ```
   */
  entry?: string | string[] | Record<string, string>

  /**
   * Output format(s) for tsup-style configuration.
   *
   * @default ['esm']
   */
  format?: OutputFormat | OutputFormat[]

  /**
   * Output directory for tsup-style configuration.
   *
   * @default 'dist'
   */
  outDir?: string

  /**
   * Target platform for tsup-style configuration.
   *
   * @default 'node'
   */
  platform?: Platform

  /**
   * Target ES version for tsup-style configuration.
   *
   * @default 'es2022'
   */
  target?: Target

  /**
   * Global variable name for IIFE/UMD formats (tsup-style).
   */
  name?: string

  /**
   * Minify output (tsup-style).
   *
   * @default false
   */
  minify?: boolean | 'dce-only' | MinifyOptions

  /**
   * Generate declaration files (tsup-style).
   *
   * @default false
   */
  dts?: boolean | DtsOptions

  /**
   * Only generate declaration files (tsup-style).
   *
   * @default false
   */
  dtsOnly?: boolean

  /**
   * Enable code splitting (tsup-style).
   *
   * @default false
   */
  splitting?: boolean

  /**
   * Tree shaking configuration (tsup-style).
   *
   * @default true
   */
  treeshake?: boolean | InputOptions['treeshake']

  /**
   * Generate source maps (tsup-style).
   *
   * @default false
   */
  sourcemap?: boolean | 'inline' | 'hidden'

  /**
   * External dependencies (tsup-style).
   */
  external?: (string | RegExp)[] | ((id: string, importer?: string) => boolean)

  /**
   * Dependencies to bundle (tsup-style).
   */
  noExternal?: (string | RegExp)[] | ((id: string, importer?: string) => boolean)

  /**
   * Inject environment variables (tsup-style).
   */
  env?: Record<string, string>

  /**
   * Module path aliases (tsup-style).
   */
  alias?: Record<string, string>

  /**
   * Add banner to output files (tsup-style).
   */
  banner?: string | ChunkAddon

  /**
   * Add footer to output files (tsup-style).
   */
  footer?: string | ChunkAddon

  /**
   * Enable shims for Node.js globals (tsup-style).
   */
  shims?: boolean | ShimsConfig

  /**
   * Advanced rolldown configuration (tsup-style).
   *
   * This allows passing any rolldown InputOptions and OutputOptions directly.
   * These options have the highest priority and will override other robuild settings.
   *
   * @see BundleEntry.rolldown
   */
  rolldown?: Partial<InputOptions> & {
    plugins?: RolldownPluginOption[]
    output?: Partial<OutputOptions>
  }

  /**
   * Clean output directory before build.
   */
  clean?: boolean | string[]

  /**
   * Build lifecycle hooks.
   *
   * For plugin-style hooks (buildStart, writeBundle, transform, etc.),
   * use the `plugins` field instead.
   */
  hooks?: BuildHooks

  watch?: WatchOptions

  /**
   * Plugins to use during build.
   *
   * Plugins support all Rolldown plugin hooks (buildStart, writeBundle, transform, etc.)
   * and can be used for custom build logic.
   */
  plugins?: RobuildPluginOption[]

  /**
   * Glob import configuration
   */
  globImport?: GlobImportOptions

  /**
   * Log level for build output.
   *
   * @default 'info'
   */
  logLevel?: LogLevel

  /**
   * Callback to execute after successful build.
   */
  onSuccess?: OnSuccessCallback

  /**
   * Fail build on warnings.
   *
   * @default false
   */
  failOnWarn?: boolean

  /**
   * Additional paths to ignore in watch mode.
   */
  ignoreWatch?: string[]

  /**
   * Load configuration from Vite config file.
   *
   * @default false
   */
  fromVite?: boolean

  /**
   * Package exports generation configuration.
   */
  exports?: ExportsConfig
}

// Exports generation types
export interface ExportsConfig {
  /**
   * Whether to generate package.json exports field.
   */
  enabled?: boolean

  /**
   * Custom exports mapping.
   */
  custom?: Record<string, string | { import?: string, require?: string, types?: string }>

  /**
   * Whether to include types in exports.
   */
  includeTypes?: boolean

  /**
   * Base directory for exports (relative to package root).
   */
  baseDir?: string

  /**
   * Whether to update package.json automatically.
   */
  autoUpdate?: boolean
}
