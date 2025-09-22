
          export const welcomeMessage: string = `Welcome to ${APP_NAME} v${process.env.VERSION}!`
          export const buildInfo: string = `Built on ${BUILD_DATE} in ${BUILD_MODE} mode`
          
          export function getBuildInfo(): string {
            return `${APP_NAME} v${process.env.VERSION} (${BUILD_MODE})`
          }
        