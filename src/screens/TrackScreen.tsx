import { useMemo } from 'react'
import { format } from 'date-fns'
import { useData } from '@/context/DataContext'
import { dateKey } from '@/lib/week'
import { formatDuration } from '@/lib/time'
import { TimerCard } from '@/components/track/TimerCard'
import { ManualLogCard } from '@/components/track/ManualLogCard'
import { EntriesList } from '@/components/track/EntriesList'
import { EmptyCategories } from '@/components/EmptyCategories'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function TrackScreen() {
  const { categories, entries } = useData()
  const today = dateKey(new Date())

  const todayEntries = useMemo(() => entries.filter((e) => e.date === today), [entries, today])
  const todayTotal = todayEntries.reduce((s, e) => s + e.minutes, 0)

  const hasCategories = categories.some((c) => !c.archived)

  return (
    <div className="flex flex-col gap-5">
      <header>
        <p className="text-sm text-slate-400">{greeting()}</p>
        <h1 className="text-2xl font-extrabold text-white">{format(new Date(), 'EEEE, d MMM')}</h1>
        <p className="mt-1 text-sm text-slate-400">
          Logged today:{' '}
          <span className="font-semibold text-brand-300">{formatDuration(todayTotal)}</span>
        </p>
      </header>

      {hasCategories ? (
        <>
          <TimerCard />
          <ManualLogCard />
          <EntriesList
            entries={todayEntries}
            title="Today"
            emptyText="No time logged yet today. Start a timer or log some above."
          />
        </>
      ) : (
        <EmptyCategories />
      )}
    </div>
  )
}
