import { defineConfig } from 'robuild'

const isDev = process.env.NODE_ENV === 'development'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      stub: isDev, // Enable stub mode in development
      dts: !isDev, // Only generate dts in production
    },
  ],
})
