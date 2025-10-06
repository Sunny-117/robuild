import { defineConfig } from './src/config.ts'

function timePlugin() {
  let startTime: bigint | undefined

  const formatDuration = (ns: bigint) => {
    const ms = Number(ns) / 1e6
    if (ms < 1000) {
      return `${ms.toFixed(2)} ms`
    }

    return `${(ms / 1000).toFixed(2)} s`
  }

  return {
    name: 'robuild-plugin-build',
    buildStart() {
      startTime = process.hrtime.bigint()
      console.log('buildStart...')
    },
    async buildEnd() {
      const end = process.hrtime.bigint()
      if (startTime) {
        const diff = end - startTime
        console.log(`buildEnd... elapsed: ${formatDuration(diff)}`)
      }
      else {
        console.log('buildEnd...')
      }
    },
  }
}

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: ['./src/index.ts', './src/cli.ts', './src/config.ts'],
    },
  ],
  // Example watch configuration
  watch: {
    enabled: false, // Set to true to enable watch mode by default
    include: ['src/**/*'],
    exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    delay: 100,
    ignoreInitial: false,
    watchNewFiles: true,
  },
  plugins: [
    timePlugin(),
  ],
})
