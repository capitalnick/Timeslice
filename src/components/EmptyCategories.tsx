import { useState } from 'react'
import { useData } from '@/context/DataContext'
import { useNav } from '@/context/NavContext'
import { Button } from '@/components/ui/Button'
import { PlusIcon } from '@/components/ui/Icons'

export function EmptyCategories() {
  const { seedStarter } = useData()
  const { setTab } = useNav()
  const [seeding, setSeeding] = useState(false)

  const addStarter = async () => {
    setSeeding(true)
    try {
      await seedStarter()
    } finally {
      setSeeding(false)
    }
  }

  return (
    <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300">
        <PlusIcon width={26} height={26} />
      </div>
      <h2 className="text-lg font-bold text-white">Set up your categories</h2>
      <p className="mx-auto mt-2 max-w-xs text-sm text-slate-400">
        Organise your time into three levels — for example Work › Meetings › Standup. Start from a
        template or build your own.
      </p>
      <div className="mt-6 flex flex-col gap-3">
        <Button block onClick={addStarter} disabled={seeding}>
          {seeding ? 'Adding…' : 'Add starter categories'}
        </Button>
        <Button variant="subtle" block onClick={() => setTab('categories')}>
          Build my own
        </Button>
      </div>
    </section>
  )
}
