
          import { lib1 } from '@company/lib1'
          import { lib2 } from '@company/lib2'
          import { utils } from '@utils/core'
          import { helpers } from '@helpers/main'
          import lodash from 'lodash'
          import axios from 'axios'
          
          export function useCompanyLibs(): string {
            return lib1.version + lib2.name
          }
          
          export function useUtils(): string {
            return utils.format() + helpers.process()
          }
          
          export function useThirdParty(): string {
            return lodash.VERSION + axios.VERSION
          }
        