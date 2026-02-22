/// <reference path="../types/lightningcss.d.ts" />
import type { Targets } from 'lightningcss'

/**
 * Converts esbuild target (which is also used by Rolldown) to Lightning CSS targets.
 *
 * @see https://esbuild.github.io/api/#target
 * @see https://github.com/rolldown/rolldown/blob/v1.0.0-beta.8/packages/rolldown/src/binding.d.ts#L1429-L1431
 * @see https://lightningcss.dev/transpilation.html
 *
 * @param target - Array of esbuild-format target strings (e.g., ['chrome90', 'firefox88'])
 * @returns LightningCSS targets object or undefined if no valid targets found
 */
export function esbuildTargetToLightningCSS(
  target: string[],
): Targets | undefined {
  let targets: Targets | undefined

  const targetString = target.join(' ').toLowerCase()
  const matches = [...targetString.matchAll(TARGET_REGEX)]

  for (const match of matches) {
    // The name in the esbuild target format.
    const name = match[1]
    // The browser name in Lightning CSS targets format.
    const browser = ESBUILD_LIGHTNINGCSS_MAPPING[name]
    if (!browser) {
      continue
    }

    // The version string.
    const version = match[2]
    // An integer representing the major, minor, and patch version numbers in
    // Lightning CSS targets format.
    const versionInt = parseVersion(version)
    if (versionInt == null) {
      continue
    }

    targets = targets || {}
    targets[browser] = versionInt
  }

  return targets
}

const TARGET_REGEX = /([a-z]+)(\d+(?:\.\d+)*)/g

/**
 * A mapping from the name in the esbuild target format to the browser name in
 * Lightning CSS targets format.
 */
const ESBUILD_LIGHTNINGCSS_MAPPING: Record<string, keyof Targets> = {
  chrome: 'chrome',
  edge: 'edge',
  firefox: 'firefox',
  ie: 'ie',
  ios: 'ios_saf',
  opera: 'opera',
  safari: 'safari',
}

/**
 * Parse version string to LightningCSS version integer format.
 *
 * The version is encoded as: (major << 16) | (minor << 8) | patch
 *
 * @see https://github.com/parcel-bundler/lightningcss/blob/v1.29.3/node/browserslistToTargets.js#L35-L46
 */
function parseVersion(version: string): number | null {
  const [major, minor = 0, patch = 0] = version
    .split('-')[0]
    .split('.')
    .map(v => Number.parseInt(v, 10))

  if (Number.isNaN(major) || Number.isNaN(minor) || Number.isNaN(patch)) {
    return null
  }

  return (major << 16) | (minor << 8) | patch
}
