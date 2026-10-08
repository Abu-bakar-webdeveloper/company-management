/**
 * Calendar-day / excess allocation checks.
 * Run: node src/features/leave/leave-dates.test.mjs
 */
import assert from 'node:assert/strict'
import {
  allocateExcessDaysForMonth,
  balanceDaysInYear,
  daysOverlapInMonthUtc,
  inclusiveUtcDays,
  monthBuckets,
} from './leave-dates.ts'

function d(iso) {
  return new Date(`${iso}T00:00:00.000Z`)
}

// Duration: HTML date strings as UTC midnight
assert.equal(inclusiveUtcDays(d('2024-01-15'), d('2024-01-15')), 1)
assert.equal(inclusiveUtcDays(d('2024-01-15'), d('2024-01-17')), 3)

// Month overlap across year boundary
assert.equal(daysOverlapInMonthUtc(d('2024-12-28'), d('2025-01-05'), 2024, 12), 4)
assert.equal(daysOverlapInMonthUtc(d('2024-12-28'), d('2025-01-05'), 2025, 1), 5)

// Balance days attributed by calendar year (first N days consume balance)
assert.equal(balanceDaysInYear(d('2024-12-28'), d('2025-01-05'), 6, 2024), 4)
assert.equal(balanceDaysInYear(d('2024-12-28'), d('2025-01-05'), 6, 2025), 2)
assert.equal(balanceDaysInYear(d('2024-12-28'), d('2025-01-05'), 3, 2024), 3)
assert.equal(balanceDaysInYear(d('2024-12-28'), d('2025-01-05'), 3, 2025), 0)

// Excess allocation sums exactly across months
const start = d('2024-01-28')
const end = d('2024-02-05')
const buckets = monthBuckets(start, end)
assert.deepEqual(
  buckets.map((b) => ({ y: b.year, m: b.month, d: b.overlapDays })),
  [
    { y: 2024, m: 1, d: 4 },
    { y: 2024, m: 2, d: 5 },
  ],
)

const excess = 3
const jan = allocateExcessDaysForMonth(start, end, excess, 2024, 1)
const feb = allocateExcessDaysForMonth(start, end, excess, 2024, 2)
assert.equal(Math.round((jan + feb) * 100) / 100, excess)
assert.ok(jan > 0 && feb > 0)

console.log('leave-dates.test.mjs: all assertions passed')
