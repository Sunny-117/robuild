
          import lodash from 'lodash'

          export function processData(data: any[]): any[] {
            return lodash.map(data, item => item.value)
          }
        