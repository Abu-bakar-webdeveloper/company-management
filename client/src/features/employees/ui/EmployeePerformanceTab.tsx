import type { PerformanceSummary } from '@/features/performance/model/contracts'
import { StarFilledIcon } from '@/features/employees/ui/icons'
import { cn } from '@/shared/lib/cn'

type EmployeePerformanceTabProps = {
  summary: PerformanceSummary | null
  loading?: boolean
  error?: string | null
}

export function EmployeePerformanceTab({ summary, loading, error }: EmployeePerformanceTabProps) {
  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center p-6">
        <p className="text-sm text-text-muted">Loading performance…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-sm text-[#DC2626]">{error}</p>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="p-6">
        <p className="text-sm text-text-muted">No performance data available.</p>
      </div>
    )
  }

  const rating = summary.overallRating ?? 0
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(rating))
  const statusLabel =
    summary.reviewStatus === 'approved'
      ? 'APPROVED'
      : summary.reviewStatus === 'pending'
        ? 'PENDING'
        : 'NOT REVIEWED'

  return (
    <div className="space-y-6 p-6">
      <h3 className="text-base font-bold text-primary hover:opacity-90">Performance</h3>

      <div className="rounded-xl bg-[#f0f7ff] px-6 py-5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-text-muted">
          Overall Rating
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <div className="flex gap-1">
            {stars.map((filled, i) => (
              <StarFilledIcon key={i} className={cn('size-6', !filled && 'text-[#e2e8f0]')} />
            ))}
          </div>
          <span className="text-xl font-bold text-primary hover:opacity-90">
            {summary.overallRating != null ? `${summary.overallRating}/5.0` : 'Not rated'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Tasks Done', value: summary.tasksCompleted },
          { label: 'Tasks Pending', value: summary.tasksPending },
          { label: 'Efficiency', value: `${summary.efficiency}%` },
          { label: 'Attendance', value: `${summary.attendance}%` },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-border-card p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-text-muted">{item.label}</p>
            <p className="mt-1 text-xl font-bold text-heading">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-heading">
              Latest Review
            </p>
            <p className="mt-2 text-sm text-text-muted">{summary.reviewTitle}</p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-muted">{summary.reviewText}</p>
          </div>
          <span className="shrink-0 rounded-full bg-[#ecfdf5] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#00b67a]">
            {statusLabel}
          </span>
        </div>
      </div>
    </div>
  )
}
