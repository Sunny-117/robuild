
          import type { Request } from '@types/express'
          import type { Config } from '@types/node'
          import { utils } from '@internal/utils'
          
          export function handler(req: Request): void {
            console.log('Handling request')
          }
          
          export const config: Config = { port: 3000 }
          export { utils }
        