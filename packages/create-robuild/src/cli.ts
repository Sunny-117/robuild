import process from 'node:process'
import { log } from '@clack/prompts'
import { cac } from 'cac'
import { create, templateOptions, type Options } from './index'

const cli = cac('create-robuild').version('0.1.0').help()

cli
  .command('[path]', 'Create a robuild project')
  .option(
    '-t, --template <template>',
    `Available templates: ${templateOptions.map((option) => option.value).join(', ')}`,
  )
  .action((path: string | undefined, options: Options) => create(path, options))

export async function runCLI(): Promise<void> {
  cli.parse(process.argv, { run: false })

  try {
    await cli.runMatchedCommand()
  } catch (error) {
    log.error(String(error))
    process.exit(1)
  }
}
