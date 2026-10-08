import { Link } from 'react-router-dom'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { formatCurrency } from '@/features/salaries/lib/salary-utils'
import type { Salary, SalaryStatus } from '@/features/salaries/model/types'
import { statusLabels } from '@/features/salaries/model/salariesData'
import { EditIcon, EyeIcon } from '@/features/salaries/ui/icons'
import { SalaryStatusBadge } from '@/features/salaries/ui/SalaryStatusBadge'
import { Card } from '@/shared/ui/Card'
import { Checkbox } from '@/shared/ui/Checkbox'
import { ChevronSelect } from '@/shared/ui/ChevronSelect'
import { cn } from '@/shared/lib/cn'

type SalariesTableProps = {
  salaries: Salary[]
  page: number
  total: number
  rangeStart: number
  rangeEnd: number
  totalPages: number
  onPageChange: (page: number) => void
  selectedIds: string[]
  onToggleSelect: (id: string) => void
  onToggleSelectAll: () => void
  onStatusChange?: (id: string, status: SalaryStatus) => void
  canWrite?: boolean
  isFiltered?: boolean
}

function RowActions({
  salaryId,
  employeeName,
  canWrite,
}: {
  salaryId: string
  employeeName: string
  canWrite: boolean
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      {canWrite && (
        <Link
          to={`/salaries/${salaryId}/edit`}
          className="flex size-9 items-center justify-center rounded-lg border border-border bg-surface text-heading hover:bg-surface-muted"
          aria-label={`Edit ${employeeName}`}
          title="Edit payroll"
        >
          <EditIcon />
        </Link>
      )}
      <Link
        to={`/salaries/${salaryId}`}
        className="flex size-9 items-center justify-center rounded-lg bg-[#eff6ff] text-[#1877f2] hover:opacity-90"
        aria-label={`View ${employeeName}`}
        title="View details"
      >
        <EyeIcon />
      </Link>
    </div>
  )
}

export function SalariesTable({
  salaries,
  page,
  total,
  rangeStart,
  rangeEnd,
  totalPages,
  onPageChange,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onStatusChange,
  canWrite = false,
  isFiltered = false,
}: SalariesTableProps) {
  if (total === 0) {
    return (
      <Card className="p-4 sm:p-6">
        <ComingSoonState
          title={isFiltered ? 'No salary records found' : 'No salary records yet'}
          description={
            isFiltered
              ? 'Try adjusting your search or filters.'
              : "Generate this month's payroll to see records here."
          }
          minHeight="min-h-[280px]"
        />
      </Card>
    )
  }

  const allSelected = salaries.length > 0 && salaries.every((s) => selectedIds.includes(s.id))
  const someSelected = salaries.some((s) => selectedIds.includes(s.id))

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
      <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:hidden sm:p-6">
        {salaries.map((salary) => (
          <div
            key={salary.id}
            className="rounded-xl border border-border-card bg-surface p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                {canWrite && (
                  <Checkbox
                    checked={selectedIds.includes(salary.id)}
                    onChange={() => onToggleSelect(salary.id)}
                    aria-label={`Select ${salary.employeeName}`}
                  />
                )}
                <div>
                  <p className="font-semibold uppercase text-heading">{salary.employeeName}</p>
                  <p className="mt-0.5 text-xs text-text-muted">{salary.employeeCode}</p>
                </div>
              </div>
              <SalaryStatusBadge status={salary.status} />
            </div>

            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-text-muted">Department</dt>
                <dd className="uppercase text-heading">{salary.department}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-text-muted">Basic</dt>
                <dd className="text-heading">{formatCurrency(salary.basic)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-text-muted">Allowances</dt>
                <dd className="text-heading">{formatCurrency(salary.allowances)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-text-muted">Deductions</dt>
                <dd className="text-heading">{formatCurrency(salary.deductions)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-text-muted">Net</dt>
                <dd className="font-semibold text-heading">{formatCurrency(salary.net)}</dd>
              </div>
            </dl>

            <div className="mt-3 flex items-center justify-between gap-2">
              {canWrite && onStatusChange ? (
                <ChevronSelect
                  value={salary.status}
                  onChange={(e) => onStatusChange(salary.id, e.target.value as SalaryStatus)}
                  className="h-9 rounded-lg border border-border bg-surface px-3 text-xs"
                  aria-label={`Change status for ${salary.employeeName}`}
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </ChevronSelect>
              ) : (
                <span />
              )}
              <RowActions
                salaryId={salary.id}
                employeeName={salary.employeeName}
                canWrite={canWrite}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-table-header text-xs font-semibold uppercase tracking-wide text-heading">
              {canWrite && (
                <th className="px-4 py-3.5">
                  <Checkbox
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected && !allSelected
                    }}
                    onChange={onToggleSelectAll}
                    aria-label="Select all on page"
                  />
                </th>
              )}
              <th className="px-6 py-3.5">Employee</th>
              <th className="px-6 py-3.5">Employee ID</th>
              <th className="px-6 py-3.5">Department</th>
              <th className="px-6 py-3.5">Basic</th>
              <th className="px-6 py-3.5">Allowances</th>
              <th className="px-6 py-3.5">Deductions</th>
              <th className="px-6 py-3.5">Net</th>
              <th className="px-6 py-3.5 text-center">Status</th>
              <th className="px-6 py-3.5 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {salaries.map((salary) => (
              <tr key={salary.id} className="border-t border-border-card">
                {canWrite && (
                  <td className="px-4 py-4">
                    <Checkbox
                      checked={selectedIds.includes(salary.id)}
                      onChange={() => onToggleSelect(salary.id)}
                      aria-label={`Select ${salary.employeeName}`}
                    />
                  </td>
                )}
                <td className="px-6 py-4 font-semibold uppercase text-heading">
                  {salary.employeeName}
                </td>
                <td className="px-6 py-4 text-heading">{salary.employeeCode}</td>
                <td className="px-6 py-4 uppercase text-heading">{salary.department}</td>
                <td className="px-6 py-4 text-heading">{formatCurrency(salary.basic)}</td>
                <td className="px-6 py-4 text-heading">{formatCurrency(salary.allowances)}</td>
                <td className="px-6 py-4 text-heading">{formatCurrency(salary.deductions)}</td>
                <td className="px-6 py-4 font-semibold text-heading">
                  {formatCurrency(salary.net)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    {canWrite && onStatusChange ? (
                      <ChevronSelect
                        value={salary.status}
                        onChange={(e) =>
                          onStatusChange(salary.id, e.target.value as SalaryStatus)
                        }
                        className="h-9 min-w-[110px] rounded-lg border border-border bg-surface px-2 text-xs"
                        aria-label={`Change status for ${salary.employeeName}`}
                      >
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </ChevronSelect>
                    ) : (
                      <SalaryStatusBadge status={salary.status} />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <RowActions
                    salaryId={salary.id}
                    employeeName={salary.employeeName}
                    canWrite={canWrite}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 border-t border-border-card bg-table-header px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-text-muted">
          Showing {rangeStart} to {rangeEnd} of {total} results
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </button>
          {pageNumbers.map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={cn(
                'min-w-9 rounded-lg px-3 py-1.5 text-sm font-medium',
                pageNum === page
                  ? 'bg-[#1877f2] text-white hover:opacity-95'
                  : 'border border-border bg-surface text-text-muted hover:bg-surface-muted',
              )}
            >
              {pageNum}
            </button>
          ))}
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </Card>
  )
}
