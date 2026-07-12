import { useData } from '@/context/DataContext'
import { useNav } from '@/context/NavContext'
import { useNow } from '@/hooks/useNow'
import { formatStopwatch } from '@/lib/time'
import { CategoryLabel } from '@/components/ui/CategoryLabel'
import { StopIcon } from '@/components/ui/Icons'

/** Slim persistent bar shown above the nav while a timer runs (any tab). */
export function GlobalTimerBar() {
  const { categories, timer, stopTimer } = useData()
  const { tab, setTab } = useNav()
  const running = timer !== null
  const now = useNow(running)

  // On the Track tab the full TimerCard already shows the running timer.
  if (!running || tab === 'track') return null

  return (
    <div className="pointer-events-auto mx-auto mb-2 max-w-md px-4">
      <div className="flex items-center gap-3 rounded-2xl border border-brand-500/40 bg-slate-800/95 px-3 py-2 shadow-lg backdrop-blur">
        <button
          onClick={() => setTab('track')}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-brand-400" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-400" />
          </span>
          <CategoryLabel
            categories={categories}
            categoryId={timer.categoryId}
            className="min-w-0 text-sm font-medium text-slate-100"
          />
        </button>
        <span className="font-mono text-sm font-bold tabular-nums text-white">
          {formatStopwatch(now - timer.startedAt)}
        </span>
        <button
          onClick={() => void stopTimer()}
          aria-label="Stop timer"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white hover:bg-brand-600"
        >
          <StopIcon width={16} height={16} />
        </button>
      </div>
    </div>
  )
}
