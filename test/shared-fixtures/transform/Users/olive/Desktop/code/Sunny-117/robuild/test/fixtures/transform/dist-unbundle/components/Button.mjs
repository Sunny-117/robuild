export interface ButtonProps {
  label: string
  onClick: () => void
}

export function Button(props: ButtonProps) {
  return {
    label: props.label,
    onClick: props.onClick,
  }
}
