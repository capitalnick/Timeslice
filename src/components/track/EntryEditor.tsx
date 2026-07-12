import { useEffect, useState } from 'react'
import type { TimeEntry } from '@/types'
import { useData } from '@/context/DataContext'
import { CategoryPicker } from '@/components/CategoryPicker'
import { CategoryLabel } from '@/components/ui/CategoryLabel'
import { DurationStepper } from '@/components/DurationStepper'
import { Sheet } from '@/components/ui/Sheet'
import { Button, IconButton } from '@/components/ui/Button'
import { ChevronRight, TrashIcon } from '@/components/ui/Icons'
import { ConfirmDialog } from '@/components/ui/Confirm'
import { dateKey } from '@/lib/week'

interface EntryEditorProps {
  entry: TimeEntry | null
  onClose: () => void
}

export function EntryEditor({ entry, onClose }: EntryEditorProps) {
  const { categories, updateEntry, deleteEntry } = useData()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [categoryId, setCategoryId] = useState('')
  const [minutes, setMinutes] = useState(0)
  const [note, setNote] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    if (!entry) return
    setCategoryId(entry.categoryId)
    setMinutes(entry.minutes)
    setNote(entry.note)
    setDate(entry.date)
  }, [entry])

  const save = async () => {
    if (!entry) return
    await updateEntry(entry.id, { categoryId, minutes, note: note.trim(), date })
    onClose()
  }

  const remove = async () => {
    if (!entry) return
    await deleteEntry(entry.id)
    setConfirmDelete(false)
    onClose()
  }

  return (
    <>
      <Sheet
        open={entry !== null}
        onClose={onClose}
        title="Edit entry"
        footer={
          <div className="flex gap-3">
            <IconButton
              label="Delete entry"
              onClick={() => setConfirmDelete(true)}
              className="!h-11 !w-11 border border-red-500/40 !text-red-300 hover:!bg-red-500/10"
            >
              <TrashIcon />
            </IconButton>
            <Button block onClick={save} disabled={!categoryId || minutes <= 0}>
              Save changes
            </Button>
          </div>
        }
      >
        <button
          onClick={() => setPickerOpen(true)}
          className="mb-4 flex w-full items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-left transition-colors hover:bg-slate-800"
        >
          <CategoryLabel
            categories={categories}
            categoryId={categoryId}
            className="flex-1 text-sm font-medium text-slate-100"
          />
          <ChevronRight width={18} height={18} className="text-slate-500" />
        </button>

        <DurationStepper minutes={minutes} onChange={setMinutes} />

        <input
          type="date"
          value={date}
          max={dateKey(new Date())}
          onChange={(e) => e.target.value && setDate(e.target.value)}
          className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 focus:border-brand-500 focus:outline-none"
        />

        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional)"
          maxLength={120}
          className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
        />

        <CategoryPicker
          open={pickerOpen}
          categories={categories}
          onClose={() => setPickerOpen(false)}
          onSelect={(id) => {
            setCategoryId(id)
            setPickerOpen(false)
          }}
        />
      </Sheet>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete entry?"
        message="This time entry will be permanently removed."
        confirmLabel="Delete"
        danger
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  )
}
