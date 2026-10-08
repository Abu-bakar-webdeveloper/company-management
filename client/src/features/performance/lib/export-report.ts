import type { MyPerformance, PerformanceReview } from '@/features/performance/model/contracts'

function escapeCsv(value: string | number | null | undefined): string {
  const text = value == null ? '' : String(value)
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

export function exportMyPerformanceReport(data: MyPerformance): void {
  const lines: string[] = [
    'BizFlow Performance Report',
    `Name,${escapeCsv(data.employeeName)}`,
    `Role,${escapeCsv(data.subjectRole)}`,
    `Department,${escapeCsv(data.department)}`,
    `Period,${escapeCsv(data.periodLabel)}`,
    `Avg Rating,${escapeCsv(data.avgRating)}`,
    `Avg KPI Score,${escapeCsv(data.avgScore)}`,
    `Current Month Rating,${escapeCsv(data.currentMonthRating)}`,
    `Current Month KPI Score,${escapeCsv(data.currentMonthScore)}`,
    `Efficiency,${escapeCsv(data.efficiency)}%`,
    `Status,${escapeCsv(data.status)}`,
    `Bonus,${escapeCsv(data.bonus)}`,
    `Penalty,${escapeCsv(data.penalty)}`,
    `Bonus/Penalty Note,${escapeCsv(data.bonusPenaltyNote)}`,
    '',
    'KPI Categories',
    'Category,Obtained,Max',
    ...(data.categoryScores ?? []).map(
      (cat) => `${escapeCsv(cat.name)},${cat.obtained},${cat.maxMarks}`,
    ),
    '',
    'Breakdown',
    'Metric,Value',
    ...data.breakdown.map((item) => `${escapeCsv(item.label)},${item.value}%`),
    '',
    'Recent Reviews',
    'Date,KPI Score,Rating,Reviewer,Efficiency,Feedback',
    ...data.recentReviews.map((review: PerformanceReview) =>
      [
        escapeCsv(review.periodLabel),
        escapeCsv(review.finalAdjustedScore),
        escapeCsv(review.rating),
        escapeCsv(review.reviewerName),
        escapeCsv(`${review.efficiency}%`),
        escapeCsv(review.feedback),
      ].join(','),
    ),
  ]

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `performance-${data.periodStart}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
