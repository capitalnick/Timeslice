import { doc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import type { RunningTimer, Settings } from '@/types'

export function timerDocRef(uid: string) {
  return doc(db, 'users', uid, 'meta', 'timer')
}

export function settingsDocRef(uid: string) {
  return doc(db, 'users', uid, 'meta', 'settings')
}

/** Persist (or clear) the running-timer state so it survives reloads/devices. */
export async function saveTimer(uid: string, timer: RunningTimer | null): Promise<void> {
  if (timer) await setDoc(timerDocRef(uid), timer)
  else await deleteDoc(timerDocRef(uid))
}

export async function saveSettings(uid: string, patch: Partial<Settings>): Promise<void> {
  await setDoc(settingsDocRef(uid), patch, { merge: true })
}
