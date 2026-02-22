/**
 * Button component
 */

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  children: string
  onClick?: () => void
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  onClick,
}: ButtonProps): string {
  const variantClass = `btn-${variant}`
  const sizeClass = size !== 'md' ? `btn-${size}` : ''

  return `<button class="btn ${variantClass} ${sizeClass}" ${disabled ? 'disabled' : ''} onclick="${onClick}">${children}</button>`
}
