import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/model/AuthContext'
import { performanceApi } from '@/features/performance/api/performanceApi'
import type {
  PerformanceListFilters,
  PerformanceOptions,
  PerformanceRecord,
  PerformanceStats,
} from '@/features/performance/model/types'
import { AdminCompanyHubSections } from '@/features/performance/ui/AdminCompanyHubSections'
import { AdminCompanyHubStats } from '@/features/performance/ui/AdminCompanyHubStats'
import { DepartmentPerformanceCard } from '@/features/performance/ui/DepartmentPerformanceCard'
import { PerformanceErrorState } from '@/features/performance/ui/PerformanceErrorState'
import { PerformanceHubSkeleton } from '@/features/performance/ui/PerformanceSkeletons'
import { PerformanceListTable } from '@/features/performance/ui/PerformanceListTable'
import { PerformanceListToolbar } from '@/features/performance/ui/PerformanceListToolbar'
import { PerformanceStatsRow } from '@/features/performance/ui/PerformanceStatsRow'
import { PerformanceTrendChart } from '@/features/performance/ui/PerformanceTrendChart'
import {
  getCurrentPeriodLabel,
  getCurrentPeriodStart,
  PeriodPicker,
} from '@/features/performance/ui/PeriodPicker'
import { TopPerformersTable } from '@/features/performance/ui/TopPerformersTable'

const PAGE_SIZE = 10

const emptyStats: PerformanceStats = {
  avgRating: 0,
  avgRatingChange: 0,
  topPerformer: '—',
  reviewsDue: 0,
  lowPerformance: 0,
  monthlyTrendData: [],
  departmentPerformance: [],
}

const defaultFilters: PerformanceListFilters = {
  search: '',
  rating: 'all',
  status: 'all',
}

type PerformanceDashboardPageProps = {
  /** Manager team hub at `/performance/team` (vs admin company hub). */
  teamMode?: boolean
}

function isDefaultListFilters(filters: PerformanceListFilters): boolean {
  return (
    (filters.search ?? '').trim() === '' &&
    (filters.rating ?? 'all') === 'all' &&
    (filters.status ?? 'all') === 'all'
  )
}

function seedListFromHub(items: PerformanceRecord[], hubTotal: number) {
  const totalPages = hubTotal === 0 ? 0 : Math.ceil(hubTotal / PAGE_SIZE)
  return {
    listRecords: items.slice(0, PAGE_SIZE),
    total: hubTotal,
    totalPages,
  }
}

