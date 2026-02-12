/**
 * Node.js built-in modules that support the node: protocol
 */
const NODE_BUILTIN_MODULES = new Set([
  'assert',
  'async_hooks',
  'buffer',
  'child_process',
  'cluster',
  'console',
  'constants',
  'crypto',
  'dgram',
  'diagnostics_channel',
  'dns',
  'domain',
  'events',
  'fs',
  'http',
  'http2',
  'https',
  'inspector',
  'module',
  'net',
  'os',
  'path',
  'perf_hooks',
  'process',
  'punycode',
  'querystring',
  'readline',
  'repl',
  'stream',
  'string_decoder',
  'sys',
  'timers',
  'tls',
  'trace_events',
  'tty',
  'url',
  'util',
  'v8',
  'vm',
  'wasi',
  'worker_threads',
  'zlib',
])

/**
 * Check if a module is a Node.js built-in module
 */
export function isNodeBuiltin(id: string): boolean {
  // Remove node: prefix if present
  const cleanId = id.startsWith('node:') ? id.slice(5) : id
  return NODE_BUILTIN_MODULES.has(cleanId)
}

/**
 * Add node: prefix to built-in modules
 */
export function addNodeProtocol(id: string): string {
  if (id.startsWith('node:')) {
    return id // Already has prefix
  }

  if (isNodeBuiltin(id)) {
    return `node:${id}`
  }

  return id
}

/**
 * Remove node: prefix from modules
 */
export function stripNodeProtocol(id: string): string {
  if (id.startsWith('node:')) {
    return id.slice(5)
  }
  return id
}

/**
 * Process module ID based on nodeProtocol setting
 */
export function processNodeProtocol(
  id: string,
  nodeProtocol: 'strip' | boolean,
): string {
  if (nodeProtocol === 'strip') {
    return stripNodeProtocol(id)
  }

  if (nodeProtocol === true) {
    return addNodeProtocol(id)
  }

  return id // false - no change
}

/**
 * Transform import/export statements to handle node protocol
 */
export function transformNodeProtocol(
  code: string,
  nodeProtocol: 'strip' | boolean,
): string {
  if (!nodeProtocol) {
    return code
  }

  // Match import/export statements
  const importRegex = /(?:import|export)(?:\s[^'"]*)?\s['"]([^'"]+)['"]/g

  return code.replace(importRegex, (match, moduleId) => {
    const processedId = processNodeProtocol(moduleId, nodeProtocol)
    return match.replace(moduleId, processedId)
  })
}
