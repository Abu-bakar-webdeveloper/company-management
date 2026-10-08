import { cn } from '@/shared/lib/cn'

export type AttendancePaginationState = {
  page: number
  limit: number
  total: number
  totalPages: number
}

function pageNumbers(page: number, totalPages: number): number[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  if (page <= 3) return [1, 2, 3, 4, 5]
  if (page >= totalPages - 2) {
    return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }
  return [page - 2, page - 1, page, page + 1, page + 2]
}

export function AttendancePagination({
  pagination,
  onPageChange,
  className,
}: {
  pagination: AttendancePaginationState
  onPageChange: (page: number) => void
  className?: string
}) {
  const { page, limit, total, totalPages } = pagination
  if (total === 0) return null

  const rangeStart = (page - 1) * limit + 1
  const rangeEnd = Math.min(page * limit, total)
  const numbers = pageNumbers(page, totalPages)

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t border-border-card px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <p className="text-text-muted">
        Showing {rangeStart} to {rangeEnd} of {total} results
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-border-card bg-surface px-3 py-1.5 font-medium text-text-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        {numbers.map((pageNum) => (
          <button
            key={pageNum}
            type="button"
            onClick={() => onPageChange(pageNum)}
            className={cn(
              'min-w-8 rounded-lg px-2.5 py-1.5 font-medium',
              pageNum === page
                ? 'bg-[#136DEC] text-white'
                : 'border border-border-card bg-surface text-text-muted hover:bg-[#F8FAFC]',
            )}
          >
            {pageNum}
          </button>
        ))}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-border-card bg-surface px-3 py-1.5 font-medium text-text-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}
