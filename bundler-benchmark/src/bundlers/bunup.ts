import type { BundlerOptions } from './BundlerOptions'
import { build as buildBunup } from 'bunup'

export async function build(options: BundlerOptions) {
  // Setup the project path
  const projectDir = `projects/${options.project}`
  const entryFile = `${projectDir}/src/index.ts`
  const outputDir = `${projectDir}/dist/bunup`

  // Build the project
  await buildBunup({
    entry: entryFile,
    outDir: outputDir,
    format: [options.cjs ? 'cjs' : 'esm'],
    clean: true,
    sourcemap: options.sourcemap ?? false,
    minify: options.minify ?? false,
    silent: true,
    dts: options.dts ?? false,
  })
}
