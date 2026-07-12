import { useNav } from '@/context/NavContext'
import { TrackScreen } from '@/screens/TrackScreen'
import { ReportsScreen } from '@/screens/ReportsScreen'
import { CategoriesScreen } from '@/screens/CategoriesScreen'
import { SettingsScreen } from '@/screens/SettingsScreen'
import { BottomNav } from '@/components/BottomNav'
import { GlobalTimerBar } from '@/components/GlobalTimerBar'

export function AppShell() {
  const { tab } = useNav()
  return (
    <div className="min-h-dvh">
      <main key={tab} className="animate-fade-in mx-auto max-w-md px-4 pb-36 pt-safe">
        <div className="pt-4">
          {tab === 'track' && <TrackScreen />}
          {tab === 'reports' && <ReportsScreen />}
          {tab === 'categories' && <CategoriesScreen />}
          {tab === 'settings' && <SettingsScreen />}
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40">
        <GlobalTimerBar />
        <BottomNav />
      </div>
    </div>
  )
}
