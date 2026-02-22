import type { BundlerOptions } from './BundlerOptions'
import { build as buildRobuild } from 'robuild'

export async function build(options: BundlerOptions) {
  // Setup the project path
  const projectDir = `projects/${options.project}`
  const entryFile = `${projectDir}/src/index.ts`
  const outputDir = `${projectDir}/dist/robuild`

  // Build the project
  await buildRobuild({
    cwd: projectDir,
    entries: [
      {
        type: 'bundle',
        input: ['src/index.ts'],
        outDir: 'dist/robuild',
        format: options.cjs ? ['cjs'] : ['esm'],
        target: 'esnext',
        sourcemap: options.sourcemap ?? false,
        minify: options.minify ?? false,
        // Use oxc isolated declarations for faster DTS generation (same as tsdown)
        dts: options.dts ? { oxc: options.isolatedDeclarations ?? true } : false,
        clean: true,
      },
    ],
    logLevel: 'silent',
  })
}
