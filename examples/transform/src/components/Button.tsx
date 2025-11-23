export interface ButtonProps {
  label: string
  onClick: () => void
}

export default function Button(props: ButtonProps) {
  return (
    <div onClick={props.onClick}>{props.label}</div>
  )
}
