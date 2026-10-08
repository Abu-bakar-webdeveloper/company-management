import { useEffect, useMemo, useState } from 'react'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { filterReportRecords, formatMetric } from '@/features/reports/lib/report-utils'
import { paginate } from '@/shared/lib/pagination'
import type { ReportDataFilters, ReportRecord } from '@/features/reports/model/types'
import { AvatarCircle, SearchIcon } from '@/features/reports/ui/icons'
import { RecordStatusBadge } from '@/features/reports/ui/ReportStatusBadge'
import { Card } from '@/shared/ui/Card'
import { SelectField } from '@/shared/ui/SelectField'
import { cn } from '@/shared/lib/cn'

const PAGE_SIZE = 4

const defaultFilters: ReportDataFilters = {
  search: '',
  status: 'All Status',
  category: 'All Category',
}

function CategoryChip({ category }: { category: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[#EFF6FF] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#1877F2]">
      {category}
    </span>
  )
}

function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <div className="w-full sm:w-auto">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-text-muted">{label}</p>
      <SelectField
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`Filter by ${label}`}
        className="!h-9 rounded-lg border-[#e2e8f0] px-3 !text-xs font-semibold sm:w-36"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </SelectField>
    </div>
  )
}

function metricColumnLabel(records: ReportRecord[]): string {
  const format = records.find((r) => r.metricFormat !== 'none')?.metricFormat
  switch (format) {
    case 'currency':
      return 'Amount'
    case 'days':
      return 'Days'
    case 'rating':
      return 'Rating'
    case 'percent':
      return 'Progress'
    default:
      return 'Value'
  }
}

export function ReportDataTable({ records }: { records: ReportRecord[] }) {
  const [filters, setFilters] = useState<ReportDataFilters>(defaultFilters)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [filters])

  const categoryOptions = useMemo(() => {
    const unique = Array.from(new Set(records.map((r) => r.category))).sort()
    return ['All Category', ...unique]
  }, [records])

  const statusOptions = useMemo(() => {
    const unique = Array.from(new Set(records.map((r) => r.status)))
    const labels = unique.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    return ['All Status', ...labels]
  }, [records])

  const filtered = useMemo(() => filterReportRecords(records, filters), [records, filters])
  const pagination = useMemo(() => paginate(filtered, page, PAGE_SIZE), [filtered, page])
  const valueHeader = metricColumnLabel(records)
  const isFiltered =
    filters.search.trim() !== '' ||
    filters.status !== 'All Status' ||
    filters.category !== 'All Category'
  const showFilters = records.length > 0 || isFiltered

  const pageNumbers =
    pagination.totalPages <= 3
      ? Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
      : pagination.currentPage <= 2
        ? [1, 2, 3]
        : pagination.currentPage >= pagination.totalPages - 1
          ? [pagination.totalPages - 2, pagination.totalPages - 1, pagination.totalPages]
          : [pagination.currentPage - 1, pagination.currentPage, pagination.currentPage + 1]

  return (
    <Card className="overflow-hidden">
      <div
        className={cn(
          'flex flex-col gap-4 border-b border-border-card px-4 py-4 sm:px-6',
          showFilters && 'lg:flex-row lg:items-end lg:justify-between',
        )}
      >
        <h3 className="text-base font-bold text-heading sm:text-lg">Report Data</h3>
        {showFilters ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="search"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search employees, details..."
                aria-label="Search report data"
                className="h-9 w-full rounded-full border border-[#e2e8f0] bg-surface pl-9 pr-4 text-sm text-heading outline-none placeholder:text-placeholder-alt focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-60"
              />
            </div>
            <FilterDropdown
              label="Status"
              value={filters.status}
              options={statusOptions}
              onChange={(v) => setFilters({ ...filters, status: v })}
            />
            <FilterDropdown
              label="Category"
              value={filters.category}
              options={categoryOptions}
              onChange={(v) => setFilters({ ...filters, category: v })}
            />
          </div>
        ) : null}
      </div>

      {pagination.total === 0 ? (
        <div className="p-4 sm:p-6">
          <ComingSoonState
            title={isFiltered ? 'No records found' : 'No records yet'}
            description={
              isFiltered
                ? 'Try adjusting your search or filters.'
                : 'Report records will appear here once data is available.'
            }
            minHeight="min-h-[280px]"
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:hidden sm:p-6">
            {pagination.items.map((record) => (
              <div
                key={record.id}
                className="rounded-xl border border-border-card bg-surface p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <AvatarCircle name={record.employeeName} avatar={record.employeeAvatar} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-heading">{record.employeeName}</p>
                      <p className="mt-0.5 text-xs text-text-muted">{record.date}</p>
                    </div>
                  </div>
                  <RecordStatusBadge status={record.status} />
                </div>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-text-muted">Category</dt>
                    <dd>
                      <CategoryChip category={record.category} />
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-text-muted">{valueHeader}</dt>
                    <dd className="font-semibold text-heading">
                      {formatMetric(record.metric, record.metricFormat)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="shrink-0 text-text-muted">Detail</dt>
                    <dd className="truncate text-right text-heading">{record.detail}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto xl:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-table-header text-xs font-semibold uppercase tracking-wide text-heading">
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Employee</th>
                  <th className="px-6 py-3.5">{valueHeader}</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Detail</th>
                </tr>
              </thead>
              <tbody>
                {pagination.items.map((record) => (
                  <tr key={record.id} className="border-t border-border-card">
                    <td className="px-6 py-4 text-heading">{record.date}</td>
                    <td className="px-6 py-4">
                      <CategoryChip category={record.category} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <AvatarCircle name={record.employeeName} avatar={record.employeeAvatar} />
                        <span className="text-heading">{record.employeeName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-heading">
                      {formatMetric(record.metric, record.metricFormat)}
                    </td>
                    <td className="px-6 py-4">
                      <RecordStatusBadge status={record.status} />
                    </td>
                    <td className="px-6 py-4 text-text-muted">{record.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 border-t border-border-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-center text-sm text-text-muted sm:text-left">
              Showing {pagination.start} to {pagination.end} of {pagination.total} results
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
              <button
                type="button"
                disabled={pagination.currentPage <= 1}
                onClick={() => setPage(pagination.currentPage - 1)}
                className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </button>
              {pageNumbers.map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setPage(pageNum)}
                  className={cn(
                    'min-w-9 rounded-lg px-3 py-1.5 text-sm font-medium',
                    pageNum === pagination.currentPage
                      ? 'bg-[#1877f2] text-white'
                      : 'border border-border bg-surface text-text-muted hover:bg-surface-muted',
                  )}
                >
                  {pageNum}
                </button>
              ))}
              <button
                type="button"
                disabled={pagination.currentPage >= pagination.totalPages}
                onClick={() => setPage(pagination.currentPage + 1)}
                className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </Card>
  )
}
