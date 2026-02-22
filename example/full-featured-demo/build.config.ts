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
 * - File copying
 * - Content hash for cache busting
 * - Package.json exports generation
 * - Build hooks
 * - Custom plugins (virtual modules)
 */
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
  // Plugins - Virtual Modules Example
  // ============================================
  plugins: [
    // Virtual module plugin example
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
  // Post-build Callback
  // ============================================
  onSuccess: async () => {
    console.log('📋 Post-build tasks completed')
  },

  // ============================================
  // Logging
  // ============================================
  logLevel: 'info',
})
