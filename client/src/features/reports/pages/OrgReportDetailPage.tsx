import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { reportsApi } from '@/features/reports/api/reportsApi'
import type { ExportFormat, ReportDetail } from '@/features/reports/model/types'
import { ExcelIcon, ExportIcon } from '@/features/reports/ui/icons'
import { ReportDataTable } from '@/features/reports/ui/ReportDataTable'
import { ReportDetailCharts } from '@/features/reports/ui/ReportDetailCharts'
import { ReportDetailStatsRow } from '@/features/reports/ui/ReportDetailStats'
import { ReportStatusBadge } from '@/features/reports/ui/ReportStatusBadge'
import { ArrowLeftIcon } from '@/shared/ui/icons'

const POLL_MS = 1500
const MAX_POLLS = 10

export function OrgReportDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [report, setReport] = useState<ReportDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState<ExportFormat | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    let polls = 0
    let timer: ReturnType<typeof setTimeout> | undefined

    const load = async (isPoll = false) => {
      if (!isPoll) setLoading(true)
      try {
        const data = await reportsApi.getById(id)
        if (cancelled) return
        setReport(data)
        setLoading(false)

        if (data.status === 'processing' && polls < MAX_POLLS) {
          polls += 1
          timer = setTimeout(() => void load(true), POLL_MS)
        }
      } catch {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [id])

  const handleExport = async (format: ExportFormat) => {
    if (!report || report.status !== 'ready') return
    setExportError(null)
    setExporting(format)
    try {
      await reportsApi.download(report.id, format)
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setExporting(null)
    }
  }

  if (loading || !report) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <p className="text-sm text-text-muted">Loading report…</p>
      </div>
    )
  }

  const canExport = report.status === 'ready'

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link
        to="/reports"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-heading"
      >
        <ArrowLeftIcon className="text-text-muted" />
        Back to Reports
      </Link>

      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2">
            <ReportStatusBadge status={report.status} />
          </div>
          <h1 className="text-2xl font-bold leading-8 text-heading sm:text-[30px] sm:leading-9">
            {report.title}
          </h1>
          {exportError ? <p className="mt-2 text-sm text-[#DC2626]">{exportError}</p> : null}
          {report.status === 'processing' ? (
            <p className="mt-2 text-sm text-text-muted">Report is still generating…</p>
          ) : null}
        </div>
        <div className="grid w-full grid-cols-1 gap-3 sm:flex sm:w-auto sm:shrink-0 sm:flex-wrap sm:items-center">
          <button
            type="button"
            disabled={!canExport || exporting !== null}
            onClick={() => void handleExport('pdf')}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-heading hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <ExportIcon />
            {exporting === 'pdf' ? 'Exporting…' : 'Export PDF'}
          </button>
          <button
            type="button"
            disabled={!canExport || exporting !== null}
            onClick={() => void handleExport('excel')}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <ExcelIcon />
            {exporting === 'excel' ? 'Exporting…' : 'Export Excel'}
          </button>
        </div>
      </header>

      <ReportDetailStatsRow stats={report.stats} />
      <ReportDetailCharts trend={report.trend} categories={report.categories} />
      <ReportDataTable records={report.records} />
    </div>
  )
}
