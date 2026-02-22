import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'robuild'

/**
 * Full-Featured Robuild Configuration Demo
 *
 * This config demonstrates most robuild features:
 * - Multiple entry types (bundle)
 * - Multiple output formats (ESM, CJS, IIFE)
 * - TypeScript declaration generation (with isolatedDeclarations)
 * - Code minification and tree shaking
 * - Source maps
 * - ESM/CJS shims
 * - Custom loaders (assets, text, json)
 * - Path aliases
 * - Banner/Footer injection
 * - CSS processing and bundling
 * - File copying
 * - Content hash for cache busting
 * - Package.json exports generation
 * - Build hooks
 * - Custom plugins (virtual modules, HTML injection)
 */

// Store browser bundle filename for HTML injection
let browserBundleFileName = ''

export default defineConfig({
  // ============================================
  // Entry Configuration (unbuild-style)
  // ============================================
  entries: [
    // Main library bundle - ESM + CJS + DTS
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      // Enable DTS generation with Oxc (faster than tsc)
      dts: {
        oxc: true,
      },
      generateExports: true,
      exportPath: '.',
      // Copy files to output directory
      copy: [
        'README.md',
        'LICENSE',
      ],
    },

    // CLI entry - ESM only with shebang preserved
    {
      type: 'bundle',
      input: './src/cli.ts',
      format: ['esm'],
      dts: false,
      generateExports: true,
      exportPath: './cli',
    },

    // Browser bundle - IIFE format with minification
    {
      type: 'bundle',
      input: './src/browser.ts',
      format: ['iife'],
      platform: 'browser',
      minify: true,
      globalName: 'RobuildDemo',
      generateExports: true,
      exportPath: './browser',
      // Add content hash for cache busting
      hash: true,
      // Target older browsers to generate vendor prefixes with LightningCSS
      target: ['chrome60', 'firefox60', 'safari11'],
    },

    // Utils sub-package
    {
      type: 'bundle',
      input: './src/utils/index.ts',
      format: ['esm', 'cjs'],
      dts: {
        oxc: true,
      },
      generateExports: true,
      exportPath: './utils',
      // Use fixed extensions (.mjs/.cjs)
      fixedExtension: true,
    },

    // Services as bundle
    {
      type: 'bundle',
      input: './src/services/index.ts',
      format: ['esm'],
      dts: {
        oxc: true,
      },
      generateExports: true,
      exportPath: './services',
    },
  ],

  // ============================================
  // Output Configuration
  // ============================================
  outDir: './dist',
  sourcemap: true,

  // ============================================
  // Code Optimization
  // ============================================
  treeshake: true,

  // ============================================
  // External Dependencies
  // ============================================
  external: [
    /^node:/,
  ],
  noExternal: [],

  // ============================================
  // Path Aliases
  // ============================================
  alias: {
    '@': './src',
    '@utils': './src/utils',
    '@types': './src/types',
    '@services': './src/services',
  },

  // ============================================
  // ESM/CJS Compatibility Shims
  // ============================================
  shims: {
    dirname: true,
    require: true,
    exports: true,
  },

  // ============================================
  // Custom Loaders for Static Assets
  // ============================================
  loaders: {
    // Text files
    '.txt': { loader: 'text' },
    '.md': { loader: 'text' },

    // Data files
    '.json': { loader: 'json' },

    // Images - use 'asset' for automatic optimization
    '.svg': { loader: 'text' },
    '.png': { loader: 'asset' },
    '.jpg': { loader: 'asset' },
    '.gif': { loader: 'asset' },

    // Fonts
    '.woff': { loader: 'base64' },
    '.woff2': { loader: 'base64' },
  },

  // ============================================
  // Banner / Footer
  // ============================================
  banner: {
    esm: `/**
 * @license MIT
 * Robuild Full-Featured Demo
 * Built with robuild - https://github.com/Sunny-117/robuild
 */`,
    cjs: `/**
 * @license MIT
 * Robuild Full-Featured Demo (CommonJS)
 */`,
    iife: `/*!
 * RobuildDemo v1.0.0
 * (c) ${new Date().getFullYear()} robuild
 */`,
  },

  footer: '// End of bundle',

  // ============================================
  // Environment Variables
  // ============================================
  env: {
    NODE_ENV: 'production',
  },

  // ============================================
  // Package.json Exports Generation
  // ============================================
  exports: {
    enabled: true,
    autoUpdate: true,
    includeTypes: true,
    custom: {
      './package.json': './package.json',
    },
  },

  // ============================================
  // Plugins
  // ============================================
  plugins: [
    // Virtual module plugin - inject build-time information
    {
      name: 'virtual-build-info',
      resolveId(id: string) {
        if (id === 'virtual:build-info') {
          return '\0virtual:build-info'
        }
        return null
      },
      load(id: string) {
        if (id === '\0virtual:build-info') {
          return `
            export const buildTime = ${JSON.stringify(new Date().toISOString())};
            export const nodeVersion = ${JSON.stringify(process.version)};
            export const platform = ${JSON.stringify(process.platform)};
          `
        }
        return null
      },
    },

    // HTML injection plugin - auto-update browser bundle reference
    {
      name: 'html-bundle-injector',
      writeBundle(_options: unknown, bundle: Record<string, { type: string; fileName?: string }>) {
        // Find the browser bundle file (browser-*.js with hash)
        for (const [fileName, chunk] of Object.entries(bundle)) {
          if (chunk.type === 'chunk' && fileName.startsWith('browser-') && fileName.endsWith('.js')) {
            browserBundleFileName = fileName
            console.log(`   📄 Browser bundle: ${fileName}`)
            break
          }
        }
      },
    },
  ],

  // ============================================
  // Build Hooks
  // ============================================
  hooks: {
    start: (ctx) => {
      console.log('\n🚀 Starting robuild demo build...')
      console.log(`   Package: ${ctx.pkg.name}`)
      console.log(`   Directory: ${ctx.pkgDir}`)
    },

    entries: (entries, _ctx) => {
      console.log(`\n📦 Processing ${entries.length} entries:`)
      entries.forEach((entry, i) => {
        console.log(`   ${i + 1}. [${entry.type}] ${entry.input}`)
      })
    },

    end: (_ctx) => {
      console.log('\n✅ Build completed successfully!')
    },
  },

  // ============================================
  // Post-build Callback - Update HTML
  // ============================================
  onSuccess: async () => {
    // Find browser bundle if not captured by plugin
    if (!browserBundleFileName) {
      const distFiles = readdirSync('./dist')
      const browserFile = distFiles.find(f => f.startsWith('browser-') && f.endsWith('.js') && !f.endsWith('.map'))
      if (browserFile) {
        browserBundleFileName = browserFile
      }
    }

    // Update index.html with correct browser bundle path
    if (browserBundleFileName) {
      const htmlPath = join(process.cwd(), 'index.html')
      try {
        let html = readFileSync(htmlPath, 'utf-8')
        // Replace any browser-*.js reference with the actual filename
        const updated = html.replace(
          /src="\.\/dist\/browser-[^"]*\.js"/g,
          `src="./dist/${browserBundleFileName}"`,
        )
        if (updated !== html) {
          writeFileSync(htmlPath, updated)
          console.log(`📝 Updated index.html with browser bundle: ${browserBundleFileName}`)
        }
      }
      catch {
        // index.html might not exist, that's ok
      }
    }

    console.log('📋 Post-build tasks completed')
  },

  // ============================================
  // Logging
  // ============================================
  logLevel: 'info',

  // ============================================
  // CSS Processing
  // ============================================
  css: {
    // Disable CSS code splitting to merge all CSS into one file
    splitting: false,
    // Custom CSS output filename
    fileName: 'robuild-demo.css',
    // Enable LightningCSS for prefixing, minification, and modern CSS transforms
    // Note: Requires `pnpm add -D unplugin-lightningcss lightningcss`
    lightningcss: true,
  },
})
