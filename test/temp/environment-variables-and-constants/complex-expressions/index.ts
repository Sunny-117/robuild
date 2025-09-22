
          export const port: number = Number(process.env.PORT) || 8080
          export const timeout: number = DEFAULT_TIMEOUT * 2
          export const config = {
            port: process.env.PORT || '3000',
            timeout: DEFAULT_TIMEOUT,
            debug: process.env.DEBUG === 'true',
            maxRetries: MAX_RETRIES
          }
        