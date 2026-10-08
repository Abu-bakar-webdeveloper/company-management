import { z } from 'zod'

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type PaginationQuery = z.infer<typeof paginationQuerySchema>

export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type PaginatedResult<T> = {
  items: T[]
  pagination: PaginationMeta
}

export function parsePagination(query: Record<string, unknown>): PaginationQuery & { skip: number } {
  const { page, limit } = paginationQuerySchema.parse(query)
  return { page, limit, skip: (page - 1) * limit }
}

export function buildPaginatedResult<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  }
}

export function parseSort(
  sort: unknown,
  allowedFields: string[],
  defaultField = 'createdAt',
  defaultOrder: 'asc' | 'desc' = 'desc',
): Record<string, 1 | -1> {
  if (typeof sort !== 'string' || !sort.trim()) {
    return { [defaultField]: defaultOrder === 'asc' ? 1 : -1 }
  }

  const sortObj: Record<string, 1 | -1> = {}

  for (const part of sort.split(',')) {
    const trimmed = part.trim()
    if (!trimmed) continue

    const descending = trimmed.startsWith('-')
    const field = descending ? trimmed.slice(1) : trimmed

    if (!allowedFields.includes(field)) continue

    sortObj[field] = descending ? -1 : 1
  }

  if (Object.keys(sortObj).length === 0) {
    return { [defaultField]: defaultOrder === 'asc' ? 1 : -1 }
  }

  return sortObj
}

export function pickFilters<T extends Record<string, string | undefined>>(
  query: Record<string, unknown>,
  allowedKeys: (keyof T)[],
): Partial<T> {
  const filters: Partial<T> = {}

  for (const key of allowedKeys) {
    const value = query[key as string]
    if (typeof value === 'string' && value.trim() && value !== 'all') {
      filters[key] = value.trim() as T[keyof T]
    }
  }

  return filters
}

export function buildSearchFilter(
  search: unknown,
  fields: string[],
): Record<string, unknown> | undefined {
  if (typeof search !== 'string' || !search.trim()) return undefined

  const term = search.trim()
  return {
    $or: fields.map((field) => ({
      [field]: { $regex: term, $options: 'i' },
    })),
  }
}
