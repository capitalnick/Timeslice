import { useState } from 'react'
import { DataProvider, useData } from '@/context/DataContext'
import { NavContext, type Tab } from '@/context/NavContext'
import { AppShell } from '@/components/AppShell'

function LoadingGate({ children }: { children: React.ReactNode }) {
  const { loading } = useData()
  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-brand-400" />
      </div>
    )
  }
  return <>{children}</>
}

export function AuthedApp({ uid }: { uid: string }) {
  const [tab, setTab] = useState<Tab>('track')

  return (
    <DataProvider uid={uid}>
      <NavContext.Provider value={{ tab, setTab }}>
        <LoadingGate>
          <AppShell />
        </LoadingGate>
      </NavContext.Provider>
    </DataProvider>
  )
}
