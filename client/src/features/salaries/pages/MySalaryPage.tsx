import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { salariesApi } from '@/features/salaries/api/salariesApi'
import { formatCurrency } from '@/features/salaries/lib/salary-utils'
import { MONTH_OPTIONS } from '@/features/salaries/model/salariesData'
import type { Salary } from '@/features/salaries/model/types'
import { SalaryStatusBadge } from '@/features/salaries/ui/SalaryStatusBadge'
import { EyeIcon } from '@/features/salaries/ui/icons'
import { getErrorMessage } from '@/shared/api/errors'
import { Card } from '@/shared/ui/Card'
import { paginate } from '@/shared/lib/pagination'
import { SelectField } from '@/shared/ui/SelectField'

const PAGE_SIZE = 8
const YEAR_OPTIONS = (() => {
  const current = new Date().getFullYear()
  return Array.from({ length: 6 }, (_, i) => current - i)
})()

type PfState = {
  balance: number
  entries: {
    id: string
    year: number
    month: number
    employeeAmount: number
    employerAmount: number
    type: string
    note?: string
    createdAt: string
  }[]
}

export function MySalaryPage() {
  const now = new Date()
  const [salaries, setSalaries] = useState<Salary[]>([])
  const [pf, setPf] = useState<PfState | null>(null)
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState<number | 'all'>('all')
  const [year, setYear] = useState<number | 'all'>(now.getFullYear())
  const [page, setPage] = useState(1)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: { month?: number; year?: number } = {}
      if (month !== 'all') params.month = month
      if (year !== 'all') params.year = year
      const [list, pfData] = await Promise.all([
        salariesApi.listMine(params),
        salariesApi.getMyPf(),
      ])
      setSalaries(list)
      setPf({ balance: pfData.balance, entries: pfData.entries })
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to load your salary data'))
    } finally {
      setLoading(false)
    }
  }, [month, year])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    setPage(1)
  }, [month, year])

  const pagination = useMemo(() => paginate(salaries, page, PAGE_SIZE), [salaries, page])
  const isFiltered = month !== 'all' || year !== now.getFullYear()
  const showToolbar = !loading && (isFiltered || salaries.length > 0)

  const handleDownload = async (salary: Salary) => {
    setDownloadingId(salary.id)
    try {
      await salariesApi.downloadSlip(
        salary.id,
        `SalarySlip_${salary.payPeriodLabel.replace(/\s+/g, '_')}.pdf`,
      )
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to download slip'))
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold leading-8 text-heading sm:text-[30px] sm:leading-9">
          My Salary
        </h1>
        <p className="mt-1 text-sm leading-6 text-text-muted sm:text-base">
          View your payslips, net pay, and provident fund balance.
        </p>
      </header>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs text-text-muted">Records shown</p>
          <p className="mt-1 text-2xl font-bold text-heading">{salaries.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-text-muted">PF balance</p>
          <p className="mt-1 text-2xl font-bold text-heading">
            {formatCurrency(pf?.balance ?? 0)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-text-muted">Latest net (in filter)</p>
          <p className="mt-1 text-2xl font-bold text-heading">
            {salaries[0] ? formatCurrency(salaries[0].net) : '—'}
          </p>
        </Card>
      </div>

      {showToolbar ? (
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <SelectField
            value={month === 'all' ? 'all' : String(month)}
            onChange={(e) => {
              const v = e.target.value
              setMonth(v === 'all' ? 'all' : Number(v))
            }}
            className="!h-10 w-full rounded-lg text-sm sm:w-auto"
            aria-label="Filter by month"
          >
            <option value="all">All months</option>
            {MONTH_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </SelectField>
          <SelectField
            value={year === 'all' ? 'all' : String(year)}
            onChange={(e) => {
              const v = e.target.value
              setYear(v === 'all' ? 'all' : Number(v))
            }}
            className="!h-10 w-full rounded-lg text-sm sm:w-auto"
            aria-label="Filter by year"
          >
            <option value="all">All years</option>
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </SelectField>
        </div>
      ) : null}

      {loading ? (
        <Card className="flex min-h-[280px] items-center justify-center p-8">
          <p className="text-sm text-text-muted">Loading your salary records…</p>
        </Card>
      ) : salaries.length === 0 ? (
        <Card className="p-4 sm:p-6">
          <ComingSoonState
            title={isFiltered ? 'No salary records found' : 'No salary records yet'}
            description={
              isFiltered
                ? 'Try adjusting your search or filters.'
                : 'When payroll is generated for you, it will appear here.'
            }
            minHeight="min-h-[280px]"
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:hidden sm:p-6">
            {pagination.items.map((salary) => (
              <div
                key={salary.id}
                className="rounded-xl border border-border-card bg-surface p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-heading">{salary.payPeriodLabel}</p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      Net {formatCurrency(salary.net)}
                    </p>
                  </div>
                  <SalaryStatusBadge status={salary.status} />
                </div>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-text-muted">Basic</dt>
                    <dd className="text-heading">{formatCurrency(salary.basic)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-text-muted">PF</dt>
                    <dd className="text-heading">{formatCurrency(salary.providentFund)}</dd>
                  </div>
                </dl>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    disabled={downloadingId === salary.id}
                    onClick={() => void handleDownload(salary)}
                    className="h-9 rounded-lg border border-border px-3 text-xs font-semibold text-heading hover:bg-surface-muted disabled:opacity-70"
                  >
                    {downloadingId === salary.id ? '…' : 'Slip'}
                  </button>
                  <Link
                    to={`/salaries/${salary.id}`}
                    className="flex size-9 items-center justify-center rounded-lg bg-[#eff6ff] text-[#1877f2] hover:opacity-90"
                    aria-label={`View ${salary.payPeriodLabel}`}
                    title="View details"
                  >
                    <EyeIcon />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto xl:block">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border-card bg-[#f8fafc] text-text-muted">
                  <th className="px-4 py-3 font-medium">Period</th>
                  <th className="px-4 py-3 font-medium">Basic</th>
                  <th className="px-4 py-3 font-medium">PF</th>
                  <th className="px-4 py-3 font-medium">Net</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagination.items.map((salary) => (
                  <tr key={salary.id} className="border-b border-border-card/70">
                    <td className="px-4 py-3 font-medium text-heading">{salary.payPeriodLabel}</td>
                    <td className="px-4 py-3 text-heading">{formatCurrency(salary.basic)}</td>
                    <td className="px-4 py-3 text-heading">
                      {formatCurrency(salary.providentFund)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-heading">
                      {formatCurrency(salary.net)}
                    </td>
                    <td className="px-4 py-3">
                      <SalaryStatusBadge status={salary.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={downloadingId === salary.id}
                          onClick={() => void handleDownload(salary)}
                          className="h-9 rounded-lg border border-border px-3 text-xs font-semibold text-heading hover:bg-surface-muted disabled:opacity-70"
                        >
                          {downloadingId === salary.id ? '…' : 'Slip'}
                        </button>
                        <Link
                          to={`/salaries/${salary.id}`}
                          className="flex size-9 items-center justify-center rounded-lg bg-[#eff6ff] text-[#1877f2] hover:opacity-90"
                          aria-label={`View ${salary.payPeriodLabel}`}
                          title="View details"
                        >
                          <EyeIcon />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex flex-col gap-3 border-t border-border-card px-4 py-3 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <span>
                {pagination.start}–{pagination.end} of {pagination.total}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-border px-3 py-1 disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  type="button"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  className="rounded-lg border border-border px-3 py-1 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      {pf && pf.entries.length > 0 && (
        <Card className="mt-6 overflow-hidden">
          <div className="border-b border-border-card px-4 py-4 sm:px-6">
            <h2 className="text-base font-semibold text-heading">Recent PF contributions</h2>
          </div>

          <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:hidden sm:p-6">
            {pf.entries.slice(0, 12).map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl border border-border-card bg-surface p-4"
              >
                <p className="font-semibold text-heading">
                  {entry.month}/{entry.year}
                </p>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-text-muted">Employee</dt>
                    <dd className="text-heading">{formatCurrency(entry.employeeAmount)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-text-muted">Employer</dt>
                    <dd className="text-heading">{formatCurrency(entry.employerAmount)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-text-muted">Type</dt>
                    <dd className="capitalize text-heading">{entry.type}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto xl:block">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-border-card text-text-muted">
                  <th className="px-4 py-3 font-medium">Period</th>
                  <th className="px-4 py-3 font-medium">Employee</th>
                  <th className="px-4 py-3 font-medium">Employer</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                </tr>
              </thead>
              <tbody>
                {pf.entries.slice(0, 12).map((entry) => (
                  <tr key={entry.id} className="border-b border-border-card/60">
                    <td className="px-4 py-3">
                      {entry.month}/{entry.year}
                    </td>
                    <td className="px-4 py-3">{formatCurrency(entry.employeeAmount)}</td>
                    <td className="px-4 py-3">{formatCurrency(entry.employerAmount)}</td>
                    <td className="px-4 py-3 capitalize">{entry.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
