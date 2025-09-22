
          export function logger(message: string): void {
            if (__DEV__) {
              console.log(`[DEBUG] ${message}`)
            }
          }
          
          export const features = {
            analytics: ENABLE_ANALYTICS,
            experiments: ENABLE_EXPERIMENTS,
            version: process.env.VERSION || 'dev'
          }
        