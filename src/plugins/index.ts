// Re-export from organized structure for backward compatibility

// Re-export the main builtin functions for backward compatibility
export { getBuiltinPlugins } from './builtin'
export { combinePlugins } from './combine'
// Re-export all individual plugins
export { cssPlugin } from './css'
export { nodePolyfillsPlugin } from './node-polyfills'
export { nodeProtocolPlugin } from './node-protocol'

export { hasShebang, makeExecutable, SHEBANG_RE, shebangPlugin } from './shebang'
export { textPlugin } from './text'
export { urlPlugin } from './url'
export { virtualPlugin } from './virtual'
