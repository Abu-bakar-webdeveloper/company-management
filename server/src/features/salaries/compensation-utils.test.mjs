/**
 * Compensation helpers: eligibility, period range, loan schedule.
 * Run: npx tsx src/features/salaries/compensation-utils.test.mjs
 */
import assert from 'node:assert/strict'
import {
  buildLoanSchedule,
  getIncrementEligibility,
  isPeriodInRange,
  periodKey,
} from './compensation-utils.ts'

// period helpers
assert.equal(periodKey(2026, 1), 2026 * 12 + 1)
assert.equal(isPeriodInRange(2026, 3, 2026, 1, 2026, 6), true)
assert.equal(isPeriodInRange(2026, 7, 2026, 1, 2026, 6), false)
assert.equal(isPeriodInRange(2026, 8, 2026, 1, null, null), true)

// probation eligibility
{
  const join = new Date('2025-01-01T00:00:00.000Z')
  const asOf = new Date('2025-07-01T00:00:00.000Z')
  const el = getIncrementEligibility({
    stage: 'probation',
    joinDate: join,
    policy: {
      probationMonths: 6,
      permanentMonths: 12,
      eligibleFrom: 'confirmation_or_last_increment',
    },
    asOf,
  })
  assert.equal(el.due, true)
  assert.ok(el.nextEligibleOn)
}

{
  const join = new Date('2025-06-01T00:00:00.000Z')
  const asOf = new Date('2025-07-01T00:00:00.000Z')
  const el = getIncrementEligibility({
    stage: 'probation',
    joinDate: join,
    policy: {
      probationMonths: 6,
      permanentMonths: 12,
      eligibleFrom: 'confirmation_or_last_increment',
    },
    asOf,
  })
  assert.equal(el.due, false)
}

// permanent cycle from last increment
{
  const last = new Date('2025-01-15T00:00:00.000Z')
  const asOf = new Date('2026-01-15T00:00:00.000Z')
  const el = getIncrementEligibility({
    stage: 'permanent',
    joinDate: new Date('2020-01-01T00:00:00.000Z'),
    lastIncrementAt: last,
    policy: {
      probationMonths: 6,
      permanentMonths: 12,
      eligibleFrom: 'confirmation_or_last_increment',
    },
    asOf,
  })
  assert.equal(el.due, true)
}

// loan schedule sums to principal
{
  const { schedule, endMonth, endYear } = buildLoanSchedule({
    principal: 10000,
    installmentAmount: 3000,
    startMonth: 1,
    startYear: 2026,
  })
  const total = schedule.reduce((s, r) => s + r.amount, 0)
  assert.equal(Math.round(total * 100) / 100, 10000)
  assert.equal(schedule.length, 4)
  assert.equal(schedule[3].amount, 1000)
  assert.equal(endMonth, 4)
  assert.equal(endYear, 2026)
}

console.log('compensation-utils.test.mjs: all assertions passed')
