import { useEffect, useState } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { CATEGORY_COLORS } from '@/lib/colors'
import { CheckIcon } from '@/components/ui/Icons'

export interface CategoryFormValue {
  name: string
  color: string
}

interface CategoryFormSheetProps {
  open: boolean
  title: string
  showColor: boolean
  initial: CategoryFormValue
  submitLabel?: string
  onSubmit: (value: CategoryFormValue) => Promise<void> | void
  onClose: () => void
}

export function CategoryFormSheet({
  open,
  title,
  showColor,
  initial,
  submitLabel = 'Save',
  onSubmit,
  onClose,
}: CategoryFormSheetProps) {
  const [name, setName] = useState(initial.name)
  const [color, setColor] = useState(initial.color)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) {
      setName(initial.name)
      setColor(initial.color)
    }
  }, [open, initial.name, initial.color])

  const submit = async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    setBusy(true)
    try {
      await onSubmit({ name: trimmed, color })
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <Button block onClick={submit} disabled={!name.trim() || busy}>
          {submitLabel}
        </Button>
      }
    >
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
        Name
      </label>
      <input
        autoFocus
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="e.g. Deep Work"
        maxLength={60}
        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
      />

      {showColor && (
        <>
          <label className="mb-2 mt-5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Colour
          </label>
          <div className="grid grid-cols-8 gap-2">
            {CATEGORY_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                aria-label={`Select colour ${c}`}
                className="flex aspect-square items-center justify-center rounded-lg ring-2 ring-transparent transition-transform active:scale-90"
                style={{ backgroundColor: c, boxShadow: color === c ? `0 0 0 2px #0f172a, 0 0 0 4px ${c}` : undefined }}
              >
                {color === c && <CheckIcon width={16} height={16} className="text-white" />}
              </button>
            ))}
          </div>
        </>
      )}
    </Sheet>
  )
}
