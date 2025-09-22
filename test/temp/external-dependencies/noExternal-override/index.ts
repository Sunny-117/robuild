
          import { shouldBundle } from 'should-bundle'
          import { shouldStayExternal } from 'should-stay-external'
          
          export function useBundled(): string {
            return shouldBundle.value
          }
          
          export function useExternal(): string {
            return shouldStayExternal.value
          }
        