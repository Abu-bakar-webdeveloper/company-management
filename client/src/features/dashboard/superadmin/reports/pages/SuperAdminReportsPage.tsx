import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toSuperAdminStatCards } from '@/features/dashboard/superadmin/lib/superadminStatCards'
import {
  clampYearMonth,
  currentYearMonth,
} from '@/features/dashboard/superadmin/reports/lib/report-month'
import { platformReportsApi } from '@/features/dashboard/superadmin/reports/api/platformReportsApi'
import type { PlatformReport } from '@/features/dashboard/superadmin/reports/model/types'
import { ReportMonthFilter } from '@/features/dashboard/superadmin/reports/ui/ReportMonthFilter'
import { SuperAdminReportsTable } from '@/features/dashboard/superadmin/reports/ui/SuperAdminReportsTable'
import { DashboardStatCard } from '@/features/dashboard/ui/DashboardStatCard'
import type { PlatformStatCardData } from '@/features/platform/model/companiesData'
import type { ExportFormat } from '@/features/reports/model/types'

export function SuperAdminReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const maxMonth = currentYearMonth()
  const month = clampYearMonth(searchParams.get('month'), maxMonth)

  const [stats, setStats] = useState<PlatformStatCardData[]>([])
  const [reports, setReports] = useState<PlatformReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const loadData = useCallback(async (selectedMonth: string) => {
    setLoading(true)
    setError(null)
    try {
      const [statsData, reportsData] = await Promise.all([
        platformReportsApi.getOverviewStats(selectedMonth),
        platformReportsApi.list(selectedMonth),
      ])
      setStats(statsData)
      setReports(reportsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load platform reports')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData(month)
  }, [loadData, month])

  const statCards = useMemo(() => toSuperAdminStatCards(stats), [stats])

  const handleMonthChange = (nextMonth: string) => {
    const clamped = clampYearMonth(nextMonth, maxMonth)
    const nextParams = new URLSearchParams(searchParams)
    if (clamped === maxMonth) {
      nextParams.delete('month')
    } else {
      nextParams.set('month', clamped)
    }
    setSearchParams(nextParams, { replace: true })
  }

  const handleDownload = async (report: PlatformReport) => {
    setDownloadingId(report.id)
    try {
      await platformReportsApi.download(
        report.id,
        (report.exportFormat ?? 'pdf') as ExportFormat,
        month,
      )
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[28px] font-bold leading-9 text-heading sm:text-[30px]">Reports</h1>
          <p className="mt-1 text-base leading-6 text-text-muted">
            Overview of system analytics &amp; reports
          </p>
        </div>
        <ReportMonthFilter value={month} max={maxMonth} onChange={handleMonthChange} />
      </header>

      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-border-card bg-surface">
          <p className="text-sm text-text-muted">Loading platform reports…</p>
        </div>
      ) : error ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 rounded-xl border border-border-card bg-surface p-8 text-center">
          <p className="text-sm text-[#DC2626]">{error}</p>
          <button
            type="button"
            onClick={() => void loadData(month)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <section className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
              <DashboardStatCard key={card.id} data={card} />
            ))}
          </section>

          <SuperAdminReportsTable
            reports={reports}
            month={month}
            downloadingId={downloadingId}
            onDownload={handleDownload}
          />
        </>
      )}
    </div>
  )
}
