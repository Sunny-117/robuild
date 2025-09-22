
          import { customLib } from 'custom-package'
          import { internalUtil } from 'internal-util'
          import { externalLib } from 'external-lib'
          
          export function useCustom(): string {
            return customLib.version
          }
          
          export function useInternal(): string {
            return internalUtil.helper()
          }
          
          export function useExternal(): string {
            return externalLib.process()
          }
        