import { useState } from 'react'
import { useData } from '@/context/DataContext'
import { useNow } from '@/hooks/useNow'
import { formatStopwatch, formatDuration, roundTimerElapsed } from '@/lib/time'
import { CategoryPicker } from '@/components/CategoryPicker'
import { CategoryLabel } from '@/components/ui/CategoryLabel'
import { Button } from '@/components/ui/Button'
import { PlayIcon, StopIcon, ClockIcon } from '@/components/ui/Icons'

export function TimerCard() {
  const { categories, timer, startTimer, stopTimer, cancelTimer } = useData()
  const [pickerOpen, setPickerOpen] = useState(false)
  const running = timer !== null
  const now = useNow(running)

  const elapsedMs = running ? Math.max(0, now - timer.startedAt) : 0
  const projected = roundTimerElapsed(elapsedMs / 60000)

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      {running ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2 text-brand-300">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-brand-400" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-400" />
            </span>
            <CategoryLabel
              categories={categories}
              categoryId={timer.categoryId}
              className="text-sm font-semibold"
            />
          </div>
          <div className="font-mono text-5xl font-extrabold tabular-nums text-white">
            {formatStopwatch(elapsedMs)}
          </div>
          <p className="text-xs text-slate-500">
            Will log <span className="font-semibold text-slate-300">{formatDuration(projected)}</span>{' '}
            (rounded to 15 min)
          </p>
          <div className="flex w-full gap-3">
            <Button variant="subtle" block onClick={cancelTimer}>
              Discard
            </Button>
            <Button block onClick={() => void stopTimer()}>
              <StopIcon width={18} height={18} />
              Stop &amp; log
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setPickerOpen(true)}
          disabled={categories.length === 0}
          className="flex w-full items-center gap-4 rounded-xl text-left disabled:opacity-40"
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
            <PlayIcon width={24} height={24} />
          </span>
          <span className="flex flex-col">
            <span className="text-base font-bold text-white">Start a timer</span>
            <span className="flex items-center gap-1 text-sm text-slate-400">
              <ClockIcon width={14} height={14} />
              Track live, rounds to 15 min on stop
            </span>
          </span>
        </button>
      )}

      <CategoryPicker
        open={pickerOpen}
        categories={categories}
        onClose={() => setPickerOpen(false)}
        onSelect={(id) => {
          void startTimer(id, '')
          setPickerOpen(false)
        }}
      />
    </section>
  )
}
