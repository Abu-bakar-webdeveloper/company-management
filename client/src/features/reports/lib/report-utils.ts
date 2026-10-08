import type {
  GeneratableReportModule,
  ReportDataFilters,
  ReportMetricFormat,
  ReportRecord,
} from '@/features/reports/model/types'
import { formatCompanyMoneyCompact } from '@/shared/lib/format'

export function formatCurrency(amount: number): string {
  return formatCompanyMoneyCompact(amount)
}

export function formatMetric(value: number | null, format: ReportMetricFormat): string {
  if (value == null || format === 'none') return '—'
  switch (format) {
    case 'currency':
      return formatCurrency(value)
    case 'percent':
      return `${value}%`
    case 'days':
      return value === 1 ? '1 day' : `${value} days`
    case 'rating':
      return value.toFixed(1)
    case 'number':
    default:
      return String(value)
  }
}

export function filterReportRecords(
  records: ReportRecord[],
  filters: ReportDataFilters,
): ReportRecord[] {
  const q = filters.search.trim().toLowerCase()

  return records.filter((record) => {
    const matchesSearch =
      !q ||
      (record.employeeName ?? '').toLowerCase().includes(q) ||
      (record.detail ?? '').toLowerCase().includes(q) ||
      (record.category ?? '').toLowerCase().includes(q) ||
      (record.status ?? '').toLowerCase().includes(q)

    const matchesStatus =
      filters.status === 'All Status' ||
      record.status.toLowerCase() === filters.status.toLowerCase()

    const matchesCategory =
      filters.category === 'All Category' ||
      record.category.toLowerCase() === filters.category.toLowerCase()

    return matchesSearch && matchesStatus && matchesCategory
  })
}

export function isGeneratableModule(
  value: string | null | undefined,
): value is GeneratableReportModule {
  return (
    value === 'employees' ||
    value === 'projects' ||
    value === 'leaves' ||
    value === 'performance' ||
    value === 'expenses'
  )
}
