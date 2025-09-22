
          export const appVersion: string = process.env.APP_VERSION || '0.0.0'
          export const isProduction: boolean = IS_PRODUCTION
          export const buildTime: string = BUILD_TIME
          
          export function getMixedConfig() {
            return { appVersion, isProduction, buildTime }
          }
        