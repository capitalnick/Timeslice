/** Curated palette for level-1 categories — legible on the dark UI. */
export const CATEGORY_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f43f5e', // rose
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#64748b', // slate
] as const

export const DEFAULT_CATEGORY_COLOR = CATEGORY_COLORS[0]

/** Deterministically pick a next colour that avoids ones already in use. */
export function nextColor(used: string[]): string {
  const free = CATEGORY_COLORS.find((c) => !used.includes(c))
  if (free) return free
  return CATEGORY_COLORS[used.length % CATEGORY_COLORS.length]
}

/** A translucent version of a hex colour, for soft backgrounds/borders. */
export function withAlpha(hex: string, alpha: number): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
