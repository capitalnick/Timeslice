import { formatDuration } from '@/lib/time'

interface WeekBarsProps {
  dayLabels: string[]
  dayNumbers: string[]
  minutes: number[]
  todayIndex: number
}

/** A compact 7-day column chart for the selected week. */
export function WeekBars({ dayLabels, dayNumbers, minutes, todayIndex }: WeekBarsProps) {
  const max = Math.max(60, ...minutes)
  return (
    <div className="flex items-end justify-between gap-1.5 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      {minutes.map((m, i) => {
        const heightPct = (m / max) * 100
        const isToday = i === todayIndex
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex h-24 w-full items-end">
              <div
                className={`w-full rounded-md transition-all ${
                  isToday ? 'bg-brand-400' : 'bg-brand-500/45'
                }`}
                style={{ height: `${Math.max(m > 0 ? 6 : 0, heightPct)}%` }}
                title={formatDuration(m)}
              />
            </div>
            <span
              className={`text-[11px] font-medium ${isToday ? 'text-brand-300' : 'text-slate-500'}`}
            >
              {dayLabels[i]}
            </span>
            <span className={`text-[11px] ${isToday ? 'text-white' : 'text-slate-600'}`}>
              {dayNumbers[i]}
            </span>
          </div>
        )
      })}
    </div>
  )
}
