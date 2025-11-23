import { defineConfig } from 'robuild'
import Vue from 'unplugin-vue/rolldown'

export default defineConfig({
  entry: ['./src/vue.ts'],
  platform: 'neutral',
  plugins: [Vue({ isProduction: false })],
  dts: { vue: true },
})
