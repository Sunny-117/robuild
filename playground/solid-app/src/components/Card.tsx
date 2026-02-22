import type { Component, JSX } from 'solid-js'

export interface CardProps {
  title?: string
  children: JSX.Element
  class?: string
}

export const Card: Component<CardProps> = (props) => {
  return (
    <div class={`card ${props.class || ''}`}>
      {props.title && <div class="card-header">{props.title}</div>}
      <div class="card-body">
        {props.children}
      </div>
    </div>
  )
}
