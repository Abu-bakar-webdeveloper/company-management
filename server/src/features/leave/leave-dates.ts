/** Calendar-day helpers using UTC date parts (HTML `YYYY-MM-DD` → UTC midnight). */

export function utcDayMs(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

export function inclusiveUtcDays(start: Date, end: Date): number {
  const from = utcDayMs(start)
  const to = utcDayMs(end)
  if (to < from) return 0
  return Math.floor((to - from) / (24 * 60 * 60 * 1000)) + 1
}

export function yearBoundsUtc(year: number): { start: Date; end: Date } {
  return {
    start: new Date(Date.UTC(year, 0, 1)),
    end: new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)),
  }
}

export function monthBoundsUtc(
  year: number,
  month: number,
): { startMs: number; endMs: number } {
  return {
    startMs: Date.UTC(year, month - 1, 1),
    endMs: Date.UTC(year, month, 0),
  }
}

export function daysOverlapInMonthUtc(
  start: Date,
  end: Date,
  year: number,
  month: number,
): number {
  const { startMs, endMs } = monthBoundsUtc(year, month)
  const from = Math.max(utcDayMs(start), startMs)
  const to = Math.min(utcDayMs(end), endMs)
  if (to < from) return 0
  return Math.floor((to - from) / (24 * 60 * 60 * 1000)) + 1
}

export type MonthBucket = { year: number; month: number; overlapDays: number }

/** Months touched by [start, end], with calendar-day overlap in each. */
export function monthBuckets(start: Date, end: Date): MonthBucket[] {
  const buckets: MonthBucket[] = []
  let y = start.getUTCFullYear()
  let m = start.getUTCMonth() + 1
  const endY = end.getUTCFullYear()
  const endM = end.getUTCMonth() + 1

  while (y < endY || (y === endY && m <= endM)) {
    const overlapDays = daysOverlapInMonthUtc(start, end, y, m)
    if (overlapDays > 0) buckets.push({ year: y, month: m, overlapDays })
    m += 1
    if (m > 12) {
      m = 1
      y += 1
    }
  }
  return buckets
}

/**
 * Distribute excess days across overlapping months using largest-remainder
 * so monthly shares sum exactly to excessDays (2 decimal places).
 */
export function allocateExcessDaysForMonth(
  start: Date,
  end: Date,
  excessDays: number,
  year: number,
  month: number,
): number {
  if (excessDays <= 0) return 0
  const buckets = monthBuckets(start, end)
  if (buckets.length === 0) return 0

  const totalOverlap = buckets.reduce((s, b) => s + b.overlapDays, 0)
  if (totalOverlap <= 0) return 0

  const raw = buckets.map((b) => ({
    ...b,
    exact: (excessDays * b.overlapDays) / totalOverlap,
  }))
  const floored = raw.map((b) => ({
    ...b,
    share: Math.floor(b.exact * 100) / 100,
    frac: b.exact * 100 - Math.floor(b.exact * 100),
  }))
  let allocated = floored.reduce((s, b) => s + b.share, 0)
  let remainderCents = Math.round((excessDays - allocated) * 100)

  floored
    .slice()
    .sort((a, b) => b.frac - a.frac)
    .forEach((b) => {
      if (remainderCents <= 0) return
      b.share = Math.round((b.share + 0.01) * 100) / 100
      remainderCents -= 1
    })

  const hit = floored.find((b) => b.year === year && b.month === month)
  return hit?.share ?? 0
}

/**
 * How many of the leave's balance-consuming days fall in `year`.
 * Balance days are the first `balanceDaysUsed` calendar days of the request.
 */
export function balanceDaysInYear(
  start: Date,
  end: Date,
  balanceDaysUsed: number,
  year: number,
): number {
  if (balanceDaysUsed <= 0) return 0
  const { start: yearStart, end: yearEnd } = yearBoundsUtc(year)
  const yearStartMs = utcDayMs(yearStart)
  const yearEndMs = utcDayMs(yearEnd)

  let counted = 0
  let inYear = 0
  let cursor = utcDayMs(start)
  const last = utcDayMs(end)

  while (cursor <= last && counted < balanceDaysUsed) {
    if (cursor >= yearStartMs && cursor <= yearEndMs) {
      inYear += 1
    }
    counted += 1
    cursor += 24 * 60 * 60 * 1000
  }

  return inYear
}

export function durationDaysInYear(start: Date, end: Date, year: number): number {
  const { start: yearStart, end: yearEnd } = yearBoundsUtc(year)
  const from = Math.max(utcDayMs(start), utcDayMs(yearStart))
  const to = Math.min(utcDayMs(end), utcDayMs(yearEnd))
  if (to < from) return 0
  return Math.floor((to - from) / (24 * 60 * 60 * 1000)) + 1
}
