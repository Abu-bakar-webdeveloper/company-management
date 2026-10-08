export type PaginationResult<T> = {
  items: T[]
  currentPage: number
  totalPages: number
  total: number
  start: number
  end: number
}

export function paginate<T>(items: T[], page: number, pageSize: number): PaginationResult<T> {
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const start = (currentPage - 1) * pageSize
  const end = Math.min(start + pageSize, total)

  return {
    items: items.slice(start, end),
    currentPage,
    totalPages,
    total,
    start: total === 0 ? 0 : start + 1,
    end,
  }
}
