
          import lodash from 'lodash'
          import type { Express } from '@types/express'
          import { customExternal } from 'custom-external-lib'
          import { forceBundled } from 'force-bundled'
          
          export function processWithLodash(data: any[]): any[] {
            return lodash.map(data, x => x)
          }
          
          export function useCustom(): string {
            return customExternal.version
          }
          
          export function useBundled(): string {
            return forceBundled.helper()
          }
        