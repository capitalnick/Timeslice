import { useState } from 'react'
import type { TimeEntry } from '@/types'
import { useData } from '@/context/DataContext'
import { formatDuration } from '@/lib/time'
import { CategoryLabel } from '@/components/ui/CategoryLabel'
import { EntryEditor } from './EntryEditor'
import { ClockIcon } from '@/components/ui/Icons'

interface EntriesListProps {
  entries: TimeEntry[]
  title: string
  emptyText: string
}

export function EntriesList({ entries, title, emptyText }: EntriesListProps) {
  const { categories } = useData()
  const [editing, setEditing] = useState<TimeEntry | null>(null)

  const sorted = [...entries].sort((a, b) => b.createdAt - a.createdAt)
  const total = entries.reduce((sum, e) => sum + e.minutes, 0)

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">{title}</h2>
        {total > 0 && (
          <span className="font-mono text-sm font-semibold text-slate-300">
            {formatDuration(total)}
          </span>
        )}
      </div>

      {sorted.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-800 py-8 text-center text-sm text-slate-500">
          {emptyText}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((entry) => (
            <li key={entry.id}>
              <button
                onClick={() => setEditing(entry)}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-left transition-colors hover:bg-slate-800/70"
              >
                <div className="min-w-0 flex-1">
                  <CategoryLabel
                    categories={categories}
                    categoryId={entry.categoryId}
                    className="text-sm font-medium text-slate-100"
                  />
                  {entry.note && (
                    <p className="mt-0.5 truncate pl-4 text-xs text-slate-500">{entry.note}</p>
                  )}
                </div>
                {entry.source === 'timer' && (
                  <ClockIcon width={14} height={14} className="text-slate-600" />
                )}
                <span className="font-mono text-sm font-semibold tabular-nums text-slate-200">
                  {formatDuration(entry.minutes)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <EntryEditor entry={editing} onClose={() => setEditing(null)} />
    </section>
  )
}
