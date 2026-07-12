import { createContext, useContext } from 'react'

export type Tab = 'track' | 'reports' | 'categories' | 'settings'

interface NavState {
  tab: Tab
  setTab: (tab: Tab) => void
}

export const NavContext = createContext<NavState | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export function useNav(): NavState {
  const ctx = useContext(NavContext)
  if (!ctx) throw new Error('useNav must be used within NavContext')
  return ctx
}
