import {
  collection,
  doc,
  addDoc,
  updateDoc,
  writeBatch,
  query,
  where,
} from 'firebase/firestore'
import { db } from '@/firebase'
import type { Category, TimeEntry } from '@/types'
import { descendantIds } from '@/lib/tree'

export function categoriesCol(uid: string) {
  return collection(db, 'users', uid, 'categories')
}

export function categoriesQuery(uid: string) {
  return query(categoriesCol(uid), where('archived', 'in', [true, false]))
}

export async function createCategory(
  uid: string,
  data: Omit<Category, 'id'>,
): Promise<string> {
  const ref = await addDoc(categoriesCol(uid), data)
  return ref.id
}

export async function updateCategory(
  uid: string,
  id: string,
  patch: Partial<Omit<Category, 'id'>>,
): Promise<void> {
  await updateDoc(doc(categoriesCol(uid), id), patch)
}

/** Persist a new ordering for a set of sibling categories in one batch. */
export async function reorderCategories(
  uid: string,
  ordered: { id: string; order: number }[],
): Promise<void> {
  const batch = writeBatch(db)
  for (const { id, order } of ordered) {
    batch.update(doc(categoriesCol(uid), id), { order })
  }
  await batch.commit()
}

/** Archive (or un-archive) a category and its whole subtree. */
export async function setArchivedCascade(
  uid: string,
  all: Category[],
  id: string,
  archived: boolean,
): Promise<void> {
  const ids = descendantIds(all, id)
  const batch = writeBatch(db)
  for (const cid of ids) batch.update(doc(categoriesCol(uid), cid), { archived })
  await batch.commit()
}

/**
 * Hard-delete a category, its descendants, and every entry that references
 * any of them — so no entry is ever left orphaned. Batches are chunked to
 * stay under Firestore's 500-op limit.
 */
export async function deleteCategoryCascade(
  uid: string,
  allCategories: Category[],
  allEntries: TimeEntry[],
  id: string,
): Promise<void> {
  const ids = new Set(descendantIds(allCategories, id))
  const entriesToDelete = allEntries.filter((e) => ids.has(e.categoryId))

  const catRef = categoriesCol(uid)
  const entryRef = collection(db, 'users', uid, 'entries')

  let batch = writeBatch(db)
  let count = 0
  const flushIfFull = async () => {
    if (count >= 450) {
      await batch.commit()
      batch = writeBatch(db)
      count = 0
    }
  }
  for (const e of entriesToDelete) {
    batch.delete(doc(entryRef, e.id))
    count++
    await flushIfFull()
  }
  for (const cid of ids) {
    batch.delete(doc(catRef, cid))
    count++
    await flushIfFull()
  }
  await batch.commit()
}
