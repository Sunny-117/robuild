
          import lodash from 'lodash'
          import axios from 'axios'
          
          export function processData(data: any[]): any[] {
            return lodash.map(data, item => item.value)
          }
          
          export async function fetchData(url: string): Promise<any> {
            const response = await axios.get(url)
            return response.data
          }
        