import { collection, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import type { TimeEntry } from '@/types'

export function entriesCol(uid: string) {
  return collection(db, 'users', uid, 'entries')
}

export async function addEntry(
  uid: string,
  data: Omit<TimeEntry, 'id'>,
): Promise<string> {
  const ref = await addDoc(entriesCol(uid), data)
  return ref.id
}

export async function updateEntry(
  uid: string,
  id: string,
  patch: Partial<Omit<TimeEntry, 'id'>>,
): Promise<void> {
  await updateDoc(doc(entriesCol(uid), id), patch)
}

export async function deleteEntry(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(entriesCol(uid), id))
}
