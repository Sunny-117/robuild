import type { BundlerOptions } from './BundlerOptions'
import { build as buildRslib } from '@rslib/core'

export async function build(options: BundlerOptions) {
  // Setup the project path
  const projectDir = `projects/${options.project}`
  const entryFile = `${projectDir}/src/index.ts`
  const outputDir = `${projectDir}/dist/rslib`

  // Build the project
  await buildRslib({
    lib: [
      {
        source: {
          entry: {
            index: entryFile,
          },
          tsconfigPath: options.dts
            ? `${projectDir}/rslib.tsconfig.json`
            : undefined,
        },
        format: options.cjs ? 'cjs' : 'esm',
        dts: options.dts || false,
        output: {
          minify: options.minify || false,
          sourceMap: options.sourcemap || false,
          distPath: {
            root: outputDir,
          },
          cleanDistPath: true,
        },
      },
    ],
  })
}
