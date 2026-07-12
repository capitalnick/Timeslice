import { useState } from 'react'
import { subDays } from 'date-fns'
import { useData } from '@/context/DataContext'
import { dateKey } from '@/lib/week'
import { CategoryPicker } from '@/components/CategoryPicker'
import { CategoryLabel } from '@/components/ui/CategoryLabel'
import { DurationStepper } from '@/components/DurationStepper'
import { Button } from '@/components/ui/Button'
import { ChevronRight, PlusIcon } from '@/components/ui/Icons'

const todayKey = () => dateKey(new Date())
const yesterdayKey = () => dateKey(subDays(new Date(), 1))

export function ManualLogCard() {
  const { categories, addEntry } = useData()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [minutes, setMinutes] = useState(30)
  const [note, setNote] = useState('')
  const [date, setDate] = useState(todayKey)
  const [saving, setSaving] = useState(false)

  const canSave = categoryId !== null && minutes > 0 && !saving

  const submit = async () => {
    if (!categoryId || minutes <= 0) return
    setSaving(true)
    try {
      await addEntry({ categoryId, minutes, note: note.trim(), date, source: 'manual' })
      setNote('')
      setMinutes(30)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">Log time</h2>

      <button
        onClick={() => setPickerOpen(true)}
        disabled={categories.length === 0}
        className="mb-4 flex w-full items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-left transition-colors hover:bg-slate-800 disabled:opacity-40"
      >
        {categoryId ? (
          <CategoryLabel
            categories={categories}
            categoryId={categoryId}
            className="flex-1 text-sm font-medium text-slate-100"
          />
        ) : (
          <span className="flex-1 text-sm text-slate-400">Choose a category…</span>
        )}
        <ChevronRight width={18} height={18} className="text-slate-500" />
      </button>

      <DurationStepper minutes={minutes} onChange={setMinutes} />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <DayChip label="Today" active={date === todayKey()} onClick={() => setDate(todayKey())} />
        <DayChip
          label="Yesterday"
          active={date === yesterdayKey()}
          onClick={() => setDate(yesterdayKey())}
        />
        <input
          type="date"
          value={date}
          max={todayKey()}
          onChange={(e) => e.target.value && setDate(e.target.value)}
          className="ml-auto rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 focus:border-brand-500 focus:outline-none"
        />
      </div>

      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (optional)"
        maxLength={120}
        className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
      />

      <Button block size="lg" className="mt-4" disabled={!canSave} onClick={submit}>
        <PlusIcon width={18} height={18} />
        Log time
      </Button>

      <CategoryPicker
        open={pickerOpen}
        categories={categories}
        onClose={() => setPickerOpen(false)}
        onSelect={(id) => {
          setCategoryId(id)
          setPickerOpen(false)
        }}
      />
    </section>
  )
}

function DayChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'border-brand-500 bg-brand-500/15 text-brand-200'
          : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800'
      }`}
    >
      {label}
    </button>
  )
}
