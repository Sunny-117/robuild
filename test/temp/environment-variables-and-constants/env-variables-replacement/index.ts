
          export const version: string = process.env.VERSION || 'unknown'
          export const nodeEnv: string = process.env.NODE_ENV || 'development'
          export const apiUrl: string = process.env.API_URL || 'http://localhost:3000'
          
          export function getConfig() {
            return { version, nodeEnv, apiUrl }
          }
        