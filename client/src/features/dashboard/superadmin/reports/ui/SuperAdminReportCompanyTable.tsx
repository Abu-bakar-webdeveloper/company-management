import { useMemo, useState } from 'react'
import { SearchIcon } from '@/app/shell/icons'
import type { PlatformReportCompany } from '@/features/dashboard/superadmin/reports/model/types'
import { planDotColors, planLabels } from '@/features/platform/model/companiesData'
import { Card } from '@/shared/ui/Card'
import { ChevronSelect } from '@/shared/ui/ChevronSelect'
import { cn } from '@/shared/lib/cn'

const statusStyles = {
  active: 'bg-[#ECFDF5] text-[#00B67A]',
  inactive: 'bg-[#F1F5F9] text-[#64748B]',
  expired: 'bg-[#FEF2F2] text-[#DC2626]',
}

const statusLabels = {
  active: 'ACTIVE',
  inactive: 'INACTIVE',
  expired: 'Expired',
}

function PlanCell({ plan }: { plan: PlatformReportCompany['plan'] }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn('size-2 shrink-0 rounded-full', planDotColors[plan])} />
      <span className="truncate">{planLabels[plan]}</span>
    </span>
  )
}

function StatusBadge({ status }: { status: PlatformReportCompany['status'] }) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide',
        statusStyles[status],
      )}
    >
      {statusLabels[status]}
    </span>
  )
}

