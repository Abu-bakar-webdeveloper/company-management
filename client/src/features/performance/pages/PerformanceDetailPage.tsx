import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/model/AuthContext'
import { performanceApi } from '@/features/performance/api/performanceApi'
import type { PerformanceDetail, PerformanceOptions } from '@/features/performance/model/types'
import { EmployeeReviewsTable } from '@/features/performance/ui/EmployeeReviewsTable'
import { PlusIcon } from '@/features/performance/ui/icons'
import { PerformanceBreakdownCard } from '@/features/performance/ui/PerformanceBreakdownCard'
import { PerformanceErrorState } from '@/features/performance/ui/PerformanceErrorState'
import {
  AuditTrailCard,
  CategoryBreakdownCard,
  EmployeeOverviewCard,
  ManagerRatingCard,
  PerformanceTrendLineChart,
  QuickStatsRow,
  ValueDeliveredCard,
} from '@/features/performance/ui/PerformanceDetailSections'
import {
  getCurrentPeriodLabel,
  getCurrentPeriodStart,
  PeriodPicker,
} from '@/features/performance/ui/PeriodPicker'
import { FormCardSkeleton } from '@/shared/ui/DataSkeletons'
import { ArrowLeftIcon } from '@/shared/ui/icons'

export function PerformanceDetailPage() {
  const { user } = useAuth()
  const { id: employeeId } = useParams<{ id: string }>()
  const [detail, setDetail] = useState<PerformanceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [periodStart, setPeriodStart] = useState(getCurrentPeriodStart())
  const [periodLabel, setPeriodLabel] = useState(getCurrentPeriodLabel())
  const [periods, setPeriods] = useState<PerformanceOptions['periods']>([])

  const isEmployee = user?.role === 'employee'

  const loadData = useCallback(async () => {
    if (!employeeId || isEmployee) return
    setLoading(true)
    setError(null)
    try {
      const [data, options] = await Promise.all([
        performanceApi.getById(employeeId, periodStart),
        performanceApi.getOptions(),
      ])
      setDetail(data ?? null)
      setPeriods(options.periods)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load performance details')
    } finally {
      setLoading(false)
    }
  }, [employeeId, periodStart, isEmployee])

  useEffect(() => {
    void loadData()
  }, [loadData])

  if (isEmployee) {
    return <Navigate to="/performance" replace />
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <FormCardSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <PerformanceErrorState message={error} onRetry={() => void loadData()} />
      </div>
    )
  }

  if (!detail || !employeeId) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg font-semibold text-heading">Performance record not found</p>
        <Link to="/performance" className="mt-4 inline-block text-sm font-semibold text-primary">
          Back to Performance
        </Link>
      </div>
    )
  }

  const backTo = user?.role === 'manager' ? '/performance/team' : '/performance'
  const canReview = Boolean(detail.canReview)
  const isManagerSubject = detail.subjectRole === 'manager'
  const hasReview = Boolean(detail.managerReview)
  const hasCategoryBreakdown = Boolean(
    (detail.categoryScores ?? detail.managerReview?.categoryScores ?? []).length,
  )
  const hasValueDelivered = Boolean(detail.roi)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link
        to={backTo}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-heading"
      >
        <ArrowLeftIcon className="text-text-muted" />
        Back to Performance
      </Link>

      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold leading-9 text-heading sm:text-[30px]">
            {isManagerSubject ? 'Manager Performance Details' : 'Employee Performance Details'}
          </h1>
          <p className="mt-1 text-base text-text-muted">
            {isManagerSubject
              ? 'Project progress, delivery, and admin reviews'
              : 'View complete performance insights'}
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
          {canReview && (
            <Link
              to={`/performance/${employeeId}/reviews/new?periodStart=${periodStart}`}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95 sm:flex-none"
            >
              <PlusIcon />
              {hasReview ? 'Update Review' : 'Add Review'}
            </Link>
          )}
        </div>
      </header>

      <div className="flex flex-col gap-6">
        <EmployeeOverviewCard detail={detail} />
        {detail.breakdown && detail.breakdown.length > 0 ? (
          <PerformanceBreakdownCard items={detail.breakdown} />
        ) : null}
        <div className="flex flex-col gap-6 xl:flex-row xl:gap-10">
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <QuickStatsRow detail={detail} />
            <PerformanceTrendLineChart detail={detail} />
          </div>
          <div className="flex w-full flex-col gap-6 xl:w-[350px] xl:shrink-0">
            <ManagerRatingCard detail={detail} employeeId={employeeId} periodStart={periodStart} />
            <AuditTrailCard detail={detail} />
          </div>
        </div>
        {hasCategoryBreakdown || hasValueDelivered ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <CategoryBreakdownCard detail={detail} />
            <ValueDeliveredCard detail={detail} />
          </div>
        ) : null}
        <EmployeeReviewsTable
          reviews={detail.recentReviews}
          emptyDescription="No reviews submitted yet for this person."
        />
      </div>
    </div>
  )
}
