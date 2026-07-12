import type { Bucket } from '@/lib/report'
import { formatDuration } from '@/lib/time'
import { CategoryDot } from '@/components/ui/CategoryDot'
import { ChevronRight } from '@/components/ui/Icons'
import { withAlpha } from '@/lib/colors'

interface BarListProps {
  buckets: Bucket[]
  total: number
  onDrill?: (bucket: Bucket) => void
}

export function BarList({ buckets, total, onDrill }: BarListProps) {
  if (buckets.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-800 py-8 text-center text-sm text-slate-500">
        No time logged in this period.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {buckets.map((b) => {
        const pct = total > 0 ? Math.round((b.minutes / total) * 100) : 0
        const width = total > 0 ? (b.minutes / total) * 100 : 0
        const clickable = b.drillable && onDrill
        const Row = clickable ? 'button' : 'div'
        return (
          <li key={b.key}>
            <Row
              {...(clickable ? { onClick: () => onDrill?.(b) } : {})}
              className={`w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-left ${
                clickable ? 'transition-colors hover:bg-slate-800/70' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <CategoryDot color={b.color} />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-100">
                  {b.label}
                </span>
                <span className="font-mono text-sm font-semibold tabular-nums text-slate-200">
                  {formatDuration(b.minutes)}
                </span>
                <span className="w-9 text-right text-xs tabular-nums text-slate-500">{pct}%</span>
                {clickable && <ChevronRight width={16} height={16} className="text-slate-600" />}
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${width}%`, backgroundColor: b.color, boxShadow: `0 0 8px ${withAlpha(b.color, 0.5)}` }}
                />
              </div>
            </Row>
          </li>
        )
      })}
    </ul>
  )
}
