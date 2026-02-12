#!/usr/bin/env node
/**
 * Script to update README.md and README-zh.md with latest coverage data
 * Run after: pnpm test:coverage
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')

const coverageSummaryPath = resolve(rootDir, 'coverage/coverage-summary.json')
const readmePath = resolve(rootDir, 'README.md')
const readmeZhPath = resolve(rootDir, 'README-zh.md')

function getCoverageColor(pct) {
  if (pct >= 80)
    return 'brightgreen'
  if (pct >= 60)
    return 'green'
  if (pct >= 40)
    return 'yellow'
  if (pct >= 20)
    return 'orange'
  return 'red'
}

function formatPct(pct) {
  return `${pct.toFixed(2)}%`
}

function buildCoverageData(summary, rootDir) {
  const total = summary.total
  const dirs = new Map()

  for (const [file, data] of Object.entries(summary)) {
    if (file === 'total')
      continue
    const parts = file.replace(`${rootDir}/`, '').split('/')
    if (parts[0] === 'src' && parts.length > 1) {
      const dir = parts.slice(0, parts.length > 2 ? -1 : 2).join('/')
      if (!dirs.has(dir)) {
        dirs.set(dir, { statements: 0, branches: 0, functions: 0, lines: 0, statementsTotal: 0, branchesTotal: 0, functionsTotal: 0, linesTotal: 0 })
      }
      const d = dirs.get(dir)
      d.statements += data.statements.covered
      d.statementsTotal += data.statements.total
      d.branches += data.branches.covered
      d.branchesTotal += data.branches.total
      d.functions += data.functions.covered
      d.functionsTotal += data.functions.total
      d.lines += data.lines.covered
      d.linesTotal += data.lines.total
    }
  }

  const sortedDirs = [...dirs.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  const dirRows = sortedDirs.map(([dir, data]) => {
    const stmtsPct = data.statementsTotal > 0 ? (data.statements / data.statementsTotal * 100) : 0
    const branchPct = data.branchesTotal > 0 ? (data.branches / data.branchesTotal * 100) : 0
    const funcsPct = data.functionsTotal > 0 ? (data.functions / data.functionsTotal * 100) : 0
    const linesPct = data.linesTotal > 0 ? (data.lines / data.linesTotal * 100) : 0
    return { dir, stmtsPct, branchPct, funcsPct, linesPct }
  })

  return { total, dirRows }
}

function buildEnglishTable(total, dirRows) {
  const rows = []
  rows.push('| File | Stmts | Branch | Funcs | Lines |')
  rows.push('|------|-------|--------|-------|-------|')
  rows.push(`| **All files** | **${formatPct(total.statements.pct)}** | **${formatPct(total.branches.pct)}** | **${formatPct(total.functions.pct)}** | **${formatPct(total.lines.pct)}** |`)
  for (const { dir, stmtsPct, branchPct, funcsPct, linesPct } of dirRows) {
    rows.push(`| ${dir} | ${formatPct(stmtsPct)} | ${formatPct(branchPct)} | ${formatPct(funcsPct)} | ${formatPct(linesPct)} |`)
  }
  return rows.join('\n')
}

function buildChineseTable(total, dirRows) {
  const rows = []
  rows.push('| 文件 | 语句 | 分支 | 函数 | 行数 |')
  rows.push('|------|------|------|------|------|')
  rows.push(`| **全部文件** | **${formatPct(total.statements.pct)}** | **${formatPct(total.branches.pct)}** | **${formatPct(total.functions.pct)}** | **${formatPct(total.lines.pct)}** |`)
  for (const { dir, stmtsPct, branchPct, funcsPct, linesPct } of dirRows) {
    rows.push(`| ${dir} | ${formatPct(stmtsPct)} | ${formatPct(branchPct)} | ${formatPct(funcsPct)} | ${formatPct(linesPct)} |`)
  }
  return rows.join('\n')
}

function main() {
  if (!existsSync(coverageSummaryPath)) {
    console.error('Coverage summary not found. Run "pnpm test:coverage" first.')
    process.exit(1)
  }

  const summary = JSON.parse(readFileSync(coverageSummaryPath, 'utf-8'))
  const { total, dirRows } = buildCoverageData(summary, rootDir)

  // Build tables
  const englishTable = buildEnglishTable(total, dirRows)
  const chineseTable = buildChineseTable(total, dirRows)

  // Update English README
  let readme = readFileSync(readmePath, 'utf-8')
  const badgePct = total.statements.pct.toFixed(1)
  const badgeColor = getCoverageColor(total.statements.pct)
  const badgeRegex = /\[coverage-src\]: https:\/\/img\.shields\.io\/badge\/coverage-[\d.]+%25-\w+/
  const newBadge = `[coverage-src]: https://img.shields.io/badge/coverage-${badgePct}%25-${badgeColor}`
  readme = readme.replace(badgeRegex, newBadge)
  const markerRegex = /<!-- coverage-start -->[\s\S]*?<!-- coverage-end -->/
  readme = readme.replace(markerRegex, `<!-- coverage-start -->\n${englishTable}\n<!-- coverage-end -->`)
  writeFileSync(readmePath, readme)

  // Update Chinese README
  let readmeZh = readFileSync(readmeZhPath, 'utf-8')
  readmeZh = readmeZh.replace(markerRegex, `<!-- coverage-start -->\n${chineseTable}\n<!-- coverage-end -->`)
  writeFileSync(readmeZhPath, readmeZh)

  console.log(`Updated README.md and README-zh.md with coverage: ${badgePct}%`)
}

main()
