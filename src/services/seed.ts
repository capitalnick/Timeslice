import { doc, writeBatch } from 'firebase/firestore'
import { db } from '@/firebase'
import { categoriesCol } from '@/services/categories'
import { CATEGORY_COLORS } from '@/lib/colors'
import type { CategoryLevel } from '@/types'

interface SeedNode {
  name: string
  children?: SeedNode[]
}

/** A gentle starter tree the user can add from the empty state, then edit. */
const STARTER: SeedNode[] = [
  {
    name: 'Work',
    children: [
      { name: 'Deep Work', children: [{ name: 'Coding' }, { name: 'Writing' }] },
      { name: 'Meetings', children: [{ name: 'Standup' }, { name: '1:1s' }] },
      { name: 'Admin', children: [{ name: 'Email' }, { name: 'Planning' }] },
    ],
  },
  {
    name: 'Personal',
    children: [
      { name: 'Health', children: [{ name: 'Exercise' }, { name: 'Cooking' }] },
      { name: 'Learning', children: [{ name: 'Reading' }, { name: 'Courses' }] },
    ],
  },
  {
    name: 'Rest',
    children: [{ name: 'Leisure', children: [{ name: 'TV' }, { name: 'Games' }] }],
  },
]

/** Write the starter tree in a single batch, colouring each level-1 root. */
export async function seedStarterCategories(uid: string): Promise<void> {
  const col = categoriesCol(uid)
  const batch = writeBatch(db)
  const now = Date.now()

  const write = (
    node: SeedNode,
    level: CategoryLevel,
    parentId: string | null,
    color: string,
    order: number,
  ) => {
    const ref = doc(col)
    batch.set(ref, {
      name: node.name,
      level,
      parentId,
      color,
      order,
      archived: false,
      createdAt: now,
    })
    node.children?.forEach((child, i) => {
      write(child, (level + 1) as CategoryLevel, ref.id, color, i)
    })
  }

  STARTER.forEach((root, i) => {
    write(root, 1, null, CATEGORY_COLORS[i % CATEGORY_COLORS.length], i)
  })

  await batch.commit()
}
