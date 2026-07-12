import type { Category, TimeEntry } from '@/types'
import { childrenOf, resolvePath } from '@/lib/tree'

export interface Bucket {
  key: string
  label: string
  color: string
  minutes: number
  /** Present when the bucket maps to a real category (enables drill-down). */
  categoryId?: string
  drillable: boolean
}

/** Entries falling within an inclusive `yyyy-MM-dd` key range (keys sort lexically). */
export function entriesInRange(
  entries: TimeEntry[],
  startKey: string,
  endKey: string,
): TimeEntry[] {
  return entries.filter((e) => e.date >= startKey && e.date <= endKey)
}

export function totalMinutes(entries: TimeEntry[]): number {
  return entries.reduce((sum, e) => sum + e.minutes, 0)
}

/** Minutes logged on each day key, in the order the keys are given. */
export function dailyTotals(entries: TimeEntry[], dayKeys: string[]): number[] {
  const map = new Map<string, number>()
  for (const e of entries) map.set(e.date, (map.get(e.date) ?? 0) + e.minutes)
  return dayKeys.map((k) => map.get(k) ?? 0)
}

interface BreakdownOptions {
  /** null = top level (group by L1). Otherwise group children of this category. */
  parentId: string | null
  /** The level of the buckets produced (1, 2, or 3). */
  level: 1 | 2 | 3
}

/**
 * Group a set of entries into buckets at the requested level. Entries logged
 * shallower than the requested level (e.g. logged straight onto an L1 while we
 * break down by L2) collect into a single "Direct" bucket.
 */
export function breakdown(
  entries: TimeEntry[],
  categories: Category[],
  { parentId, level }: BreakdownOptions,
): Bucket[] {
  const buckets = new Map<string, Bucket>()

  for (const e of entries) {
    const path = resolvePath(categories, e.categoryId)
    if (!path) continue

    if (level === 2 && path.l1.id !== parentId) continue
    if (level === 3 && path.l2?.id !== parentId) continue

    const node = level === 1 ? path.l1 : level === 2 ? path.l2 : path.l3
    const color = path.l1.color

    if (!node) {
      const key = 'direct'
      const existing = buckets.get(key)
      buckets.set(key, {
        key,
        label: 'Direct',
        color,
        minutes: (existing?.minutes ?? 0) + e.minutes,
        drillable: false,
      })
      continue
    }

    const existing = buckets.get(node.id)
    buckets.set(node.id, {
      key: node.id,
      label: node.name,
      color,
      minutes: (existing?.minutes ?? 0) + e.minutes,
      categoryId: node.id,
      drillable: level < 3 && childrenOf(categories, node.id).length > 0,
    })
  }

  return [...buckets.values()].sort((a, b) => b.minutes - a.minutes)
}

/** CSV of every entry in the set, with the full category path resolved. */
export function entriesToCsv(entries: TimeEntry[], categories: Category[]): string {
  const header = ['Date', 'Level 1', 'Level 2', 'Level 3', 'Minutes', 'Hours', 'Source', 'Note']
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
  const rows = [...entries]
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.createdAt - b.createdAt))
    .map((e) => {
      const p = resolvePath(categories, e.categoryId)
      return [
        e.date,
        p?.l1?.name ?? '',
        p?.l2?.name ?? '',
        p?.l3?.name ?? '',
        String(e.minutes),
        (e.minutes / 60).toFixed(2),
        e.source,
        e.note,
      ]
        .map((cell) => escape(String(cell)))
        .join(',')
    })
  return [header.map(escape).join(','), ...rows].join('\n')
}
