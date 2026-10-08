import { Link } from 'react-router-dom'
import { useState } from 'react'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import type { PerformanceReview } from '@/features/performance/model/contracts'
import { EfficiencyBar } from '@/features/performance/ui/EfficiencyBar'
import { EyeIcon, StarIcon } from '@/features/performance/ui/icons'
import { Card } from '@/shared/ui/Card'

function formatReviewDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function ReviewDetailModal({
  review,
  onClose,
}: {
  review: PerformanceReview | null
  onClose: () => void
}) {
  if (!review) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-detail-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-border-card bg-surface p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="review-detail-title" className="text-lg font-bold text-heading">
              Review Details
            </h2>
            <p className="mt-1 text-sm text-text-muted">{review.periodLabel}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm font-semibold text-text-muted hover:bg-surface-muted hover:text-heading"
          >
            Close
          </button>
        </div>

        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-text-muted">Rating</dt>
            <dd className="mt-1 flex items-center gap-1 font-semibold text-heading">
              {review.rating} <StarIcon className="size-3.5 text-[#FBBF24]" />
            </dd>
          </div>
          <div>
            <dt className="text-text-muted">Reviewer</dt>
            <dd className="mt-1 font-semibold text-heading">
              {review.reviewerName}
              <span className="ml-1 font-normal text-text-muted">({review.reviewerRole})</span>
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="mb-1 text-text-muted">Efficiency</dt>
            <dd>
              <EfficiencyBar value={review.efficiency} />
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-text-muted">Feedback</dt>
            <dd className="mt-1 rounded-xl bg-[#F8FAFC] p-3 text-heading leading-6">
              {review.feedback || 'No feedback provided.'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

export function EmployeeReviewsTable({
  reviews,
  viewAllHref,
  emptyDescription = 'No reviews submitted yet for your account.',
}: {
  reviews: PerformanceReview[]
  viewAllHref?: string
  emptyDescription?: string
}) {
  const [selected, setSelected] = useState<PerformanceReview | null>(null)

  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-border-card px-4 py-4 sm:px-6">
          <h3 className="text-lg font-bold text-heading">Recent Reviews</h3>
          {viewAllHref ? (
            <Link to={viewAllHref} className="text-sm font-semibold text-primary hover:opacity-90">
              View All
            </Link>
          ) : (
            <span className="text-xs font-medium text-text-muted">{reviews.length} total</span>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="p-4 sm:p-6">
            <ComingSoonState
              title="No reviews yet"
              description={emptyDescription}
              minHeight="min-h-[280px]"
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:hidden sm:p-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-xl border border-border-card bg-surface p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-heading">{review.periodLabel}</p>
                      <p className="mt-0.5 text-xs text-text-muted">{review.reviewerName}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelected(review)}
                      className="flex size-9 items-center justify-center rounded-lg bg-[#EFF6FF] text-primary"
                      aria-label="View review"
                    >
                      <EyeIcon />
                    </button>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-text-muted">Rating</dt>
                      <dd className="flex items-center gap-1 font-semibold text-heading">
                        {review.rating} <StarIcon className="size-3 text-[#FBBF24]" />
                      </dd>
                    </div>
                    <div>
                      <dt className="mb-1 text-text-muted">Efficiency</dt>
                      <dd>
                        <EfficiencyBar value={review.efficiency} />
                      </dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto xl:block">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border-card text-xs font-bold uppercase tracking-wide text-text-muted">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Rating</th>
                    <th className="px-6 py-4">Reviewer</th>
                    <th className="px-6 py-4">Efficiency</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={review.id} className="border-b border-border-card last:border-0">
                      <td className="px-6 py-4 font-medium text-heading">
                        {formatReviewDate(review.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-heading">
                          {review.rating} <StarIcon className="size-3.5 text-[#FBBF24]" />
                        </span>
                      </td>
                      <td className="px-6 py-4 text-heading">
                        {review.reviewerName}
                        <span className="ml-1 text-text-muted">· {review.reviewerRole}</span>
                      </td>
                      <td className="px-6 py-4">
                        <EfficiencyBar value={review.efficiency} className="max-w-[160px]" />
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => setSelected(review)}
                          className="flex size-9 items-center justify-center rounded-lg bg-[#EFF6FF] text-primary hover:opacity-90"
                          aria-label="View review details"
                        >
                          <EyeIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
      <ReviewDetailModal review={selected} onClose={() => setSelected(null)} />
    </>
  )
}
