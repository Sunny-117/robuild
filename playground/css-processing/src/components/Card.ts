/**
 * Card component
 */

export interface CardProps {
  title?: string
  children: string
  footer?: string
}

export function Card({ title, children, footer }: CardProps): string {
  const headerHtml = title
    ? `<div class="card-header"><h3>${title}</h3></div>`
    : ''
  const footerHtml = footer
    ? `<div class="card-footer">${footer}</div>`
    : ''

  return `
    <div class="card">
      ${headerHtml}
      <div class="card-body">${children}</div>
      ${footerHtml}
    </div>
  `
}
