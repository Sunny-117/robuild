#!/usr/bin/env node
/**
 * Sync robuild version in templates to match root package.json
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

// Read root package.json version
const rootPkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'))
const robuildVersion = `^${rootPkg.version}`

// Find all template package.json files
const templatesDir = path.join(rootDir, 'packages/create-robuild/templates')

function updatePackageJson(filePath) {
  const pkg = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  let updated = false

  if (pkg.devDependencies?.robuild && pkg.devDependencies.robuild !== robuildVersion) {
    pkg.devDependencies.robuild = robuildVersion
    updated = true
  }

  if (pkg.dependencies?.robuild && pkg.dependencies.robuild !== robuildVersion) {
    pkg.dependencies.robuild = robuildVersion
    updated = true
  }

  if (updated) {
    fs.writeFileSync(filePath, JSON.stringify(pkg, null, 2) + '\n')
    console.log(`Updated ${path.relative(rootDir, filePath)} -> robuild@${robuildVersion}`)
  }
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walkDir(fullPath)
    } else if (entry.name === 'package.json') {
      updatePackageJson(fullPath)
    }
  }
}

walkDir(templatesDir)
console.log('Template versions synced successfully!')
