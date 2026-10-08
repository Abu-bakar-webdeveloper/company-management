const MONTH_KEY_RE = /^\d{4}-\d{2}$/

export function currentYearMonth(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function formatYearMonthLabel(ym: string): string {
  if (!MONTH_KEY_RE.test(ym)) return ym
  const [year, month] = ym.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

export function clampYearMonth(ym: string | null | undefined, maxYm = currentYearMonth()): string {
  if (!ym || !MONTH_KEY_RE.test(ym)) return maxYm
  return ym > maxYm ? maxYm : ym
}

/** Recent months ending at `maxYm`, newest first (YYYY-MM). */
export function listYearMonths(count = 24, maxYm = currentYearMonth()): string[] {
  const clampedMax = clampYearMonth(maxYm)
  const [year, month] = clampedMax.split('-').map(Number)
  const months: string[] = []
  for (let i = 0; i < count; i += 1) {
    const date = new Date(year, month - 1 - i, 1)
    months.push(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
    )
  }
  return months
}

export function reportsPath(month: string, maxYm = currentYearMonth()): string {
  const clamped = clampYearMonth(month, maxYm)
  return clamped === maxYm ? '/reports' : `/reports?month=${clamped}`
}

export function reportDetailPath(
  reportId: string,
  month: string,
  maxYm = currentYearMonth(),
): string {
  const clamped = clampYearMonth(month, maxYm)
  return clamped === maxYm ? `/reports/${reportId}` : `/reports/${reportId}?month=${clamped}`
}
