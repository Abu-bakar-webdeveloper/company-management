import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/model/AuthContext'
import { isCompanyHubEnabled, REPORT_TYPE_HUB } from '@/features/auth/model/companyHubs'
import { reportsApi } from '@/features/reports/api/reportsApi'
import { moduleLabels } from '@/features/reports/model/reportsData'
import type {
  RecentReport,
  ReportsOverviewCharts,
  ReportsOverviewFilters,
  ReportsOverviewStats,
} from '@/features/reports/model/types'
import { CalendarIcon } from '@/features/reports/ui/icons'
import { RecentReportsTable } from '@/features/reports/ui/RecentReportsTable'
import { ReportsCharts } from '@/features/reports/ui/ReportsCharts'
import { ReportsFiltersBar } from '@/features/reports/ui/ReportsFiltersBar'
import { ReportsStatsRow } from '@/features/reports/ui/ReportsStatsRow'

const defaultFilters: ReportsOverviewFilters = {
  module: 'All Modules',
  department: 'All Departments',
  dateRange: 'This Month',
}

const emptyStats: ReportsOverviewStats = {
  employees: 0,
  projects: 0,
  leaves: 0,
  teams: 0,
}

const emptyCharts: ReportsOverviewCharts = {
  employeeGrowth: [],
  employeeGrowthChange: 0,
  projectTrend: [],
  leavesBreakdown: [
    { label: 'Approved', count: 0, percent: 0, color: '#00B67A' },
    { label: 'Pending', count: 0, percent: 0, color: '#1877F2' },
    { label: 'Rejected', count: 0, percent: 0, color: '#DC2626' },
  ],
  performanceDistribution: [
    { name: 'Excellent', value: 0, color: '#00B67A' },
    { name: 'Good', value: 0, color: '#1877F2' },
    { name: 'Others', value: 0, color: '#CBD5E1' },
  ],
  performanceAvgRating: 0,
}

const monthLabel = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

export function OrgReportsOverviewPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<ReportsOverviewStats>(emptyStats)
  const [charts, setCharts] = useState<ReportsOverviewCharts>(emptyCharts)
  const [reports, setReports] = useState<RecentReport[]>([])
  const [departments, setDepartments] = useState<string[]>(['All Departments'])
  const [draftFilters, setDraftFilters] = useState<ReportsOverviewFilters>(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState<ReportsOverviewFilters>(defaultFilters)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const loadStats = useCallback(async () => {
    try {
      const [statsData, options] = await Promise.all([
        reportsApi.getOverviewStats(),
        reportsApi.getOptions(),
      ])
      setStats(statsData)
      setDepartments(options.departments)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports')
    }
  }, [])

  const loadFilteredData = useCallback(async (filters: ReportsOverviewFilters) => {
    setLoading(true)
    setError(null)
    try {
      const [chartsData, reportsData] = await Promise.all([
        reportsApi.getOverviewCharts(filters),
        reportsApi.getRecentReports(filters),
      ])
      setCharts(chartsData)
      setReports(reportsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadStats()
  }, [loadStats])

  useEffect(() => {
    void loadFilteredData(appliedFilters)
  }, [loadFilteredData, appliedFilters])

  const handleDownload = async (report: RecentReport) => {
    if (report.status !== 'ready') return
    setDownloadingId(report.id)
    try {
      await reportsApi.download(report.id, report.exportFormat ?? 'pdf')
    } finally {
      setDownloadingId(null)
    }
  }

  const isFiltered =
    appliedFilters.module !== defaultFilters.module ||
    appliedFilters.department !== defaultFilters.department ||
    appliedFilters.dateRange !== defaultFilters.dateRange

  const visibleReports = useMemo(
    () =>
      reports.filter((report) => {
        const hubEnabled = isCompanyHubEnabled(user?.enabledHubs, REPORT_TYPE_HUB[report.module])
        const moduleMatch =
          appliedFilters.module === 'All Modules' ||
          moduleLabels[report.module] === appliedFilters.module
        return hubEnabled && moduleMatch
      }),
    [reports, user?.enabledHubs, appliedFilters.module],
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold leading-8 text-heading sm:text-[30px] sm:leading-9">
            Reports
          </h1>
          <p className="mt-1 text-sm leading-6 text-text-muted sm:text-base">
            Overview of system analytics &amp; reports
          </p>
        </div>
        <div className="grid w-full grid-cols-1 gap-3 sm:flex sm:w-auto sm:shrink-0 sm:flex-wrap sm:items-center">
          <button
            type="button"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#e2e8f0] bg-surface px-4 text-sm font-semibold text-heading hover:bg-surface-muted sm:w-auto"
          >
            <CalendarIcon className="text-primary" />
            {monthLabel}
          </button>
          <Link
            to="/reports/generate"
            className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95 sm:w-auto"
          >
            Generate Report
          </Link>
        </div>
      </header>

      {error && reports.length === 0 && !loading ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 rounded-xl border border-border-card bg-surface p-6 text-center sm:p-8">
          <p className="text-sm text-[#DC2626]">{error}</p>
          <button
            type="button"
            onClick={() => {
              void loadStats()
              void loadFilteredData(appliedFilters)
            }}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {loading && reports.length === 0 ? (
            <div className="mb-6 flex min-h-[160px] items-center justify-center rounded-xl border border-border-card bg-surface">
              <p className="text-sm text-text-muted">Loading reports…</p>
            </div>
          ) : (
            <ReportsStatsRow stats={stats} />
          )}
          <ReportsFiltersBar
            filters={draftFilters}
            departmentOptions={departments}
            onChange={setDraftFilters}
            onReset={() => {
              setDraftFilters(defaultFilters)
              setAppliedFilters({ ...defaultFilters })
            }}
            onApply={() => setAppliedFilters({ ...draftFilters })}
          />
          {loading && reports.length > 0 ? (
            <p className="mb-4 text-sm text-text-muted">Updating reports…</p>
          ) : null}
          {loading && reports.length === 0 ? null : (
            <>
              <ReportsCharts charts={charts} module={appliedFilters.module} />
              <RecentReportsTable
                reports={visibleReports}
                downloadingId={downloadingId}
                onDownload={handleDownload}
                isFiltered={isFiltered}
              />
            </>
          )}
        </>
      )}
    </div>
  )
}
