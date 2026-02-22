/**
 * CSS Processing Example
 *
 * This example demonstrates robuild's CSS processing capabilities:
 * - Bundling CSS imports
 * - CSS code splitting
 * - LightningCSS integration (optional)
 */

// Import CSS files
import './styles/base.css'
import './styles/components.css'
import './styles/theme.css'

// Components
export { Button, type ButtonProps } from './components/Button'
export { Card, type CardProps } from './components/Card'
export { Modal, type ModalProps } from './components/Modal'

// Utilities
export { cn, type ClassValue } from './utils/classnames'

// Async component loading (demonstrates CSS code splitting)
export async function loadChartComponent() {
  // CSS for this component will be split into a separate chunk
  // when css.splitting is enabled
  const { Chart } = await import('./components/Chart')
  return Chart
}
