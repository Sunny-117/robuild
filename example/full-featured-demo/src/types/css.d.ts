/**
 * CSS module type declarations
 * Provides TypeScript support for CSS imports
 */
declare module '*.css' {
  const content: string
  export default content
}
