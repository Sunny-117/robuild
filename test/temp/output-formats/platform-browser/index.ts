
          export const platform: string = 'browser'
          export function getPlatform(): string {
            return typeof window !== 'undefined' ? 'browser' : 'node'
          }
        