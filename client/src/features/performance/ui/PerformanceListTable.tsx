import { Link } from 'react-router-dom'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import type { PerformanceRecord } from '@/features/performance/model/types'
import { EfficiencyBar } from '@/features/performance/ui/EfficiencyBar'
import { AvatarCircle, EyeIcon, StarIcon } from '@/features/performance/ui/icons'
import { PerformanceStatusBadge } from '@/features/performance/ui/PerformanceStatusBadge'
import { Card } from '@/shared/ui/Card'
import { cn } from '@/shared/lib/cn'

type PerformanceListTableProps = {
  records: PerformanceRecord[]
  page: number
  total: number
  rangeStart: number
  rangeEnd: number
  totalPages: number
  onPageChange: (page: number) => void
  isFiltered?: boolean
}

function KpiScore({ record }: { record: PerformanceRecord }) {
  if (record.finalAdjustedScore != null) return <>{record.finalAdjustedScore}</>
  if (record.rating != null) {
    return (
      <>
        {record.rating}
        <StarIcon className="size-3.5 text-[#FBBF24]" />
      </>
    )
  }
  return <>—</>
}

export function PerformanceListTable({
  records,
  page,
  total,
  rangeStart,
  rangeEnd,
  totalPages,
  onPageChange,
  isFiltered = false,
}: PerformanceListTableProps) {
  if (total === 0) {
    return (
      <Card className="overflow-hidden">
        <div className="border-b border-border-card px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-heading">Employee Performance List</h3>
            <Link to="/performance" className="text-sm font-semibold text-primary hover:opacity-90">
              View Dashboard
            </Link>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <ComingSoonState
            title={isFiltered ? 'No performance records found' : 'No performance records yet'}
            description={
              isFiltered
                ? 'Try adjusting your search or filters.'
                : 'Performance reviews will appear here once submitted.'
            }
            minHeight="min-h-[280px]"
          />
        </div>
      </Card>
    )
  }

  const pageNumbers =
    totalPages <= 3
      ? Array.from({ length: totalPages }, (_, i) => i + 1)
      : page <= 2
        ? [1, 2, 3]
        : page >= totalPages - 1
          ? [totalPages - 2, totalPages - 1, totalPages]
          : [page - 1, page, page + 1]

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-border-card px-4 py-4 sm:px-6">
        <h3 className="text-lg font-bold text-heading">Employee Performance List</h3>
        <Link to="/performance" className="text-sm font-semibold text-primary hover:opacity-90">
          View Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:hidden sm:p-6">
        {records.map((record) => (
          <div
            key={record.employeeId}
            className="rounded-xl border border-border-card bg-surface p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <AvatarCircle name={record.employeeName} avatar={record.employeeAvatar} />
                <div className="min-w-0">
                  <p className="font-semibold text-heading">{record.employeeName}</p>
                  <p className="truncate text-xs text-text-muted">{record.employeeEmail}</p>
                </div>
              </div>
              {record.status ? (
                <PerformanceStatusBadge status={record.status} />
              ) : (
                <span className="text-xs text-text-muted">Not reviewed</span>
              )}
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="shrink-0 text-text-muted">Role</dt>
                <dd className="truncate text-right text-heading">{record.role}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="shrink-0 text-text-muted">KPI Score</dt>
                <dd className="inline-flex items-center gap-1 font-semibold text-heading">
                  <KpiScore record={record} />
                </dd>
              </div>
              <div>
                <dt className="mb-1 text-text-muted">Efficiency</dt>
                <dd>
                  <EfficiencyBar value={record.efficiency} />
                </dd>
              </div>
            </dl>
            <div className="mt-3 flex justify-end">
              <Link
                to={`/performance/${record.employeeId}`}
                className="inline-flex size-9 items-center justify-center rounded-lg bg-[#EFF6FF] text-primary"
                aria-label={`View ${record.employeeName}`}
              >
                <EyeIcon />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-border-card text-xs font-bold uppercase tracking-wide text-text-muted">
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">KPI Score</th>
              <th className="px-6 py-4">Tasks</th>
              <th className="px-6 py-4">Efficiency</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.employeeId} className="border-b border-border-card last:border-0">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <AvatarCircle name={record.employeeName} avatar={record.employeeAvatar} />
                    <div>
                      <p className="font-semibold text-heading">{record.employeeName}</p>
                      <p className="text-xs text-text-muted">{record.employeeEmail}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-text-muted">{record.role}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 font-semibold text-heading">
                    <KpiScore record={record} />
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-heading">{record.tasksCompleted}</td>
                <td className="px-6 py-4">
                  <EfficiencyBar value={record.efficiency} className="max-w-[120px]" />
                </td>
                <td className="px-6 py-4">
                  {record.status ? (
                    <PerformanceStatusBadge status={record.status} />
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <Link
                    to={`/performance/${record.employeeId}`}
                    className="inline-flex size-9 items-center justify-center rounded-lg bg-[#EFF6FF] text-primary hover:opacity-90"
                    aria-label={`View ${record.employeeName}`}
                  >
                    <EyeIcon />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-border-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-text-muted">
          Showing {rangeStart} to {rangeEnd} of {total} results
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="h-9 rounded-lg border border-border px-3 text-sm font-medium text-heading disabled:opacity-40"
          >
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </button>
          {pageNumbers.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onPageChange(n)}
              className={cn(
                'flex size-9 items-center justify-center rounded-lg text-sm font-semibold',
                n === page ? 'bg-primary text-white' : 'border border-border text-heading hover:bg-surface-muted',
              )}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="h-9 rounded-lg border border-border px-3 text-sm font-medium text-heading disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </Card>
  )
}
