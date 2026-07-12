import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { entriesToCsv } from '@/lib/report'
import { downloadTextFile } from '@/utils/download'
import { dateKey } from '@/lib/week'
import type { WeekStartDay } from '@/types'
import { LogOutIcon, DownloadIcon, InstallIcon } from '@/components/ui/Icons'

export function SettingsScreen() {
  const { user, signOut } = useAuth()
  const { settings, saveSettings, entries, categories } = useData()
  const { canInstall, install } = useInstallPrompt()

  const setWeekStart = (day: WeekStartDay) => void saveSettings({ weekStartsOn: day })

  const exportAll = () => {
    const csv = entriesToCsv(entries, categories)
    downloadTextFile(`timeslice-all-${dateKey(new Date())}.csv`, csv)
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-extrabold text-white">Settings</h1>
      </header>

      <Group title="Account">
        <div className="flex items-center gap-3 px-4 py-3">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="h-10 w-10 rounded-full" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/20 font-bold text-brand-300">
              {(user?.displayName ?? user?.email ?? '?').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {user?.displayName ?? 'Signed in'}
            </p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>
        <Divider />
        <RowButton onClick={() => void signOut()} icon={<LogOutIcon width={18} height={18} />}>
          Sign out
        </RowButton>
      </Group>

      <Group title="Week">
        <div className="px-4 py-3">
          <p className="mb-2 text-sm text-slate-300">Week starts on</p>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                [1, 'Monday'],
                [0, 'Sunday'],
              ] as const
            ).map(([day, label]) => {
              const active = settings.weekStartsOn === day
              return (
                <button
                  key={day}
                  onClick={() => setWeekStart(day)}
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? 'border-brand-500 bg-brand-500/15 text-brand-200'
                      : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Reports group and reset by this weekly boundary. Your history is always kept.
          </p>
        </div>
      </Group>

      <Group title="Data">
        <RowButton onClick={exportAll} icon={<DownloadIcon width={18} height={18} />}>
          Export all data (CSV)
        </RowButton>
        {canInstall && (
          <>
            <Divider />
            <RowButton onClick={() => void install()} icon={<InstallIcon width={18} height={18} />}>
              Install app
            </RowButton>
          </>
        )}
      </Group>

      <p className="px-1 text-center text-xs text-slate-600">
        TimeSlice · {entries.length} entries synced to your account
      </p>
    </div>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
        {children}
      </div>
    </section>
  )
}

function Divider() {
  return <div className="mx-4 border-t border-slate-800" />
}

function RowButton({
  onClick,
  icon,
  children,
}: {
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800"
    >
      <span className="text-slate-400">{icon}</span>
      {children}
    </button>
  )
}
