import { useMemo, useState } from 'react'
import { useData } from '@/context/DataContext'
import { childrenOf } from '@/lib/tree'
import { nextColor } from '@/lib/colors'
import { CategoryTree } from '@/components/categories/CategoryTree'
import { CategoryFormSheet, type CategoryFormValue } from '@/components/categories/CategoryFormSheet'
import { EmptyCategories } from '@/components/EmptyCategories'
import { Button } from '@/components/ui/Button'
import { PlusIcon } from '@/components/ui/Icons'

export function CategoriesScreen() {
  const { categories, createCategory } = useData()
  const [addOpen, setAddOpen] = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  const roots = childrenOf(categories, null, showArchived)
  const usedColors = useMemo(
    () => categories.filter((c) => c.level === 1).map((c) => c.color),
    [categories],
  )
  const hasAny = categories.length > 0

  const addRoot = async (value: CategoryFormValue) => {
    await createCategory({
      name: value.name,
      level: 1,
      parentId: null,
      color: value.color,
      order: roots.length,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Categories</h1>
          <p className="text-sm text-slate-400">Up to three levels deep.</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <PlusIcon width={18} height={18} />
          Add
        </Button>
      </header>

      {!hasAny ? (
        <EmptyCategories />
      ) : (
        <>
          <CategoryTree parentId={null} includeArchived={showArchived} />
          <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-slate-400">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-brand-500"
            />
            Show archived
          </label>
        </>
      )}

      <CategoryFormSheet
        open={addOpen}
        title="New category"
        showColor
        initial={{ name: '', color: nextColor(usedColors) }}
        submitLabel="Add category"
        onSubmit={addRoot}
        onClose={() => setAddOpen(false)}
      />
    </div>
  )
}
