import { useNav, type Tab } from '@/context/NavContext'
import { ClockIcon, ChartIcon, GearIcon } from '@/components/ui/Icons'
import type { ReactElement, SVGProps } from 'react'

function FolderIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={22}
      height={22}
      aria-hidden="true"
      {...p}
    >
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    </svg>
  )
}

const TABS: { id: Tab; label: string; icon: (p: SVGProps<SVGSVGElement>) => ReactElement }[] = [
  { id: 'track', label: 'Track', icon: ClockIcon },
  { id: 'reports', label: 'Reports', icon: ChartIcon },
  { id: 'categories', label: 'Categories', icon: FolderIcon },
  { id: 'settings', label: 'Settings', icon: GearIcon },
]

export function BottomNav() {
  const { tab, setTab } = useNav()

  return (
    <nav className="border-t border-slate-800 bg-slate-900/95 backdrop-blur pb-safe">
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                active ? 'text-brand-300' : 'text-slate-500 hover:text-slate-300'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon width={22} height={22} />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
