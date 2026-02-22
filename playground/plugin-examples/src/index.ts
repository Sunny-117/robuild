// Version injection example
export const version = __VERSION__
export const buildInfo = {
  version: __VERSION__,
  timestamp: Date.now()
}

// Conditional compilation examples
export const features = {
  /* #ifdef DEBUG */
  debug: true,
  debugLevel: 'verbose',
  /* #endif */
  
  /* #ifdef PRODUCTION */
  debug: false,
  optimized: true,
  /* #endif */
  
  /* #ifdef FEATURE_A */
  featureA: {
    enabled: true,
    config: { timeout: 5000 }
  },
  /* #endif */
  
  /* #ifdef FEATURE_B */
  featureB: {
    enabled: true,
    experimental: true
  },
  /* #endif */
  
  core: true
}

// JSON import example (rolldown native support)
import config from './config.json'

export const appConfig = config

// React/JSX example (rolldown native support)
export function createGreeting(name: string) {
  return `Hello, ${name}! Version: ${__VERSION__}`
}

console.log('Plugin examples loaded successfully!')
console.log('Version:', version)
console.log('Features:', features)
console.log('Config:', appConfig)
