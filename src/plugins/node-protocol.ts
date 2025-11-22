import type { Plugin } from 'rolldown'
import { transformNodeProtocol } from '../features/node-protocol'

/**
 * Rolldown plugin for Node.js protocol handling
 */
export function nodeProtocolPlugin(nodeProtocol: 'strip' | boolean): Plugin {
  if (!nodeProtocol) {
    return {
      name: 'node-protocol-noop',
    }
  }

  return {
    name: 'node-protocol',
    renderChunk(code) {
      return {
        code: transformNodeProtocol(code, nodeProtocol),
        map: null,
      }
    },
  }
}
