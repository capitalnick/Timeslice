import { INCREMENT, MAX_ENTRY_MINUTES, formatDuration } from '@/lib/time'
import { IconButton } from '@/components/ui/Button'
import { MinusIcon, PlusIcon } from '@/components/ui/Icons'

interface DurationStepperProps {
  minutes: number
  onChange: (minutes: number) => void
}

const QUICK = [15, 30, 45, 60, 90, 120]

export function DurationStepper({ minutes, onChange }: DurationStepperProps) {
  const clamp = (m: number) => Math.min(MAX_ENTRY_MINUTES, Math.max(0, m))
  const step = (delta: number) => onChange(clamp(minutes + delta))

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <IconButton
          label="Subtract 15 minutes"
          onClick={() => step(-INCREMENT)}
          disabled={minutes <= 0}
          className="!h-14 !w-14 border border-slate-700 bg-slate-800 !text-white hover:!bg-slate-700"
        >
          <MinusIcon width={24} height={24} />
        </IconButton>

        <div className="text-center">
          <div className="font-mono text-4xl font-extrabold tabular-nums text-white">
            {formatDuration(minutes)}
          </div>
          <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">
            15-minute steps
          </div>
        </div>

        <IconButton
          label="Add 15 minutes"
          onClick={() => step(INCREMENT)}
          disabled={minutes >= MAX_ENTRY_MINUTES}
          className="!h-14 !w-14 border border-slate-700 bg-slate-800 !text-white hover:!bg-slate-700"
        >
          <PlusIcon width={24} height={24} />
        </IconButton>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {QUICK.map((q) => {
          const active = minutes === q
          return (
            <button
              key={q}
              onClick={() => onChange(q)}
              className={`rounded-lg border px-2 py-2 text-sm font-semibold transition-colors ${
                active
                  ? 'border-brand-500 bg-brand-500/15 text-brand-200'
                  : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {formatDuration(q)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
