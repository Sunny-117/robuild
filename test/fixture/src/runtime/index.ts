// @ts-expect-error - JS test file
export { jsModule } from './js-module' // Without extension

export { test } from './test.ts' // Explicitly import the test file with .ts extension
export { tsModule } from './ts-module' // Without extension

export default 'default export'
