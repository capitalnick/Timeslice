import type { Category, CategoryPath } from '@/types'

export interface CategoryNode {
  category: Category
  children: CategoryNode[]
}

/** Sort by explicit order, then by creation time as a stable tiebreak. */
export function byOrder(a: Category, b: Category): number {
  if (a.order !== b.order) return a.order - b.order
  return a.createdAt - b.createdAt
}

export function childrenOf(
  categories: Category[],
  parentId: string | null,
  includeArchived = false,
): Category[] {
  return categories
    .filter((c) => c.parentId === parentId && (includeArchived || !c.archived))
    .sort(byOrder)
}

/** Build the ordered forest of level-1 roots and their descendants. */
export function buildTree(categories: Category[], includeArchived = false): CategoryNode[] {
  const make = (parentId: string | null): CategoryNode[] =>
    childrenOf(categories, parentId, includeArchived).map((category) => ({
      category,
      children: make(category.id),
    }))
  return make(null)
}

/** Resolve a category to its full ancestry (l1 → leaf). */
export function resolvePath(categories: Category[], categoryId: string): CategoryPath | null {
  const byId = new Map(categories.map((c) => [c.id, c]))
  const leaf = byId.get(categoryId)
  if (!leaf) return null

  const chain: Category[] = []
  let current: Category | undefined = leaf
  const guard = new Set<string>()
  while (current && !guard.has(current.id)) {
    guard.add(current.id)
    chain.unshift(current)
    current = current.parentId ? byId.get(current.parentId) : undefined
  }

  return {
    l1: chain[0],
    l2: chain[1],
    l3: chain[2],
    leaf,
  }
}

/** All descendant ids of a category, inclusive of the category itself. */
export function descendantIds(categories: Category[], rootId: string): string[] {
  const childrenByParent = new Map<string | null, Category[]>()
  for (const c of categories) {
    const list = childrenByParent.get(c.parentId) ?? []
    list.push(c)
    childrenByParent.set(c.parentId, list)
  }
  const out: string[] = []
  const walk = (id: string) => {
    out.push(id)
    for (const child of childrenByParent.get(id) ?? []) walk(child.id)
  }
  walk(rootId)
  return out
}

/** Human-readable "L1 › L2 › L3" breadcrumb for a resolved path. */
export function pathLabel(path: CategoryPath): string {
  return [path.l1?.name, path.l2?.name, path.l3?.name].filter(Boolean).join(' › ')
}