function TableToolbar({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: {
  search: string
  status: string
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
}) {
  return (
    <div className="border-b border-border-card px-4 py-4 sm:px-6">
      {/* Mobile + tablet + lg */}
      <div className="xl:hidden">
        <h3 className="text-base font-bold text-heading sm:text-lg">Company Subscription Data</h3>

        <div className="mt-4 flex flex-col gap-3">
          <div className="relative min-w-0 w-full">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search company, admin, plan..."
              aria-label="Search companies"
              className="h-10 w-full rounded-lg border-0 bg-[#F1F5F9] pl-10 pr-4 text-sm text-heading placeholder:text-placeholder-alt outline-none focus:ring-2 focus:ring-[#1877F2]/20"
            />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="min-w-0">
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-text-muted">
                Status
              </label>
              <ChevronSelect
                value={status}
                onChange={(e) => onStatusChange(e.target.value)}
                className="!h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm"
                aria-label="Filter by status"
              >
                <option value="All Status">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </ChevronSelect>
            </div>
            <div className="min-w-0">
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-text-muted">
                Category
              </label>
              <ChevronSelect
                className="!h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm"
                aria-label="Filter by category"
              >
                <option>All Category</option>
              </ChevronSelect>
            </div>
          </div>
        </div>
      </div>

      {/* XL: heading + filters one line, vertically centered */}
      <div className="hidden items-center gap-4 xl:flex">
        <h3 className="shrink-0 text-lg font-bold leading-10 text-heading">
          Company Subscription Data
        </h3>
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search company, admin, plan..."
            aria-label="Search companies"
            className="h-10 w-full rounded-lg border-0 bg-[#F1F5F9] pl-10 pr-4 text-sm text-heading placeholder:text-placeholder-alt outline-none focus:ring-2 focus:ring-[#1877F2]/20"
          />
        </div>
        <div className="w-[150px] shrink-0">
          <ChevronSelect
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="!h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm"
            aria-label="Filter by status"
          >
            <option value="All Status">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </ChevronSelect>
        </div>
        <div className="w-[150px] shrink-0">
          <ChevronSelect
            className="!h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm"
            aria-label="Filter by category"
          >
            <option>All Category</option>
          </ChevronSelect>
        </div>
      </div>
    </div>
  )
}

function PaginationFooter() {
  return (
    <div className="flex flex-col gap-3 bg-table-header px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
      <p className="text-center text-xs text-text-muted sm:text-left sm:text-sm">
        Showing 1 to 4 of 24 results
      </p>
      <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-0.5 sm:gap-2 sm:pb-0">
        <button
          type="button"
          disabled
          className="shrink-0 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-text-muted disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:text-sm"
        >
          <span className="sm:hidden">Prev</span>
          <span className="hidden sm:inline">Previous</span>
        </button>
        {[1, 2, 3].map((page) => (
          <button
            key={page}
            type="button"
            className={cn(
              'min-w-8 shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium sm:min-w-9 sm:px-3 sm:text-sm',
              page === 1
                ? 'bg-primary text-white'
                : 'border border-border bg-surface text-text-muted',
            )}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          className="shrink-0 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-text-muted sm:px-3 sm:text-sm"
        >
          <span className="sm:hidden">Next</span>
          <span className="hidden sm:inline">Next</span>
        </button>
      </div>
    </div>
  )
}

export function SuperAdminReportCompanyTable({ companies }: { companies: PlatformReportCompany[] }) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All Status')

  const visibleCompanies = useMemo(() => {
    const query = search.trim().toLowerCase()
    return companies.filter((row) => {
      const matchesSearch =
        !query ||
        row.company.toLowerCase().includes(query) ||
        row.details.toLowerCase().includes(query) ||
        row.plan.toLowerCase().includes(query)
      const matchesStatus = status === 'All Status' || row.status === status
      return matchesSearch && matchesStatus
    })
  }, [companies, search, status])

  const toolbar = (
    <TableToolbar
      search={search}
      status={status}
      onSearchChange={setSearch}
      onStatusChange={setStatus}
    />
  )

  return (
    <>
      <Card className="hidden overflow-hidden lg:block">
        {toolbar}

        <div className="overflow-hidden">
          <table className="w-full table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[20%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[14%]" />
              <col className="w-[18%]" />
            </colgroup>
            <thead>
              <tr className="bg-table-header text-xs font-semibold uppercase tracking-wide text-heading">
                <th className="px-3 py-3.5 xl:px-6">Company</th>
                <th className="px-3 py-3.5 xl:px-6">Plan</th>
                <th className="px-3 py-3.5 xl:px-6">Admin Users</th>
                <th className="px-3 py-3.5 xl:px-6">Admin Limit</th>
                <th className="px-3 py-3.5 xl:px-6">Revenue</th>
                <th className="px-3 py-3.5 xl:px-6">Status</th>
                <th className="px-3 py-3.5 xl:px-6">Details</th>
              </tr>
            </thead>
            <tbody>
              {visibleCompanies.map((row) => (
                <tr key={row.id} className="border-t border-border-card">
                  <td className="truncate px-3 py-4 font-medium text-heading xl:px-6">{row.company}</td>
                  <td className="px-3 py-4 xl:px-6">
                    <PlanCell plan={row.plan} />
                  </td>
                  <td className="px-3 py-4 text-text-muted xl:px-6">{row.adminUsers}</td>
                  <td className="px-3 py-4 text-text-muted xl:px-6">{row.adminLimit}</td>
                  <td className="truncate px-3 py-4 text-heading xl:px-6">{row.revenue}</td>
                  <td className="px-3 py-4 xl:px-6">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="truncate px-3 py-4 text-text-muted xl:px-6">{row.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-border-card">
          <PaginationFooter />
        </div>
      </Card>

      <div className="space-y-3 lg:hidden">
        <Card className="overflow-hidden">
          {toolbar}
        </Card>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {visibleCompanies.map((row) => (
            <Card key={row.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-heading">{row.company}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <PlanCell plan={row.plan} />
                    <StatusBadge status={row.status} />
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border-card pt-3 text-xs sm:grid-cols-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
                    Admin Users
                  </p>
                  <p className="mt-1 text-sm font-medium text-heading">{row.adminUsers}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
                    Admin Limit
                  </p>
                  <p className="mt-1 text-sm font-medium text-heading">{row.adminLimit}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
                    Revenue
                  </p>
                  <p className="mt-1 text-sm font-medium text-heading">{row.revenue}</p>
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
                    Details
                  </p>
                  <p className="mt-1 text-sm font-medium text-heading">{row.details}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="overflow-hidden">
          <PaginationFooter />
        </Card>
      </div>
    </>
  )
}
