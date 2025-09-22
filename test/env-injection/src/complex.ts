const port = Number(process.env.PORT) || 8080
const timeout = DEFAULT_TIMEOUT || 3000

export function createServer() {
  return {
    port,
    timeout,
    start() {
      console.log(`Server starting on port ${port} with timeout ${timeout}ms`)
    },
  }
}
