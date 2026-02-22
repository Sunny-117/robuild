import React from 'react'
import { Button } from './components/Button'
import { Card } from './components/Card'

export { Button, Card }

export interface AppProps {
  title: string
  children?: React.ReactNode
}

export function App({ title, children }: AppProps) {
  return (
    <div className="app">
      <h1>{title}</h1>
      {children}
    </div>
  )
}
