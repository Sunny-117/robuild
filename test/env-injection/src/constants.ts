export const isDev = __DEV__
export const buildMode = BUILD_MODE
export const debugLevel = DEBUG_LEVEL
export const featureFlag = FEATURE_FLAG

export function getConstants() {
  return {
    isDev,
    buildMode,
    debugLevel,
    featureFlag,
  }
}
