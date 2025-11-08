
          export async function fetchData() {
            const response = await fetch('https://api.example.com/data')
            return response.json()
          }

          export const asyncArrow = async () => {
            await Promise.resolve()
            return 'done'
          }
        