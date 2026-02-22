import React from 'react'

export interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
}

export function Button({ children, onClick }: ButtonProps) {
  return (
    <button onClick={onClick} className="btn">
      {children}
    </button>
  )
}

export const version = '1.0.0'

export default Button
