import { useMemo, useState } from 'react'
import type { Category, CategoryLevel } from '@/types'
import { useData } from '@/context/DataContext'
import { childrenOf, descendantIds, resolvePath } from '@/lib/tree'
import { CategoryDot } from '@/components/ui/CategoryDot'
import { IconButton } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'
import { ConfirmDialog } from '@/components/ui/Confirm'
import { CategoryFormSheet, type CategoryFormValue } from './CategoryFormSheet'
import {
  ChevronRight,
  DotsVerticalIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArchiveIcon,
  ArrowUp,
  ArrowDown,
} from '@/components/ui/Icons'

interface TreeProps {
  parentId: string | null
  includeArchived: boolean
}

function reindexAfterMove(siblings: Category[], index: number, dir: -1 | 1) {
  const target = index + dir
  if (target < 0 || target >= siblings.length) return null
  const arr = [...siblings]
  const [item] = arr.splice(index, 1)
  arr.splice(target, 0, item)
  return arr.map((c, i) => ({ id: c.id, order: i }))
}

export function CategoryTree({ parentId, includeArchived }: TreeProps) {
  const { categories } = useData()
  const siblings = useMemo(
    () => childrenOf(categories, parentId, includeArchived),
    [categories, parentId, includeArchived],
  )

  if (siblings.length === 0) return null

  return (
    <ul className="flex flex-col gap-2">
      {siblings.map((cat, i) => (
        <CategoryNode
          key={cat.id}
          category={cat}
          siblings={siblings}
          index={i}
          includeArchived={includeArchived}
        />
      ))}
    </ul>
  )
}

interface NodeProps {
  category: Category
  siblings: Category[]
  index: number
  includeArchived: boolean
}

function CategoryNode({ category, siblings, index, includeArchived }: NodeProps) {
  const { categories, entries, createCategory, updateCategory, reorderCategories, setArchived, deleteCategory } =
    useData()
  const [expanded, setExpanded] = useState(category.level === 1)
  const [actionsOpen, setActionsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const kids = childrenOf(categories, category.id, includeArchived)
  const hasKids = kids.length > 0
  const canAddChild = category.level < 3
  const l1Color = resolvePath(categories, category.id)?.l1.color ?? category.color

  const move = async (dir: -1 | 1) => {
    const next = reindexAfterMove(siblings, index, dir)
    if (next) await reorderCategories(next)
  }

  const saveEdit = async (value: CategoryFormValue) => {
    const patch: Partial<Category> =
      category.level === 1 ? { name: value.name, color: value.color } : { name: value.name }
    await updateCategory(category.id, patch)
  }

  const addChild = async (value: CategoryFormValue) => {
    await createCategory({
      name: value.name,
      level: (category.level + 1) as CategoryLevel,
      parentId: category.id,
      color: l1Color,
      order: kids.length,
    })
    setExpanded(true)
  }

  const entryCount = useMemo(() => {
    const ids = new Set(descendantIds(categories, category.id))
    return entries.filter((e) => ids.has(e.categoryId)).length
  }, [categories, entries, category.id])

  const padding = ['pl-3', 'pl-6', 'pl-9'][category.level - 1] ?? 'pl-3'

  return (
    <li>
      <div
        className={`flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 py-2.5 pr-2 ${padding} ${
          category.archived ? 'opacity-50' : ''
        }`}
      >
        {hasKids ? (
          <button
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? 'Collapse' : 'Expand'}
            className="text-slate-500 transition-transform"
            style={{ transform: expanded ? 'rotate(90deg)' : 'none' }}
          >
            <ChevronRight width={16} height={16} />
          </button>
        ) : (
          <span className="w-4" />
        )}

        <CategoryDot color={l1Color} size={category.level === 1 ? 12 : 8} />
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-100">
          {category.name}
          {category.archived && <span className="ml-2 text-xs text-slate-500">archived</span>}
        </span>

        {canAddChild && (
          <IconButton label="Add subcategory" onClick={() => setAddOpen(true)}>
            <PlusIcon width={18} height={18} />
          </IconButton>
        )}
        <IconButton label="More actions" onClick={() => setActionsOpen(true)}>
          <DotsVerticalIcon width={18} height={18} />
        </IconButton>
      </div>

      {expanded && hasKids && (
        <div className="mt-2 ml-3 border-l border-slate-800 pl-2">
          <CategoryTree parentId={category.id} includeArchived={includeArchived} />
        </div>
      )}

      {/* Actions */}
      <Sheet open={actionsOpen} onClose={() => setActionsOpen(false)} title={category.name}>
        <div className="flex flex-col gap-2">
          {canAddChild && (
            <ActionButton
              icon={<PlusIcon width={18} height={18} />}
              label={`Add ${category.level === 1 ? 'subcategory' : 'item'}`}
              onClick={() => {
                setActionsOpen(false)
                setAddOpen(true)
              }}
            />
          )}
          <ActionButton
            icon={<PencilIcon width={18} height={18} />}
            label={category.level === 1 ? 'Rename / colour' : 'Rename'}
            onClick={() => {
              setActionsOpen(false)
              setEditOpen(true)
            }}
          />
          <ActionButton
            icon={<ArrowUp width={18} height={18} />}
            label="Move up"
            disabled={index === 0}
            onClick={() => void move(-1)}
          />
          <ActionButton
            icon={<ArrowDown width={18} height={18} />}
            label="Move down"
            disabled={index === siblings.length - 1}
            onClick={() => void move(1)}
          />
          <ActionButton
            icon={<ArchiveIcon width={18} height={18} />}
            label={category.archived ? 'Un-archive' : 'Archive'}
            onClick={() => {
              void setArchived(category.id, !category.archived)
              setActionsOpen(false)
            }}
          />
          <ActionButton
            icon={<TrashIcon width={18} height={18} />}
            label="Delete"
            danger
            onClick={() => {
              setActionsOpen(false)
              setConfirmDelete(true)
            }}
          />
        </div>
      </Sheet>

      <CategoryFormSheet
        open={editOpen}
        title="Edit category"
        showColor={category.level === 1}
        initial={{ name: category.name, color: l1Color }}
        onSubmit={saveEdit}
        onClose={() => setEditOpen(false)}
      />
      <CategoryFormSheet
        open={addOpen}
        title={`New ${category.level === 1 ? 'subcategory' : 'item'} in “${category.name}”`}
        showColor={false}
        initial={{ name: '', color: l1Color }}
        submitLabel="Add"
        onSubmit={addChild}
        onClose={() => setAddOpen(false)}
      />

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete “${category.name}”?`}
        message={
          <>
            This removes the category
            {hasKids ? ' and all its sub-categories' : ''}
            {entryCount > 0 ? (
              <>
                , along with <span className="font-semibold text-white">{entryCount}</span> logged{' '}
                {entryCount === 1 ? 'entry' : 'entries'}
              </>
            ) : (
              ''
            )}
            . This can’t be undone. Consider archiving instead to keep your history.
          </>
        }
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          void deleteCategory(category.id)
          setConfirmDelete(false)
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </li>
  )
}

function ActionButton({
  icon,
  label,
  onClick,
  disabled,
  danger,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors disabled:opacity-30 ${
        danger ? 'text-red-300 hover:bg-red-500/10' : 'text-slate-200 hover:bg-slate-800'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
