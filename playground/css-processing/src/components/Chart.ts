/**
 * Chart component - loaded asynchronously to demonstrate CSS code splitting
 */

import './Chart.css'

export interface ChartProps {
  data: number[]
  type?: 'bar' | 'line' | 'pie'
  width?: number
  height?: number
}

export function Chart({
  data,
  type = 'bar',
  width = 400,
  height = 300,
}: ChartProps): string {
  const maxValue = Math.max(...data)

  if (type === 'bar') {
    const bars = data
      .map((value, index) => {
        const barHeight = (value / maxValue) * 100
        return `<div class="chart-bar" style="height: ${barHeight}%; width: ${100 / data.length}%;" data-value="${value}" data-index="${index}"></div>`
      })
      .join('')

    return `
      <div class="chart chart-bar-container" style="width: ${width}px; height: ${height}px;">
        <div class="chart-bars">${bars}</div>
        <div class="chart-axis-x"></div>
        <div class="chart-axis-y"></div>
      </div>
    `
  }

  if (type === 'line') {
    const points = data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * 100
        const y = 100 - (value / maxValue) * 100
        return `${x},${y}`
      })
      .join(' ')

    return `
      <div class="chart chart-line-container" style="width: ${width}px; height: ${height}px;">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline class="chart-line" points="${points}" />
        </svg>
      </div>
    `
  }

  return `<div class="chart">Chart type "${type}" not implemented</div>`
}