export function PerformanceDashboardPage({ teamMode = false }: PerformanceDashboardPageProps) {
  const { user } = useAuth()
  const [stats, setStats] = useState<PerformanceStats>(emptyStats)
  const [hubRecords, setHubRecords] = useState<PerformanceRecord[]>([])
  const [hubTotal, setHubTotal] = useState(0)
  const [listRecords, setListRecords] = useState<PerformanceRecord[]>([])
  const [filters, setFilters] = useState<PerformanceListFilters>(defaultFilters)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [periodStart, setPeriodStart] = useState(getCurrentPeriodStart())
  const [periodLabel, setPeriodLabel] = useState(getCurrentPeriodLabel())
  const [periods, setPeriods] = useState<PerformanceOptions['periods']>([])
  const [loading, setLoading] = useState(true)
  const [listLoading, setListLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isAdminHub = user?.role === 'admin' || user?.role === 'hr'
  const isFiltered = !isDefaultListFilters(filters)
  const canSeedFromHub = !isFiltered && page === 1

  const loadHubData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [statsData, listData, options] = await Promise.all([
        performanceApi.getStats(periodStart),
        performanceApi.list({ periodStart, limit: 100 }),
        performanceApi.getOptions(),
      ])
      setStats(statsData)
      setHubRecords(listData.items)
      setHubTotal(listData.pagination.total)
      setPeriods(options.periods)
      const seeded = seedListFromHub(listData.items, listData.pagination.total)
      setListRecords(seeded.listRecords)
      setTotal(seeded.total)
      setTotalPages(seeded.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load performance data')
    } finally {
      setLoading(false)
    }
  }, [periodStart])

  const loadListData = useCallback(async () => {
    setListLoading(true)
    try {
      const data = await performanceApi.list({
        ...filters,
        page,
        limit: PAGE_SIZE,
        periodStart,
      })
      setListRecords(data.items)
      setTotal(data.pagination.total)
      setTotalPages(data.pagination.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load performance list')
    } finally {
      setListLoading(false)
    }
  }, [filters, page, periodStart])

  useEffect(() => {
    void loadHubData()
  }, [loadHubData])

  useEffect(() => {
    setPage(1)
  }, [filters, periodStart])

  useEffect(() => {
    if (canSeedFromHub) {
      if (!loading) {
        const seeded = seedListFromHub(hubRecords, hubTotal)
        setListRecords(seeded.listRecords)
        setTotal(seeded.total)
        setTotalPages(seeded.totalPages)
      }
      return
    }
    void loadListData()
  }, [canSeedFromHub, loading, hubRecords, hubTotal, loadListData])

  const scoredSort = (a: PerformanceRecord, b: PerformanceRecord) =>
    (b.finalAdjustedScore ?? (b.rating ?? 0) * 20) -
    (a.finalAdjustedScore ?? (a.rating ?? 0) * 20)

  const topPerformers = useMemo(
    () =>
      [...hubRecords]
        .filter((r) => r.rating != null || r.finalAdjustedScore != null)
        .sort(scoredSort)
        .slice(0, 5),
    [hubRecords],
  )

  const atRisk = useMemo(
    () =>
      [...hubRecords]
        .filter(
          (r) =>
            r.status === 'needs_improvement' ||
            r.status === 'poor' ||
            r.status === 'critical' ||
            r.status === 'average',
        )
        .sort((a, b) => scoredSort(b, a))
        .slice(0, 5),
    [hubRecords],
  )

  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(page * PAGE_SIZE, total)
  const showToolbar = !listLoading && (isFiltered || total > 0)

  const listSection = (
    <section id="performance-list" className="mt-6 scroll-mt-6">
      {showToolbar ? (
        <PerformanceListToolbar
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(defaultFilters)}
        />
      ) : null}
      {listLoading && listRecords.length === 0 ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-border-card bg-surface shadow-[var(--shadow-stat)]">
          <p className="text-sm text-text-muted">Loading performance…</p>
        </div>
      ) : (
        <PerformanceListTable
          records={listRecords}
          page={page}
          total={total}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          totalPages={totalPages}
          onPageChange={setPage}
          isFiltered={isFiltered}
        />
      )}
    </section>
  )

  if (loading) return <PerformanceHubSkeleton />

  if (isAdminHub && !teamMode) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold leading-8 text-heading sm:text-[30px] sm:leading-9">
              Company Performance
            </h1>
            <p className="mt-1 text-sm leading-6 text-text-muted sm:text-base">
              Who needs action this period — then work the employee list.
            </p>
            <nav className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-primary">
              <a href="#performance-list" className="hover:opacity-90">
                Employee list
              </a>
            </nav>
          </div>
          <PeriodPicker
            periodStart={periodStart}
            periodLabel={periodLabel}
            periods={periods}
            onChange={(start, label) => {
              setPeriodStart(start)
              setPeriodLabel(label)
            }}
          />
        </header>

        {error ? (
          <PerformanceErrorState
            message={error}
            onRetry={() => {
              void loadHubData()
              if (!canSeedFromHub) void loadListData()
            }}
          />
        ) : (
          <>
            <AdminCompanyHubStats stats={stats} records={hubRecords} />
            <AdminCompanyHubSections topPerformers={topPerformers} atRisk={atRisk} />
            {listSection}
          </>
        )}
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-8 text-heading sm:text-[30px] sm:leading-9">
            Team Performance
          </h1>
          <p className="mt-1 text-sm leading-6 text-text-muted sm:text-base">
            Track your team performance & insights
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <a href="#performance-list" className="text-sm font-semibold text-primary hover:opacity-90">
              View full list
            </a>
            <Link
              to="/performance/goals"
              className="text-sm font-semibold text-primary hover:opacity-90"
            >
              Goals / OKRs
            </Link>
          </div>
        </div>
        <PeriodPicker
          periodStart={periodStart}
          periodLabel={periodLabel}
          periods={periods}
          onChange={(start, label) => {
            setPeriodStart(start)
            setPeriodLabel(label)
          }}
        />
      </header>

      {error ? (
        <PerformanceErrorState
          message={error}
          onRetry={() => {
            void loadHubData()
            if (!canSeedFromHub) void loadListData()
          }}
        />
      ) : (
        <>
          <PerformanceStatsRow stats={stats} />
          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <PerformanceTrendChart data={stats.monthlyTrendData} />
            <DepartmentPerformanceCard data={stats.departmentPerformance} />
          </div>
          <TopPerformersTable
            performers={topPerformers}
            title="Top Team Members"
            viewAllLink="/performance#performance-list"
          />
          {listSection}
        </>
      )}
    </div>
  )
}
