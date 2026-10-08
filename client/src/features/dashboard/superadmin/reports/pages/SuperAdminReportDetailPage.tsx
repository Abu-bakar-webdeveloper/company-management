import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  platformReportsApi,
  type PlatformReportDetailResponse,
} from '@/features/dashboard/superadmin/reports/api/platformReportsApi'
import {
  clampYearMonth,
  currentYearMonth,
  reportsPath,
} from '@/features/dashboard/superadmin/reports/lib/report-month'
import { ReportMonthFilter } from '@/features/dashboard/superadmin/reports/ui/ReportMonthFilter'
import { SuperAdminReportCharts } from '@/features/dashboard/superadmin/reports/ui/SuperAdminReportCharts'
import { SuperAdminReportCompanyTable } from '@/features/dashboard/superadmin/reports/ui/SuperAdminReportCompanyTable'
import { SuperAdminReportMetricCard } from '@/features/dashboard/superadmin/reports/ui/SuperAdminReportMetricCard'
import type { ExportFormat } from '@/features/reports/model/types'
import { ExcelIcon, ExportIcon } from '@/features/reports/ui/icons'
import { ArrowLeftIcon } from '@/shared/ui/icons'

export function SuperAdminReportDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const maxMonth = currentYearMonth()
  const month = clampYearMonth(searchParams.get('month'), maxMonth)

  const [report, setReport] = useState<PlatformReportDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState<ExportFormat | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    setError(null)
    void platformReportsApi
      .getById(id, month)
      .then((data) => {
        if (!cancelled) setReport(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load report')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id, month])

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

  const handleExport = async (format: ExportFormat) => {
    if (!report) return
    setExporting(format)
    try {
      await platformReportsApi.download(report.id, format, month)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setExporting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <p className="text-sm text-text-muted">Loading report…</p>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-sm text-[#DC2626]">{error ?? 'Report not found'}</p>
        <Link to={reportsPath(month)} className="text-sm font-semibold text-primary">
          Back to Reports
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link
        to={reportsPath(month)}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-heading"
      >
        <ArrowLeftIcon className="text-text-muted" />
        Back to Reports
      </Link>

      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-[28px] font-bold leading-9 text-heading sm:text-[30px]">
          {report.title}
        </h1>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <ReportMonthFilter value={month} max={maxMonth} onChange={handleMonthChange} />
          <button
            type="button"
            disabled={exporting !== null}
            onClick={() => void handleExport('pdf')}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-heading hover:bg-surface-muted disabled:opacity-50"
          >
            <ExportIcon />
            {exporting === 'pdf' ? 'Exporting…' : 'Export PDF'}
          </button>
          <button
            type="button"
            disabled={exporting !== null}
            onClick={() => void handleExport('excel')}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95 disabled:opacity-50"
          >
            <ExcelIcon />
            {exporting === 'excel' ? 'Exporting…' : 'Export Excel'}
          </button>
        </div>
      </header>

      <section className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {report.metrics.map((metric) => (
          <SuperAdminReportMetricCard key={metric.id} metric={metric} />
        ))}
      </section>

      <SuperAdminReportCharts charts={report.charts} />
      <SuperAdminReportCompanyTable companies={report.companies} />
    </div>
  )
}
