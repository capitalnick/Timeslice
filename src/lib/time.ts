/** All durations in TimeSlice are multiples of this many minutes. */
export const INCREMENT = 15
export const MAX_ENTRY_MINUTES = 24 * 60

export type RoundMode = 'nearest' | 'up' | 'down'

/** Round a minute count to the nearest 15-minute increment (never negative). */
export function roundToIncrement(minutes: number, mode: RoundMode = 'nearest'): number {
  if (!Number.isFinite(minutes) || minutes <= 0) return 0
  const units = minutes / INCREMENT
  const rounded =
    mode === 'up' ? Math.ceil(units) : mode === 'down' ? Math.floor(units) : Math.round(units)
  return rounded * INCREMENT
}

/** Clamp a duration to a whole number of increments within [0, 24h]. */
export function clampMinutes(minutes: number): number {
  const snapped = roundToIncrement(minutes, 'nearest')
  return Math.min(MAX_ENTRY_MINUTES, Math.max(0, snapped))
}

/**
 * Round an elapsed timer duration. Any elapsed work rounds up to at least one
 * increment so a short-but-real session is never logged as zero.
 */
export function roundTimerElapsed(elapsedMinutes: number): number {
  if (elapsedMinutes <= 0) return 0
  return Math.max(INCREMENT, roundToIncrement(elapsedMinutes, 'nearest'))
}

/** `90` -> `"1h 30m"`, `45` -> `"45m"`, `120` -> `"2h"`, `0` -> `"0m"`. */
export function formatDuration(minutes: number): string {
  const total = Math.max(0, Math.round(minutes))
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/** Decimal hours to one place, e.g. `90` -> `"1.5"`. Used in CSV export. */
export function toDecimalHours(minutes: number): string {
  return (minutes / 60).toFixed(2)
}

/** `HH:MM:SS` for a live timer, from elapsed milliseconds. */
export function formatStopwatch(elapsedMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000))
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}
