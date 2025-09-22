
          import { internalUtils } from 'internal-utils'
          import { internalHelpers } from 'internal-helpers'
          import { externalLib } from 'external-lib'
          
          export function useInternal(): string {
            return internalUtils.process() + internalHelpers.format()
          }
          
          export function useExternal(): string {
            return externalLib.version
          }
        