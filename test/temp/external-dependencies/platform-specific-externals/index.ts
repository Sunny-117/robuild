
          import fs from 'fs'
          import path from 'path'
          import { browserUtil } from 'browser-util'
          
          export function readFile(filename: string): string {
            return fs.readFileSync(path.join(__dirname, filename), 'utf8')
          }
          
          export function useBrowserUtil(): string {
            return browserUtil.process()
          }
        