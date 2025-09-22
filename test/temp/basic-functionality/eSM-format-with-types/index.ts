
          export interface User {
            name: string
            age: number
          }
          
          export function greet(user: User): string {
            return `Hello, ${user.name}!`
          }
          
          export const version = '1.0.0'
        