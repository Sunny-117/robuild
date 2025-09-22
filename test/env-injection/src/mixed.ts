export const appVersion = process.env.APP_VERSION || '0.0.0'
export const isProduction = IS_PRODUCTION

export function getMixedConfig() {
  return {
    appVersion,
    isProduction,
  }
}
