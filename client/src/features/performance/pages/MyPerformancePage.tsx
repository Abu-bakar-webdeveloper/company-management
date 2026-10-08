import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { performanceApi } from '@/features/performance/api/performanceApi'
import { exportMyPerformanceReport } from '@/features/performance/lib/export-report'
import type { MyPerformance, PerformanceOptions } from '@/features/performance/model/types'
import { EmployeePerformanceStatsRow } from '@/features/performance/ui/EmployeePerformanceStatsRow'
import { EmployeeReviewsTable } from '@/features/performance/ui/EmployeeReviewsTable'
import { ExportIcon } from '@/features/performance/ui/icons'
import { PerformanceBreakdownCard } from '@/features/performance/ui/PerformanceBreakdownCard'
import { PerformanceErrorState } from '@/features/performance/ui/PerformanceErrorState'
import { MyPerformancePageSkeleton } from '@/features/performance/ui/PerformanceSkeletons'
import { PerformanceTrendChart } from '@/features/performance/ui/PerformanceTrendChart'
import {
  getCurrentPeriodLabel,
  getCurrentPeriodStart,
  PeriodPicker,
} from '@/features/performance/ui/PeriodPicker'

export function MyPerformancePage() {
  const [data, setData] = useState<MyPerformance | null>(null)
  const [periodStart, setPeriodStart] = useState(getCurrentPeriodStart())
  const [periodLabel, setPeriodLabel] = useState(getCurrentPeriodLabel())
  const [periods, setPeriods] = useState<PerformanceOptions['periods']>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [performance, options] = await Promise.all([
        performanceApi.getMe(periodStart),
        performanceApi.getOptions(),
      ])
      setData(performance)
      setPeriods(options.periods)
      if (performance.periodLabel) setPeriodLabel(performance.periodLabel)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load your performance')
    } finally {
      setLoading(false)
    }
  }, [periodStart])

  useEffect(() => {
    void loadData()
  }, [loadData])

  if (loading) return <MyPerformancePageSkeleton />

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold leading-9 text-heading sm:text-[30px]">Performance</h1>
          <p className="mt-1 text-base leading-6 text-text-muted">
            {data?.subjectRole === 'manager'
              ? 'Your manager performance overview'
              : 'Your Performance Review'}
          </p>
        </div>
        <div className="flex w-full shrink-0 flex-wrap items-center gap-3 sm:w-auto">
          <PeriodPicker
            periodStart={periodStart}
            periodLabel={periodLabel}
            periods={periods}
            onChange={(start, label) => {
              setPeriodStart(start)
              setPeriodLabel(label)
            }}
          />
          <button
            type="button"
            disabled={!data}
            onClick={() => data && exportMyPerformanceReport(data)}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
          >
            <ExportIcon />
            Export Report
          </button>
        </div>
      </header>

      {error ? (
        <PerformanceErrorState message={error} onRetry={() => void loadData()} />
      ) : data ? (
        <>
          <EmployeePerformanceStatsRow data={data} />
          <div className="mb-4">
            <Link to="/performance/goals" className="text-sm font-semibold text-primary hover:opacity-90">
              Goals / OKRs →
            </Link>
          </div>
          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <PerformanceTrendChart data={data.monthlyTrendData} />
            <PerformanceBreakdownCard items={data.breakdown} />
          </div>
          {(data.categoryScores?.length ?? 0) > 0 && (
            <div className="mb-6 rounded-xl border border-border-card bg-surface p-4 sm:p-5">
              <h3 className="mb-3 text-sm font-bold text-heading">KPI Scorecard</h3>
              <ul className="space-y-2">
                {data.categoryScores!.map((cat) => (
                  <li key={cat.name} className="flex justify-between text-sm">
                    <span className="text-text-muted">{cat.name}</span>
                    <span className="font-semibold text-heading">
                      {cat.obtained}/{cat.maxMarks}
                    </span>
                  </li>
                ))}
              </ul>
              {(data.bonus || data.penalty) ? (
                <p className="mt-3 text-xs text-text-muted">
                  Bonus +{data.bonus ?? 0} / Penalty −{data.penalty ?? 0}
                  {data.bonusPenaltyNote ? ` — ${data.bonusPenaltyNote}` : ''}
                </p>
              ) : null}
            </div>
          )}
          <EmployeeReviewsTable reviews={data.recentReviews} />
        </>
      ) : null}
    </div>
  )
}
