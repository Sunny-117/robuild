import { defineConfig } from '../../src'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
    },
  ],

  hooks: {
    // Called at the start of the build process
    start: (ctx) => {
      console.log('=== Build Started ===')
      console.log(`Package: ${ctx.pkg.name} v${ctx.pkg.version}`)
      console.log(`Working directory: ${ctx.pkgDir}`)
    },

    // Called after entries are normalized
    entries: (entries, ctx) => {
      console.log(`\n=== Processing ${entries.length} entry(s) ===`)
      entries.forEach((entry, i) => {
        console.log(`  Entry ${i + 1}: ${entry.type} - ${entry.input}`)
      })
    },

    // Called before rolldown config is finalized
    rolldownConfig: (cfg, ctx) => {
      console.log('\n=== Configuring Rolldown ===')
      console.log(`  Input: ${cfg.input}`)

      // You can modify the config here
      // cfg.treeshake = { moduleSideEffects: false }
    },

    // Called before rolldown output config is finalized
    rolldownOutput: (cfg, res, ctx) => {
      console.log('\n=== Configuring Output ===')
      console.log(`  Format: ${cfg.format}`)
      console.log(`  Output dir: ${cfg.dir}`)
    },

    // Called at the end of the build process
    end: (ctx) => {
      console.log('\n=== Build Completed ===')
      console.log(`Output directory: ${ctx.pkgDir}/dist`)
    },
  },
})
