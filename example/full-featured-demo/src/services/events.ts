/**
 * Event emitter service - Transform mode example
 */

import type { EventHandler } from '../types'

export class EventEmitter<Events extends Record<string, unknown> = Record<string, unknown>> {
  private listeners: Map<keyof Events, Set<EventHandler<unknown>>> = new Map()

  on<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    this.listeners.get(event)!.add(handler as EventHandler<unknown>)

    // Return unsubscribe function
    return () => this.off(event, handler)
  }

  once<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): () => void {
    const wrapper: EventHandler<Events[K]> = (data) => {
      this.off(event, wrapper)
      handler(data)
    }

    return this.on(event, wrapper)
  }

  off<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): void {
    const handlers = this.listeners.get(event)
    if (handlers) {
      handlers.delete(handler as EventHandler<unknown>)
      if (handlers.size === 0) {
        this.listeners.delete(event)
      }
    }
  }

  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    const handlers = this.listeners.get(event)
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(data)
        } catch (error) {
          console.error(`Error in event handler for "${String(event)}":`, error)
        }
      }
    }
  }

  async emitAsync<K extends keyof Events>(event: K, data: Events[K]): Promise<void> {
    const handlers = this.listeners.get(event)
    if (handlers) {
      const promises = Array.from(handlers).map((handler) =>
        Promise.resolve(handler(data)).catch((error) => {
          console.error(`Error in async event handler for "${String(event)}":`, error)
        }),
      )
      await Promise.all(promises)
    }
  }

  removeAllListeners<K extends keyof Events>(event?: K): void {
    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }

  listenerCount<K extends keyof Events>(event: K): number {
    return this.listeners.get(event)?.size || 0
  }

  eventNames(): (keyof Events)[] {
    return Array.from(this.listeners.keys())
  }
}

export function createEventEmitter<Events extends Record<string, unknown> = Record<string, unknown>>(): EventEmitter<Events> {
  return new EventEmitter<Events>()
}
