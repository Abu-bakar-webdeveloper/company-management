import type {
  PerformanceListFilters,
  PerformanceRecord,
  PerformanceStatus,
} from '@/features/performance/model/types'
import { scoreToLevel } from '@/features/performance/lib/kpi-scoring'

export function ratingLabel(rating: number): string {
  return `${rating.toFixed(1)} Stars`
}

export function statusLabel(status: PerformanceStatus): string {
  const labels: Record<PerformanceStatus, string> = {
    excellent: 'EXCELLENT',
    good: 'GOOD',
    average: 'AVERAGE',
    critical: 'CRITICAL',
    needs_improvement: 'NEEDS IMPROVEMENT',
    poor: 'POOR',
  }
  return labels[status]
}

export function ratingStatus(rating: number): PerformanceStatus {
  if (rating >= 4.5) return 'excellent'
  if (rating >= 4.0) return 'good'
  if (rating >= 3.5) return 'average'
  return 'critical'
}

export function resolveDisplayStatus(input: {
  finalAdjustedScore?: number | null
  rating?: number | null
  status?: PerformanceStatus | null
}): PerformanceStatus | null {
  if (input.finalAdjustedScore != null) return scoreToLevel(input.finalAdjustedScore)
  if (input.status) return input.status
  if (input.rating != null) return ratingStatus(input.rating)
  return null
}

export function primaryScoreLabel(input: {
  finalAdjustedScore?: number | null
  rating?: number | null
}): string {
  if (input.finalAdjustedScore != null) {
    return `${input.finalAdjustedScore.toFixed(0)} / 100`
  }
  if (input.rating != null) return ratingLabel(input.rating)
  return '—'
}

/** Calendar month key from YYYY-MM-DD (or ISO) period start. */
export function periodMonthKey(periodStart: string): string {
  const match = /^(\d{4})-(\d{2})/.exec(periodStart.trim())
  return match ? `${match[1]}-${match[2]}` : periodStart
}

/** Match reviews by calendar month (periodStart key or periodLabel). */
export function isSameReviewPeriod(
  a: { periodStart: string; periodLabel?: string },
  b: { periodStart: string; periodLabel?: string },
): boolean {
  if (a.periodLabel && b.periodLabel && a.periodLabel === b.periodLabel) return true
  return periodMonthKey(a.periodStart) === periodMonthKey(b.periodStart)
}

export function findReviewForPeriod<T extends { periodStart: string; periodLabel?: string }>(
  reviews: T[],
  period: { periodStart: string; periodLabel?: string },
): T | undefined {
  return reviews.find((review) => isSameReviewPeriod(review, period))
}

export function filterPerformanceRecords(
  records: PerformanceRecord[],
  filters: PerformanceListFilters,
): PerformanceRecord[] {
  return records.filter((record) => {
    const search = filters.search?.trim().toLowerCase() ?? ''
    if (search) {
      const haystack = `${record.employeeName} ${record.employeeEmail} ${record.role}`.toLowerCase()
      if (!haystack.includes(search)) return false
    }

    if (filters.rating !== 'all') {
      if (record.rating == null) return false
      if (filters.rating === '4+' && record.rating < 4) return false
      if (filters.rating === '3-4' && (record.rating < 3 || record.rating >= 4)) return false
      if (filters.rating === 'below3' && record.rating >= 3) return false
    }

    if (filters.status !== 'all' && record.status !== filters.status) return false

    return true
  })
}
