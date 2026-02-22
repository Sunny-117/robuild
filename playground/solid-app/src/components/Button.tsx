import type { Component, JSX } from 'solid-js'

export interface ButtonProps {
  children: JSX.Element
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

export const Button: Component<ButtonProps> = (props) => {
  return (
    <button
      class={`btn btn-${props.variant || 'primary'}`}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  )
}
