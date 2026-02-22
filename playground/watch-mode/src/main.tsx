import React from 'react'

export interface AppProps {
  title: string
}

export function App({ title }: AppProps) {
  const [count, setCount] = React.useState(0)

  return (
    <div>
      <h1>{title}</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>
        Increment
      </button>
    </div>
  )
}

export default App
