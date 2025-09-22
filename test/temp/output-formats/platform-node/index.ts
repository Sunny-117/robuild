
          export const platform: string = 'node'
          export function getPlatform(): string {
            return typeof process !== 'undefined' ? 'node' : 'browser'
          }
        