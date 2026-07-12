import { useMemo, useState } from 'react'
import type { Category, CategoryLevel } from '@/types'
import { useData } from '@/context/DataContext'
import { childrenOf, resolvePath } from '@/lib/tree'
import { nextColor } from '@/lib/colors'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { CategoryDot } from '@/components/ui/CategoryDot'
import { CategoryFormSheet, type CategoryFormValue } from '@/components/categories/CategoryFormSheet'
import { ChevronRight, ChevronLeft, CheckIcon, PlusIcon } from '@/components/ui/Icons'

interface CategoryPickerProps {
  open: boolean
  categories: Category[]
  onSelect: (categoryId: string) => void
  onClose: () => void
}

/**
 * Drill-down picker across the 3 levels. Leaf rows select immediately; rows
 * with children drill in; a "Log to …" header selects a parent node. New
 * categories and subcategories can be created inline at any level.
 */
export function CategoryPicker({ open, categories, onSelect, onClose }: CategoryPickerProps) {
  const { createCategory } = useData()
  const [parentId, setParentId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  const colorFor = (cat: Category) => resolvePath(categories, cat.id)?.l1.color ?? cat.color
  const current = parentId ? categories.find((c) => c.id === parentId) ?? null : null
  const rows = useMemo(() => childrenOf(categories, parentId), [categories, parentId])

  // You can add a child here at root (a new L1) or inside any node above L3.
  const canAdd = current === null || current.level < 3
  const addLevel: CategoryLevel = current ? ((current.level + 1) as CategoryLevel) : 1
  const addColor = current
    ? colorFor(current)
    : nextColor(categories.filter((c) => c.level === 1).map((c) => c.color))
  const addNoun = addLevel === 1 ? 'category' : addLevel === 2 ? 'subcategory' : 'item'

  const reset = () => setParentId(null)
  const close = () => {
    reset()
    onClose()
  }
  const pick = (id: string) => {
    onSelect(id)
    reset()
  }

  const handleCreate = async (value: CategoryFormValue) => {
    const newId = await createCategory({
      name: value.name,
      level: addLevel,
      parentId: current ? current.id : null,
      color: addLevel === 1 ? value.color : addColor,
      order: rows.length,
    })
    // Deepest level can't nest further — use it straight away. Otherwise drill
    // in so you can add sub-items or "Log to" it.
    if (addLevel === 3) pick(newId)
    else setParentId(newId)
  }

  return (
    <>
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

        <ul className="flex flex-col gap-1.5">
          {rows.map((cat) => {
            const kids = childrenOf(categories, cat.id)
            const canOpen = cat.level < 3
            return (
              <li key={cat.id}>
                {canOpen ? (
                  // Non-leaf: open it to browse/add inside, or log to it directly.
                  <div className="flex items-stretch gap-1.5">
                    <button
                      onClick={() => setParentId(cat.id)}
                      className="flex flex-1 items-center gap-3 rounded-xl border border-slate-800 bg-slate-800/40 px-4 py-3 text-left transition-colors hover:bg-slate-800"
                    >
                      <CategoryDot color={colorFor(cat)} />
                      <span className="flex-1 truncate font-medium text-slate-100">{cat.name}</span>
                      {kids.length > 0 && (
                        <span className="text-xs text-slate-500">{kids.length}</span>
                      )}
                      <ChevronRight width={16} height={16} className="text-slate-500" />
                    </button>
                    <button
                      onClick={() => pick(cat.id)}
                      aria-label={`Log time to ${cat.name}`}
                      title={`Log time to ${cat.name}`}
                      className="flex w-12 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-800/40 text-slate-400 transition-colors hover:bg-brand-500/15 hover:text-brand-300"
                    >
                      <CheckIcon width={18} height={18} />
                    </button>
                  </div>
                ) : (
                  // Leaf (level 3): tap logs to it.
                  <button
                    onClick={() => pick(cat.id)}
                    className="flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-800/40 px-4 py-3 text-left transition-colors hover:bg-slate-800"
                  >
                    <CategoryDot color={colorFor(cat)} />
                    <span className="flex-1 truncate font-medium text-slate-100">{cat.name}</span>
                    <CheckIcon width={16} height={16} className="text-slate-600" />
                  </button>
                )}
              </li>
            )
          })}

          {canAdd && (
            <li>
              <button
                onClick={() => setAddOpen(true)}
                className="flex w-full items-center gap-3 rounded-xl border border-dashed border-slate-700 px-4 py-3 text-left text-brand-300 transition-colors hover:border-brand-500 hover:bg-brand-500/5"
              >
                <PlusIcon width={18} height={18} />
                <span className="font-medium">
                  New {addNoun}
                  {current ? ` in “${current.name}”` : ''}
                </span>
              </button>
            </li>
          )}
        </ul>

        {current && rows.length === 0 && (
          <p className="mt-2 text-center text-xs text-slate-500">
            Nothing inside “{current.name}” yet — add one above, or use “Log to” to track time here.
          </p>
        )}
      </Sheet>

      <CategoryFormSheet
        open={addOpen}
        title={`New ${addNoun}${current ? ` in “${current.name}”` : ''}`}
        showColor={addLevel === 1}
        initial={{ name: '', color: addColor }}
        submitLabel="Create"
        onSubmit={handleCreate}
        onClose={() => setAddOpen(false)}
      />
    </>
  )
}

function pathBreadcrumb(categories: Category[], id: string): string {
  const path = resolvePath(categories, id)
  if (!path) return ''
  return [path.l1?.name, path.l2?.name, path.l3?.name].filter(Boolean).join(' › ')
}
