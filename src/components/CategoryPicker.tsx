import { useMemo, useState } from 'react'
import type { Category } from '@/types'
import { childrenOf, resolvePath } from '@/lib/tree'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { CategoryDot } from '@/components/ui/CategoryDot'
import { ChevronRight, ChevronLeft, CheckIcon } from '@/components/ui/Icons'

interface CategoryPickerProps {
  open: boolean
  categories: Category[]
  onSelect: (categoryId: string) => void
  onClose: () => void
}

/**
 * Drill-down picker across the 3 levels. Leaf rows select immediately; rows
 * with children drill in; a "Log to …" header lets you select a parent node.
 */
export function CategoryPicker({ open, categories, onSelect, onClose }: CategoryPickerProps) {
  const [parentId, setParentId] = useState<string | null>(null)

  const colorFor = (cat: Category) => resolvePath(categories, cat.id)?.l1.color ?? cat.color
  const current = parentId ? categories.find((c) => c.id === parentId) ?? null : null
  const rows = useMemo(() => childrenOf(categories, parentId), [categories, parentId])

  const reset = () => setParentId(null)
  const close = () => {
    reset()
    onClose()
  }
  const pick = (id: string) => {
    onSelect(id)
    reset()
  }

  return (
    <Sheet open={open} onClose={close} title="Choose a category">
      {current && (
        <div className="mb-3 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setParentId(current.parentId)}
            className="!px-2"
          >
            <ChevronLeft width={18} height={18} />
            Back
          </Button>
          <Button variant="subtle" size="sm" onClick={() => pick(current.id)} className="ml-auto">
            <CheckIcon width={16} height={16} />
            Log to “{current.name}”
          </Button>
        </div>
      )}

      {current && (
        <p className="mb-2 truncate text-xs font-medium uppercase tracking-wide text-slate-500">
          {pathBreadcrumb(categories, current.id)}
        </p>
      )}

      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">
          {current
            ? 'No sub-categories yet. Use “Log to …” above, or add some in Categories.'
            : 'No categories yet. Add some in the Categories tab first.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {rows.map((cat) => {
            const kids = childrenOf(categories, cat.id)
            const hasKids = kids.length > 0
            return (
              <li key={cat.id}>
                <button
                  onClick={() => (hasKids ? setParentId(cat.id) : pick(cat.id))}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-800/40 px-4 py-3 text-left transition-colors hover:bg-slate-800"
                >
                  <CategoryDot color={colorFor(cat)} />
                  <span className="flex-1 truncate font-medium text-slate-100">{cat.name}</span>
                  {hasKids ? (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      {kids.length}
                      <ChevronRight width={16} height={16} />
                    </span>
                  ) : (
                    <CheckIcon width={16} height={16} className="text-slate-600" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </Sheet>
  )
}

function pathBreadcrumb(categories: Category[], id: string): string {
  const path = resolvePath(categories, id)
  if (!path) return ''
  return [path.l1?.name, path.l2?.name, path.l3?.name].filter(Boolean).join(' › ')
}
