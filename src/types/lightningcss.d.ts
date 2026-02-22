/**
 * Type declarations for lightningcss
 *
 * These are minimal type definitions for the parts of lightningcss we use.
 * For full type support, install lightningcss as a dependency.
 */

declare module 'lightningcss' {
  export interface Targets {
    chrome?: number
    edge?: number
    firefox?: number
    ie?: number
    ios_saf?: number
    opera?: number
    safari?: number
    android?: number
    samsung?: number
  }
}

declare module 'unplugin-lightningcss/rolldown' {
  import type { Plugin } from 'rolldown'
  import type { Targets } from 'lightningcss'

  interface LightningCSSOptions {
    options?: {
      targets?: Targets
    }
  }

  export default function lightningcss(options?: LightningCSSOptions): Plugin
}
