import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import type { EmployeeLeaveSummary, LeaveRecordStatus } from '@/features/employees/model/types'
import { useEmployeeLeaveSummary } from '@/features/leave/hooks/useLeave'
import { MyLeaveBalances } from '@/features/leave/ui/MyLeaveBalances'
import { EyeViewIcon } from '@/features/employees/ui/icons'
import { cn } from '@/shared/lib/cn'

const leaveStatusStyles: Record<LeaveRecordStatus, string> = {
  approved: 'bg-[#ecfdf5] text-[#00b67a]',
  pending: 'bg-[#fff7ed] text-[#ea580c]',
  rejected: 'bg-[#fef2f2] text-[#dc2626]',
}

type EmployeeLeavesTabProps = {
  summary?: EmployeeLeaveSummary
  employeeId?: string
}

export function EmployeeLeavesTab({ summary: summaryProp, employeeId }: EmployeeLeavesTabProps) {
  const { data: fetchedSummary, isLoading } = useEmployeeLeaveSummary(
    summaryProp ? undefined : employeeId,
  )
  const summary = summaryProp ?? fetchedSummary
  const [page, setPage] = useState(1)
  const pageSize = 4

  const total = summary?.history.length ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const rows = useMemo(
    () => summary?.history.slice((page - 1) * pageSize, page * pageSize) ?? [],
    [summary?.history, page],
  )

  if (isLoading && !summaryProp) {
    return (
      <div className="flex min-h-[300px] items-center justify-center p-6">
        <p className="text-sm text-text-muted">Loading leave history…</p>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="flex min-h-[300px] items-center justify-center p-6">
        <p className="text-sm text-text-muted">No leave data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <MyLeaveBalances summary={summary} className="mb-0" />

      <div className="overflow-hidden rounded-xl border border-border-card">
        <div className="flex items-center justify-between border-b border-border-card px-6 py-4">
          <h3 className="text-base font-bold text-heading">Leave History</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="bg-table-header text-[11px] font-semibold uppercase tracking-wide text-heading">
                <th className="px-6 py-3.5">Leave Type</th>
                <th className="px-6 py-3.5">Dates</th>
                <th className="px-6 py-3.5">Duration</th>
                <th className="px-6 py-3.5">Reason</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-border-card">
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-2 font-medium text-heading">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: row.typeColor }}
                      />
                      {row.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-muted">{row.dates}</td>
                  <td className="px-6 py-4 text-text-muted">{row.duration}</td>
                  <td className="px-6 py-4 text-text-muted">{row.reason}</td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase',
                        leaveStatusStyles[row.status],
                      )}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <Link
                        to={`/leave/requests/${row.id}`}
                        className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary hover:opacity-90"
                        aria-label="View leave"
                      >
                        <EyeViewIcon />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-border-card bg-table-header px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-muted">
            Showing {total === 0 ? 0 : (page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of{' '}
            {total} results
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-muted disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(0, 3)
              .map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={cn(
                    'min-w-9 rounded-lg px-3 py-1.5 text-sm font-medium',
                    page === n
                      ? 'bg-primary text-white hover:opacity-95'
                      : 'border border-border bg-surface text-text-muted',
                  )}
                >
                  {n}
                </button>
              ))}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-muted disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
