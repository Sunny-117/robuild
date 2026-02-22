import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { styleText } from 'node:util'
import {
  cancel,
  intro,
  isCancel,
  outro,
  select,
  spinner,
  text,
} from '@clack/prompts'
import { getUserAgent } from 'package-manager-detector'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const templateOptions = [
  { value: 'default', label: 'Default - Standard TypeScript library' },
  { value: 'minimal', label: 'Minimal - Bare minimum setup' },
  { value: 'cli', label: 'CLI - Command line tool' },
  { value: 'monorepo', label: 'Monorepo - Multiple packages workspace' },
] as const

type TemplateOption = (typeof templateOptions)[number]['value']

export interface Options {
  template?: TemplateOption
  path?: string
}

export type ResolvedOptions = Required<Options>

function copyDir(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true })
  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

function getTemplatesDir(): string {
  // In development (src), templates are at ../templates
  // In production (dist), templates are at ../templates
  const devPath = path.resolve(__dirname, '../templates')
  const prodPath = path.resolve(__dirname, '../templates')

  if (fs.existsSync(devPath)) {
    return devPath
  }
  return prodPath
}

export async function create(
  pathArg: string | undefined,
  options: Options,
): Promise<void> {
  intro(`Creating a robuild project...`)

  const resolved = await resolveOptions({ ...options, path: pathArg })

  const s = spinner()
  s.start('Copying the template...')

  const templatesDir = getTemplatesDir()
  const templateDir = path.join(templatesDir, resolved.template)
  const targetDir = path.resolve(process.cwd(), resolved.path)

  if (!fs.existsSync(templateDir)) {
    s.stop('Error')
    throw new Error(`Template "${resolved.template}" not found at ${templateDir}`)
  }

  copyDir(templateDir, targetDir)

  s.stop('Template copied')

  const pm = getUserAgent() || 'npm'
  const pmInstall = pm === 'yarn' ? 'yarn' : `${pm} install`
  const pmRun = pm === 'npm' ? 'npm run' : pm

  outro(
    `Done! Now run:\n` +
      `  ${styleText('green', `cd ${resolved.path}`)}\n` +
      `  ${styleText('green', pmInstall)}\n` +
      `  ${styleText('green', `${pmRun} build`)}\n\n` +
      `For more information, visit: ${styleText('underline', `https://github.com/Sunny-117/robuild`)}`,
  )
}

export async function resolveOptions(
  options: Options,
): Promise<ResolvedOptions> {
  let targetPath: Options['path'] | symbol = options.path

  if (!targetPath) {
    const defaultPath = './my-robuild-package'
    targetPath =
      (await text({
        message: 'What is the name of your package?',
        placeholder: defaultPath,
      })) || defaultPath
    if (isCancel(targetPath)) {
      cancel('Operation cancelled.')
      process.exit(1)
    }
  }

  let template: Options['template'] | symbol = options.template
  if (template) {
    const templateOptionsValues = templateOptions.map((option) => option.value)
    if (!templateOptionsValues.includes(template)) {
      throw new Error(
        `Invalid template "${template}". Available templates: ${templateOptionsValues.join(', ')}`,
      )
    }
  } else {
    template = await select({
      message: 'Which template do you want to use?',
      options: [...templateOptions],
      initialValue: 'default',
    })

    if (isCancel(template)) {
      cancel('Operation cancelled.')
      process.exit(1)
    }
  }

  return {
    path: targetPath,
    template,
  } satisfies ResolvedOptions
}
