
          import { bundleMePackage } from 'bundle-me-package'
          import { bundleMeUtils } from 'bundle-me-utils'
          import { keepExternal } from 'keep-external'
          
          export function useBundled(): string {
            return bundleMePackage.version + bundleMeUtils.helper()
          }
          
          export function useExternal(): string {
            return keepExternal.process()
          }
        