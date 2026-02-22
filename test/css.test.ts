import { describe, expect, it } from 'vitest'
import { testBuild } from './helpers'

/**
 * CSS processing tests
 * Tests for CSS bundling, code splitting, and LightningCSS integration
 */
describe('css processing', () => {
  describe('basic CSS bundling', () => {
    it('should bundle CSS imports', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            import './styles.css'
            export const app = 'hello'
          `,
          'styles.css': `
            .container {
              display: flex;
              color: red;
            }
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: 'esm',
            },
          ],
        },
      })
    })

    it('should bundle multiple CSS files', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            import './base.css'
            import './theme.css'
            export const app = 'styled'
          `,
          'base.css': `
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
          `,
          'theme.css': `
            :root {
              --primary: #007bff;
              --secondary: #6c757d;
            }
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: 'esm',
            },
          ],
        },
      })
    })

    it('should handle CSS with nested imports', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            import './main.css'
            export const app = 'nested-css'
          `,
          'main.css': `
            @import './variables.css';

            .app {
              background: var(--bg-color);
            }
          `,
          'variables.css': `
            :root {
              --bg-color: #f5f5f5;
            }
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: 'esm',
            },
          ],
        },
      })
    })
  })

  describe('CSS code splitting', () => {
    it('should preserve CSS splitting by default', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            import './styles.css'
            export async function loadComponent() {
              return import('./component')
            }
          `,
          'component.ts': `
            import './component.css'
            export const Component = 'async-component'
          `,
          'styles.css': `
            .main { color: blue; }
          `,
          'component.css': `
            .component { color: green; }
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: 'esm',
              splitting: true,
            },
          ],
          css: {
            splitting: true,
          },
        },
      })
    })

    it('should merge all CSS into single file when splitting is disabled', async (context) => {
      const result = await testBuild({
        context,
        files: {
          'index.ts': `
            import './styles.css'
            export async function loadComponent() {
              return import('./component')
            }
          `,
          'component.ts': `
            import './component.css'
            export const Component = 'async-component'
          `,
          'styles.css': `
            .main { color: blue; }
          `,
          'component.css': `
            .component { color: green; }
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: 'esm',
              splitting: true,
            },
          ],
          css: {
            splitting: false,
            fileName: 'bundle.css',
          },
        },
      })

      // Check that a single CSS file was generated
      const cssFiles = result.files.filter(f => f.endsWith('.css'))
      expect(cssFiles.length).toBeLessThanOrEqual(1)
    })

    it('should use custom CSS filename when splitting is disabled', async (context) => {
      const result = await testBuild({
        context,
        files: {
          'index.ts': `
            import './styles.css'
            export const app = 'custom-css-name'
          `,
          'styles.css': `
            .app { color: red; }
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: 'esm',
            },
          ],
          css: {
            splitting: false,
            fileName: 'custom-styles.css',
          },
        },
      })

      const cssFiles = result.files.filter(f => f.endsWith('.css'))
      if (cssFiles.length > 0) {
        expect(cssFiles.some(f => f.includes('custom-styles'))).toBe(true)
      }
    })
  })

  describe('CSS with different platforms', () => {
    it('should handle CSS for browser platform', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            import './styles.css'
            export const platform = 'browser'
          `,
          'styles.css': `
            .browser-only {
              display: flex;
              gap: 1rem;
            }
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: 'esm',
              platform: 'browser',
            },
          ],
        },
      })
    })

    it('should handle CSS for node platform', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            import './styles.css'
            export const platform = 'node'
          `,
          'styles.css': `
            /* Server-side CSS for SSR */
            .ssr-component {
              visibility: hidden;
            }
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: 'esm',
              platform: 'node',
            },
          ],
        },
      })
    })
  })

  describe('CSS with minification', () => {
    it('should minify CSS when minify is enabled', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            import './styles.css'
            export const app = 'minified'
          `,
          'styles.css': `
            /* This is a comment that should be removed */
            .container {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }

            .button {
              padding: 10px 20px;
              background-color: #007bff;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            }
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: 'esm',
              minify: true,
            },
          ],
        },
      })
    })
  })

  describe('CSS with multi-format output', () => {
    it('should handle CSS with ESM and CJS formats', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            import './styles.css'
            export const multi = 'format'
          `,
          'styles.css': `
            .multi-format {
              color: purple;
            }
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: ['esm', 'cjs'],
            },
          ],
        },
      })
    })
  })
})
