
          export const config = {
            api: {
              url: process.env.API_URL || 'localhost',
              timeout: API_TIMEOUT,
              retries: MAX_RETRIES
            },
            features: {
              debug: __DEBUG__,
              analytics: ANALYTICS_ENABLED
            }
          }
        