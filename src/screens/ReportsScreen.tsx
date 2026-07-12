import { useMemo, useState } from 'react'
import { useData } from '@/context/DataContext'
import {
  weekDays,
  shiftWeek,
  dateKey,
  weekRangeLabel,
  dayLabel,
  dayNumber,
  isSameWeekAs,
} from '@/lib/week'
import { breakdown, dailyTotals, entriesInRange, entriesToCsv, totalMinutes, type Bucket } from '@/lib/report'
import { formatDuration } from '@/lib/time'
import { WeekBars } from '@/components/reports/WeekBars'
import { BarList } from '@/components/reports/BarList'
import { EntriesList } from '@/components/track/EntriesList'
import { IconButton, Button } from '@/components/ui/Button'
import { ChevronLeft, ChevronRight, DownloadIcon } from '@/components/ui/Icons'
import { downloadTextFile } from '@/utils/download'

interface Crumb {
  parentId: string
  label: string
}

export function ReportsScreen() {
  const { categories, entries, settings } = useData()
  const [anchor, setAnchor] = useState(() => new Date())
  const [drill, setDrill] = useState<Crumb[]>([])
  const [showEntries, setShowEntries] = useState(false)

  const wsod = settings.weekStartsOn
  const days = useMemo(() => weekDays(anchor, wsod), [anchor, wsod])
  const dayKeys = useMemo(() => days.map(dateKey), [days])
  const startKey = dayKeys[0]
  const endKey = dayKeys[6]

  const weekEntries = useMemo(
    () => entriesInRange(entries, startKey, endKey),
    [entries, startKey, endKey],
  )
  const total = totalMinutes(weekEntries)
  const daily = useMemo(() => dailyTotals(weekEntries, dayKeys), [weekEntries, dayKeys])

  const level = (drill.length + 1) as 1 | 2 | 3
  const parentId = drill.length > 0 ? drill[drill.length - 1].parentId : null
  const buckets = useMemo(
    () => breakdown(weekEntries, categories, { parentId, level }),
    [weekEntries, categories, parentId, level],
  )

  const isCurrentWeek = isSameWeekAs(anchor, new Date(), wsod)
  const todayIndex = dayKeys.indexOf(dateKey(new Date()))

  const onDrill = (b: Bucket) => {
    if (b.categoryId) setDrill((d) => [...d, { parentId: b.categoryId!, label: b.label }])
  }
  const goToDepth = (depth: number) => setDrill((d) => d.slice(0, depth))

  const exportCsv = () => {
    const csv = entriesToCsv(weekEntries, categories)
    downloadTextFile(`timeslice-${startKey}_to_${endKey}.csv`, csv)
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold text-white">Reports</h1>
          <p className="truncate text-sm text-slate-400">{weekRangeLabel(anchor, wsod)}</p>
        </div>
        <div className="flex items-center gap-1">
          <IconButton label="Previous week" onClick={() => setAnchor((a) => shiftWeek(a, -1))}>
            <ChevronLeft />
          </IconButton>
          <IconButton
            label="Next week"
            onClick={() => setAnchor((a) => shiftWeek(a, 1))}
            disabled={isCurrentWeek}
          >
            <ChevronRight />
          </IconButton>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-gradient-to-br from-brand-500/15 to-slate-900/10 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-200">
          {isCurrentWeek ? 'This week' : 'Week total'}
        </p>
        <p className="mt-1 font-mono text-4xl font-extrabold text-white">{formatDuration(total)}</p>
        {!isCurrentWeek && (
          <button
            onClick={() => setAnchor(new Date())}
            className="mt-2 text-sm font-medium text-brand-300 hover:underline"
          >
            Jump to this week
          </button>
        )}
      </section>

      <WeekBars
        dayLabels={days.map(dayLabel)}
        dayNumbers={days.map(dayNumber)}
        minutes={daily}
        todayIndex={todayIndex}
      />

      <section>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Breakdown</h2>
          <Button variant="ghost" size="sm" className="ml-auto !px-2" onClick={exportCsv}>
            <DownloadIcon width={16} height={16} />
            CSV
          </Button>
        </div>

        <nav className="mb-3 flex flex-wrap items-center gap-1 text-sm">
          <button
            onClick={() => goToDepth(0)}
            className={drill.length === 0 ? 'font-semibold text-white' : 'text-brand-300 hover:underline'}
          >
            All
          </button>
          {drill.map((c, i) => (
            <span key={c.parentId} className="flex items-center gap-1">
              <ChevronRight width={14} height={14} className="text-slate-600" />
              <button
                onClick={() => goToDepth(i + 1)}
                className={
                  i === drill.length - 1
                    ? 'font-semibold text-white'
                    : 'text-brand-300 hover:underline'
                }
              >
                {c.label}
              </button>
            </span>
          ))}
        </nav>

        <BarList buckets={buckets} total={total} onDrill={onDrill} />
      </section>

      <section>
        <button
          onClick={() => setShowEntries((v) => !v)}
          className="mb-3 flex w-full items-center justify-between text-sm font-bold uppercase tracking-wide text-slate-400"
        >
          <span>All entries ({weekEntries.length})</span>
          <ChevronRight
            width={18}
            height={18}
            style={{ transform: showEntries ? 'rotate(90deg)' : 'none' }}
            className="transition-transform"
          />
        </button>
        {showEntries && (
          <EntriesList
            entries={weekEntries}
            title="This week"
            emptyText="No entries logged this week."
          />
        )}
      </section>
    </div>
  )
}
