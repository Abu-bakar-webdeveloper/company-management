import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { performanceApi } from '@/features/performance/api/performanceApi'
import { findReviewForPeriod } from '@/features/performance/lib/performance-utils'
import type {
  PerformanceDetail,
  PerformanceOptions,
  PerformanceReview,
} from '@/features/performance/model/types'
import { ReviewForm } from '@/features/performance/ui/ReviewForm'
import { PerformanceErrorState } from '@/features/performance/ui/PerformanceErrorState'
import { getCurrentPeriodStart } from '@/features/performance/ui/PeriodPicker'
import { FormCardSkeleton } from '@/shared/ui/DataSkeletons'
import { ArrowLeftIcon } from '@/shared/ui/icons'

export function PerformanceReviewCreatePage() {
  const { id: employeeId } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [detail, setDetail] = useState<PerformanceDetail | null>(null)
  const [reviews, setReviews] = useState<PerformanceReview[]>([])
  const [periods, setPeriods] = useState<PerformanceOptions['periods']>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const requestedPeriodStart = searchParams.get('periodStart') ?? getCurrentPeriodStart()

  useEffect(() => {
    if (!employeeId) return
    setLoading(true)
    void Promise.all([
      performanceApi.getById(employeeId, requestedPeriodStart),
      performanceApi.getOptions(),
      performanceApi.listReviews(employeeId, 24),
    ])
      .then(([detailData, options, reviewList]) => {
        setDetail(detailData ?? null)
        setPeriods(options.periods)
        setReviews(reviewList)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load employee')
      })
      .finally(() => setLoading(false))
  }, [employeeId, requestedPeriodStart])

  const selectedPeriod = useMemo(() => {
    return (
      periods.find((p) => p.periodStart === requestedPeriodStart) ??
      periods[0] ?? {
        periodStart: requestedPeriodStart,
        periodEnd: requestedPeriodStart,
        periodLabel: '',
      }
    )
  }, [periods, requestedPeriodStart])

  const existingForRequested = useMemo(
    () =>
      findReviewForPeriod(reviews, {
        periodStart: selectedPeriod.periodStart,
        periodLabel: selectedPeriod.periodLabel,
      }),
    [reviews, selectedPeriod],
  )

  if (!employeeId) return null

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <FormCardSkeleton />
      </div>
    )
  }

  if (error || !detail) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <PerformanceErrorState
          message={error ?? 'Employee not found'}
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  if (detail.canReview === false) {
    return <Navigate to={`/performance/${employeeId}`} replace />
  }

  const isManagerSubject = detail.subjectRole === 'manager'
  const isUpdate = Boolean(existingForRequested)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link
        to={`/performance/${employeeId}`}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-heading"
      >
        <ArrowLeftIcon className="text-text-muted" />
        Back to Details
      </Link>

      <header className="mb-6">
        <h1 className="text-[28px] font-bold leading-9 text-heading sm:text-[30px]">
          {isUpdate
            ? 'Update Performance Review'
            : isManagerSubject
              ? 'Add Manager Review'
              : 'Add Performance Review'}
        </h1>
        <p className="mt-1 text-base text-text-muted">
          {isUpdate
            ? `Update the ${selectedPeriod.periodLabel} review for this employee.`
            : isManagerSubject
              ? 'Rate this manager based on project progress and delivery.'
              : 'Submit a formal performance review for this calendar month.'}
        </p>
      </header>

      {submitError && (
        <div className="mb-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#DC2626]">
          {submitError}
        </div>
      )}

      <ReviewForm
        employeeId={employeeId}
        employeeName={detail.employeeName}
        employeeRole={detail.role}
        employeeDepartment={detail.department}
        employeeAvatar={detail.employeeAvatar}
        subjectRole={detail.subjectRole}
        periods={periods}
        previousReviews={reviews}
        initialValues={
          existingForRequested
            ? {
                employeeId,
                periodStart: selectedPeriod.periodStart,
                periodLabel: selectedPeriod.periodLabel,
                rating: existingForRequested.rating,
                feedback: existingForRequested.feedback,
                status: existingForRequested.status,
                kpiScores: existingForRequested.kpiScores ?? [],
                bonus: existingForRequested.bonus ?? 0,
                penalty: existingForRequested.penalty ?? 0,
                bonusPenaltyNote: existingForRequested.bonusPenaltyNote ?? '',
              }
            : {
                employeeId,
                periodStart: selectedPeriod.periodStart,
                periodLabel: selectedPeriod.periodLabel,
                rating: 4,
                feedback: '',
                kpiScores: [],
                bonus: 0,
                penalty: 0,
                bonusPenaltyNote: '',
              }
        }
        mode="create"
        allowPeriodChange
        onCancel={() => navigate(`/performance/${employeeId}`)}
        onSubmit={async (values) => {
          setSubmitError(null)
          try {
            const existing = findReviewForPeriod(reviews, {
              periodStart: values.periodStart,
              periodLabel: values.periodLabel,
            })
            if (existing) {
              await performanceApi.updateReview(existing.id, {
                rating: values.rating,
                feedback: values.feedback,
                status: 'submitted',
                kpiScores: values.kpiScores,
                bonus: values.bonus,
                penalty: values.penalty,
                bonusPenaltyNote: values.bonusPenaltyNote,
              })
            } else {
              await performanceApi.createReview(employeeId, {
                periodStart: values.periodStart,
                rating: values.rating,
                feedback: values.feedback,
                status: 'submitted',
                kpiScores: values.kpiScores,
                bonus: values.bonus,
                penalty: values.penalty,
                bonusPenaltyNote: values.bonusPenaltyNote,
              })
            }
            navigate(`/performance/${employeeId}`)
          } catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'Failed to save review')
          }
        }}
      />
    </div>
  )
}
