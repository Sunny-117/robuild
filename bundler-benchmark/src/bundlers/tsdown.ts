import type { BundlerOptions } from './BundlerOptions'
import { build as buildTsdown } from 'tsdown'

export async function build(options: BundlerOptions) {
  // Setup the project path
  const projectDir = `projects/${options.project}`
  const entryFile = `${projectDir}/src/index.ts`
  const outputDir = `${projectDir}/dist/tsdown`

  // Build the project
  await buildTsdown({
    entry: entryFile,
    outDir: outputDir,
    format: options.cjs ? 'cjs' : 'esm',
    target: false,
    sourcemap: options.sourcemap ?? false,
    minify: options.minify ?? false,
    logLevel: 'silent',
    dts: options.dts ? { oxc: options.isolatedDeclarations ?? true } : false,
  })
}
