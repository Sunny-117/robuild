import { defineConfig } from 'robuild'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm'],
  outDir: './dist',
  dts: true,
  // Enable WASM support
  // wasm: {
  //   enabled: true,
  //   // Files smaller than 14KB will be inlined as base64
  //   maxFileSize: 14 * 1024,
  //   // Target environment: auto-detect Node.js or browser
  //   targetEnv: 'auto',
  // },
})
