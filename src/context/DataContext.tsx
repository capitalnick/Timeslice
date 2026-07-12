import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { onSnapshot } from 'firebase/firestore'
import type {
  Category,
  CategoryLevel,
  RunningTimer,
  Settings,
  TimeEntry,
} from '@/types'
import { DEFAULT_SETTINGS } from '@/types'
import { categoriesCol } from '@/services/categories'
import * as categoriesSvc from '@/services/categories'
import { entriesCol } from '@/services/entries'
import * as entriesSvc from '@/services/entries'
import { saveSettings as persistSettings, saveTimer, settingsDocRef, timerDocRef } from '@/services/meta'
import { seedStarterCategories } from '@/services/seed'
import { dateKey } from '@/lib/week'
import { roundTimerElapsed } from '@/lib/time'

interface DataState {
  uid: string
  categories: Category[]
  entries: TimeEntry[]
  settings: Settings
  timer: RunningTimer | null
  loading: boolean

  createCategory: (input: {
    name: string
    level: CategoryLevel
    parentId: string | null
    color: string
    order: number
  }) => Promise<string>
  updateCategory: (id: string, patch: Partial<Omit<Category, 'id'>>) => Promise<void>
  reorderCategories: (ordered: { id: string; order: number }[]) => Promise<void>
  setArchived: (id: string, archived: boolean) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  seedStarter: () => Promise<void>

  addEntry: (input: {
    categoryId: string
    minutes: number
    note: string
    date: string
    source: TimeEntry['source']
  }) => Promise<void>
  updateEntry: (id: string, patch: Partial<Omit<TimeEntry, 'id'>>) => Promise<void>
  deleteEntry: (id: string) => Promise<void>

  startTimer: (categoryId: string, note: string) => Promise<void>
  cancelTimer: () => Promise<void>
  /** Stop the timer, log the rounded elapsed time, and return minutes logged. */
  stopTimer: () => Promise<number>

  saveSettings: (patch: Partial<Settings>) => Promise<void>
}

const DataContext = createContext<DataState | null>(null)

export function DataProvider({ uid, children }: { uid: string; children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [timer, setTimer] = useState<RunningTimer | null>(null)
  const [catsReady, setCatsReady] = useState(false)
  const [entriesReady, setEntriesReady] = useState(false)

  useEffect(() => {
    setCatsReady(false)
    const unsub = onSnapshot(categoriesCol(uid), (snap) => {
      setCategories(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Category, 'id'>) })),
      )
      setCatsReady(true)
    })
    return unsub
  }, [uid])

  useEffect(() => {
    setEntriesReady(false)
    const unsub = onSnapshot(entriesCol(uid), (snap) => {
      setEntries(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<TimeEntry, 'id'>) })),
      )
      setEntriesReady(true)
    })
    return unsub
  }, [uid])

  useEffect(() => {
    const unsub = onSnapshot(settingsDocRef(uid), (snap) => {
      setSettings({ ...DEFAULT_SETTINGS, ...(snap.data() as Partial<Settings> | undefined) })
    })
    return unsub
  }, [uid])

  useEffect(() => {
    const unsub = onSnapshot(timerDocRef(uid), (snap) => {
      setTimer(snap.exists() ? (snap.data() as RunningTimer) : null)
    })
    return unsub
  }, [uid])

  const value = useMemo<DataState>(() => {
    const stopTimer = async (): Promise<number> => {
      if (!timer) return 0
      const elapsedMin = (Date.now() - timer.startedAt) / 60000
      const minutes = roundTimerElapsed(elapsedMin)
      if (minutes > 0) {
        await entriesSvc.addEntry(uid, {
          categoryId: timer.categoryId,
          minutes,
          note: timer.note,
          date: dateKey(new Date(timer.startedAt)),
          createdAt: Date.now(),
          source: 'timer',
        })
      }
      await saveTimer(uid, null)
      return minutes
    }

    return {
      uid,
      categories,
      entries,
      settings,
      timer,
      loading: !catsReady || !entriesReady,

      createCategory: (input) =>
        categoriesSvc.createCategory(uid, {
          ...input,
          archived: false,
          createdAt: Date.now(),
        }),
      updateCategory: (id, patch) => categoriesSvc.updateCategory(uid, id, patch),
      reorderCategories: (ordered) => categoriesSvc.reorderCategories(uid, ordered),
      setArchived: (id, archived) =>
        categoriesSvc.setArchivedCascade(uid, categories, id, archived),
      deleteCategory: (id) =>
        categoriesSvc.deleteCategoryCascade(uid, categories, entries, id),
      seedStarter: () => seedStarterCategories(uid),

      addEntry: async (input) => {
        await entriesSvc.addEntry(uid, { ...input, createdAt: Date.now() })
      },
      updateEntry: (id, patch) => entriesSvc.updateEntry(uid, id, patch),
      deleteEntry: (id) => entriesSvc.deleteEntry(uid, id),

      startTimer: (categoryId, note) =>
        saveTimer(uid, { categoryId, note, startedAt: Date.now() }),
      cancelTimer: () => saveTimer(uid, null),
      stopTimer,

      saveSettings: (patch) => persistSettings(uid, patch),
    }
  }, [uid, categories, entries, settings, timer, catsReady, entriesReady])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData(): DataState {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within <DataProvider>')
  return ctx
}
