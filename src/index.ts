export { build } from './build'

export { defineConfig } from './config'

export * from './plugins'

// CSS processing utilities
export { resolveCssOptions } from './features/css'
export { createLightningCSSPlugin } from './features/css/lightningcss'
export { createCssCodeSplitPlugin } from './features/css/splitting'
export type { CssOptions } from './features/css'
export type { LightningCSSPluginOptions } from './features/css/lightningcss'

// LightningCSS target conversion utility
export { esbuildTargetToLightningCSS } from './utils/lightningcss'

export type {
  BuildConfig,
  BuildEntry,
  BundleEntry,
  ExportsConfig,
  RobuildPlugin,
  TransformEntry,
} from './types'
