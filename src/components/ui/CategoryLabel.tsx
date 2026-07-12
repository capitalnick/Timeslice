import type { Category } from '@/types'
import { resolvePath, pathLabel } from '@/lib/tree'
import { CategoryDot } from './CategoryDot'

interface CategoryLabelProps {
  categories: Category[]
  categoryId: string
  className?: string
  dotSize?: number
}

/** Colored dot + "L1 › L2 › L3" breadcrumb, resolving deleted refs gracefully. */
export function CategoryLabel({
  categories,
  categoryId,
  className = '',
  dotSize = 10,
}: CategoryLabelProps) {
  const path = resolvePath(categories, categoryId)
  if (!path) {
    return <span className={`text-slate-500 italic ${className}`}>Deleted category</span>
  }
  return (
    <span className={`inline-flex min-w-0 items-center gap-2 ${className}`}>
      <CategoryDot color={path.l1.color} size={dotSize} />
      <span className="truncate">{pathLabel(path)}</span>
    </span>
  )
}
