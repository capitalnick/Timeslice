export type CategoryLevel = 1 | 2 | 3

/**
 * A node in the 3-level category tree. Level-1 nodes have `parentId: null`.
 * `color` is stored on every node but only meaningfully edited on level 1;
 * descendants inherit their level-1 ancestor's colour for display.
 */
export interface Category {
  id: string
  name: string
  level: CategoryLevel
  parentId: string | null
  color: string
  order: number
  archived: boolean
  createdAt: number
}

export type EntrySource = 'manual' | 'timer'

/** A logged block of time. `minutes` is always a positive multiple of 15. */
export interface TimeEntry {
  id: string
  categoryId: string
  minutes: number
  note: string
  /** Local day the time is attributed to, formatted `yyyy-MM-dd`. */
  date: string
  createdAt: number
  source: EntrySource
}

/** Persisted running-timer state (synced so it survives reloads / devices). */
export interface RunningTimer {
  categoryId: string
  /** Epoch milliseconds when the timer was started. */
  startedAt: number
  note: string
}

export type WeekStartDay = 0 | 1

export interface Settings {
  weekStartsOn: WeekStartDay
}

export const DEFAULT_SETTINGS: Settings = { weekStartsOn: 1 }

/** A category resolved to its full ancestry, for display and reporting. */
export interface CategoryPath {
  l1: Category
  l2?: Category
  l3?: Category
  leaf: Category
}
