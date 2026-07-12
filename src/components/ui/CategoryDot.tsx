interface CategoryDotProps {
  color: string
  size?: number
  className?: string
}

export function CategoryDot({ color, size = 12, className = '' }: CategoryDotProps) {
  return (
    <span
      className={`inline-block shrink-0 rounded-full ${className}`}
      style={{ width: size, height: size, backgroundColor: color }}
      aria-hidden="true"
    />
  )
}
