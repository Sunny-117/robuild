export function test() {
  return 'test bundled'
}

export const version: string = process.env.VERSION || 'unknown'
export const buildMode: string = BUILD_MODE || 'development'

export default 'default export'
