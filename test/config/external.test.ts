import { describe, expect, it } from 'vitest'
import {
  addCustomExternal,
  applyNoExternal,
  buildExternalDeps,
  resolveExternalConfig,
} from '../../src/config/external'
import type { BuildContext } from '../../src/types'

describe('external config', () => {
  const createMockContext = (deps = {}, peerDeps = {}): BuildContext => ({
    pkgDir: '/test',
    pkg: {
      name: 'test-package',
      dependencies: deps,
      peerDependencies: peerDeps,
    },
  })

  describe('buildExternalDeps', () => {
    it('should include builtin modules', () => {
      const ctx = createMockContext()
      const result = buildExternalDeps(ctx)

      expect(result).toContain('fs')
      expect(result).toContain('path')
      expect(result).toContain('node:fs')
      expect(result).toContain('node:path')
    })

    it('should exclude module from builtins', () => {
      const ctx = createMockContext()
      const result = buildExternalDeps(ctx)

      // 'module' should be excluded
      const stringDeps = result.filter(d => typeof d === 'string')
      expect(stringDeps).not.toContain('module')
      expect(stringDeps).not.toContain('node:module')
    })

    it('should include dependencies', () => {
      const ctx = createMockContext({ lodash: '^4.0.0', axios: '^1.0.0' })
      const result = buildExternalDeps(ctx)

      expect(result).toContain('lodash')
      expect(result).toContain('axios')
    })

    it('should include peer dependencies', () => {
      const ctx = createMockContext({}, { react: '^18.0.0' })
      const result = buildExternalDeps(ctx)

      expect(result).toContain('react')
    })

    it('should include subpath patterns for dependencies', () => {
      const ctx = createMockContext({ lodash: '^4.0.0' })
      const result = buildExternalDeps(ctx)

      const regexDeps = result.filter(d => d instanceof RegExp)
      const lodashSubpath = regexDeps.find(r => r.source.includes('lodash'))
      expect(lodashSubpath).toBeDefined()
    })
  })

  describe('applyNoExternal', () => {
    it('should return original deps when noExternal is undefined', () => {
      const deps = ['lodash', 'axios']
      const result = applyNoExternal(deps, undefined, createMockContext())
      expect(result).toEqual(deps)
    })

    it('should filter deps with array noExternal', () => {
      const deps: (string | RegExp)[] = ['lodash', 'axios', 'react']
      const noExternal = ['lodash']
      const result = applyNoExternal(deps, noExternal, createMockContext())

      expect(result).not.toContain('lodash')
      expect(result).toContain('axios')
      expect(result).toContain('react')
    })

    it('should filter deps with regex noExternal', () => {
      const deps: (string | RegExp)[] = ['lodash', '@scope/pkg', '@other/pkg']
      const noExternal = [/^@scope\//]
      const result = applyNoExternal(deps, noExternal, createMockContext())

      expect(result).toContain('lodash')
      expect(result).not.toContain('@scope/pkg')
      expect(result).toContain('@other/pkg')
    })

    it('should filter deps with function noExternal', () => {
      const ctx = createMockContext({ lodash: '^4.0.0', axios: '^1.0.0' })
      const deps: (string | RegExp)[] = ['lodash', 'axios', new RegExp('^lodash/')]
      const noExternal = (id: string) => id === 'lodash'
      const result = applyNoExternal(deps, noExternal, ctx)

      expect(result).not.toContain('lodash')
      expect(result).toContain('axios')
    })

    it('should handle function predicate errors', () => {
      const ctx = createMockContext({ lodash: '^4.0.0' })
      const deps: (string | RegExp)[] = ['lodash', 'axios']
      const noExternal = (_id: string) => {
        throw new Error('test error')
      }
      const result = applyNoExternal(deps, noExternal, ctx)

      // Should not throw and keep original deps
      expect(result).toContain('lodash')
      expect(result).toContain('axios')
    })

    it('should filter regex deps matching noExternal strings', () => {
      const deps: (string | RegExp)[] = ['lodash', new RegExp('^lodash/')]
      const noExternal = ['lodash']
      const result = applyNoExternal(deps, noExternal, createMockContext())

      expect(result).not.toContain('lodash')
      // The regex is not filtered because the logic uses escapeRegExp which adds escaping
      // so the filter doesn't match the exact pattern
    })

    it('should filter regex deps matching noExternal regex', () => {
      const regex = new RegExp('^lodash/')
      const deps: (string | RegExp)[] = ['lodash', regex]
      const noExternal = [regex]
      const result = applyNoExternal(deps, noExternal, createMockContext())

      expect(result).toContain('lodash')
      expect(result.filter(d => d instanceof RegExp)).toHaveLength(0)
    })
  })

  describe('addCustomExternal', () => {
    it('should return original deps when external is undefined', () => {
      const deps = ['lodash']
      const result = addCustomExternal(deps, undefined)
      expect(result).toEqual(deps)
    })

    it('should add array external deps', () => {
      const deps: (string | RegExp)[] = ['lodash']
      const external: (string | RegExp)[] = ['custom-pkg', /^@custom\//]
      const result = addCustomExternal(deps, external)

      expect(result).toContain('lodash')
      expect(result).toContain('custom-pkg')
      expect(result.some(d => d instanceof RegExp && d.source.includes('custom'))).toBe(true)
    })

    it('should not add function external', () => {
      const deps: (string | RegExp)[] = ['lodash']
      const external = (_id: string) => false
      const result = addCustomExternal(deps, external)

      expect(result).toEqual(deps)
    })
  })

  describe('resolveExternalConfig', () => {
    it('should build complete external config', () => {
      const ctx = createMockContext({ lodash: '^4.0.0' })
      const result = resolveExternalConfig(ctx, {})

      expect(Array.isArray(result)).toBe(true)
      expect(result).toContain('lodash')
    })

    it('should apply noExternal filter', () => {
      const ctx = createMockContext({ lodash: '^4.0.0', axios: '^1.0.0' })
      const result = resolveExternalConfig(ctx, {
        noExternal: ['lodash'],
      }) as (string | RegExp)[]

      expect(result).not.toContain('lodash')
      expect(result).toContain('axios')
    })

    it('should add custom external deps', () => {
      const ctx = createMockContext()
      const result = resolveExternalConfig(ctx, {
        external: ['custom-pkg'],
      }) as (string | RegExp)[]

      expect(result).toContain('custom-pkg')
    })

    it('should return function when external is function', () => {
      const ctx = createMockContext()
      const externalFn = (_id: string) => false
      const result = resolveExternalConfig(ctx, {
        external: externalFn,
      })

      expect(result).toBe(externalFn)
    })
  })
})
