export const version = process.env.VERSION || 'unknown'
export const nodeEnv = process.env.NODE_ENV || 'development'
export const apiUrl = process.env.API_URL || 'http://localhost:3000'

export function getConfig() {
  return {
    version,
    nodeEnv,
    apiUrl,
  }
}
