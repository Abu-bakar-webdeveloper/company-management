import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { performanceApi } from '@/features/performance/api/performanceApi'
import type { PerformanceDetail, PerformanceOptions, PerformanceReview } from '@/features/performance/model/types'
import { ReviewForm } from '@/features/performance/ui/ReviewForm'
import { ArrowLeftIcon } from '@/shared/ui/icons'

export function PerformanceReviewEditPage() {
  const { id: employeeId, reviewId } = useParams<{ id: string; reviewId: string }>()
  const navigate = useNavigate()
  const [review, setReview] = useState<PerformanceReview | null>(null)
  const [detail, setDetail] = useState<PerformanceDetail | null>(null)
  const [periods, setPeriods] = useState<PerformanceOptions['periods']>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!employeeId || !reviewId) return
    setLoading(true)
    void Promise.all([
      performanceApi.getReview(reviewId),
      performanceApi.getById(employeeId),
      performanceApi.getOptions(),
    ])
      .then(([reviewData, detailData, options]) => {
        setReview(reviewData ?? null)
        setDetail(detailData ?? null)
        setPeriods(options.periods)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load review')
      })
      .finally(() => setLoading(false))
  }, [employeeId, reviewId])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <p className="text-sm text-text-muted">Loading review…</p>
      </div>
    )
  }

  if (error || !review || !employeeId || !detail) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg font-semibold text-heading">{error ?? 'Review not found'}</p>
        <Link to={`/performance/${employeeId}`} className="mt-4 inline-block text-sm font-semibold text-primary">
          Back to Details
        </Link>
      </div>
    )
  }

  if (detail.canReview === false) {
    return <Navigate to={`/performance/${employeeId}`} replace />
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] overflow-x-hidden px-4 py-4 sm:px-6 sm:py-6 xl:px-8 xl:py-8">
      <Link
        to={`/performance/${employeeId}`}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-text-muted transition-colors hover:text-heading"
      >
        <ArrowLeftIcon className="text-text-muted" />
        Back to Details
      </Link>

      <header className="mb-5 sm:mb-6 lg:mb-8">
        <h1 className="text-[22px] font-bold leading-tight text-heading min-[480px]:text-[26px] sm:text-[30px] sm:leading-9">
          Update Performance Rating
        </h1>
        <p className="mt-1.5 text-xs text-text-muted min-[480px]:text-sm sm:text-base">
          Adjust the rating and feedback for {review.periodLabel}
        </p>
      </header>

      <ReviewForm
        mode="edit"
        employeeId={review.employeeId}
        employeeName={detail.employeeName}
        employeeRole={detail.role}
        employeeDepartment={detail.department}
        employeeAvatar={detail.employeeAvatar}
        subjectRole={detail.subjectRole}
        periods={periods}
        previousReviews={[
          ...(detail.managerReview ? [detail.managerReview] : []),
          ...detail.recentReviews,
        ].filter((item, index, list) => list.findIndex((r) => r.id === item.id) === index)}
        initialValues={{
          employeeId: review.employeeId,
          periodStart: review.periodStart,
          periodLabel: review.periodLabel,
          rating: review.rating,
          feedback: review.feedback,
          status: review.status,
          kpiScores: review.kpiScores ?? [],
          bonus: review.bonus ?? 0,
          penalty: review.penalty ?? 0,
          bonusPenaltyNote: review.bonusPenaltyNote ?? '',
        }}
        onCancel={() => navigate(`/performance/${employeeId}`)}
        onSubmit={async (values) => {
          if (reviewId) {
            await performanceApi.updateReview(reviewId, {
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
        }}
      />
    </div>
  )
}
