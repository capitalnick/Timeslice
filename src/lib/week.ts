import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  addDays,
  format,
  parse,
  isSameWeek,
  isSameDay,
} from 'date-fns'
import type { WeekStartDay } from '@/types'

/** Start of the week (00:00 on the configured first day) containing `d`. */
export function weekStart(d: Date, weekStartsOn: WeekStartDay): Date {
  return startOfWeek(d, { weekStartsOn })
}

export function weekEnd(d: Date, weekStartsOn: WeekStartDay): Date {
  return endOfWeek(d, { weekStartsOn })
}

export function shiftWeek(d: Date, delta: number): Date {
  return addWeeks(d, delta)
}

/** The seven Date objects for the week containing `d`, in display order. */
export function weekDays(d: Date, weekStartsOn: WeekStartDay): Date[] {
  const start = weekStart(d, weekStartsOn)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

/** Local `yyyy-MM-dd` key used to attribute an entry to a day. */
export function dateKey(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

/** Parse a `yyyy-MM-dd` key back to a local Date at midnight. */
export function parseKey(key: string): Date {
  return parse(key, 'yyyy-MM-dd', new Date())
}

export function isSameWeekAs(a: Date, b: Date, weekStartsOn: WeekStartDay): boolean {
  return isSameWeek(a, b, { weekStartsOn })
}

export { isSameDay }

/** e.g. `"12 – 18 Jul 2026"` (compact when the month/year match). */
export function weekRangeLabel(d: Date, weekStartsOn: WeekStartDay): string {
  const start = weekStart(d, weekStartsOn)
  const end = weekEnd(d, weekStartsOn)
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()
  if (sameMonth) return `${format(start, 'd')} – ${format(end, 'd MMM yyyy')}`
  const sameYear = start.getFullYear() === end.getFullYear()
  return `${format(start, sameYear ? 'd MMM' : 'd MMM yyyy')} – ${format(end, 'd MMM yyyy')}`
}

export function dayLabel(d: Date): string {
  return format(d, 'EEE')
}

export function dayNumber(d: Date): string {
  return format(d, 'd')
}
