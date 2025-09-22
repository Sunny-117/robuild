
          export const isDev: boolean = __DEV__
          export const buildMode: string = BUILD_MODE
          export const debugLevel: number = DEBUG_LEVEL
          export const featureFlag: boolean = FEATURE_FLAG
          
          export function getConstants() {
            return { isDev, buildMode, debugLevel, featureFlag }
          }
        