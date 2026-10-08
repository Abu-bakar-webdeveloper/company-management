/**
 * Carry-forward / hire-year entitlement checks.
 * Run: npx tsx src/features/leave/leave-carry.test.mjs
 */
import assert from 'node:assert/strict'
import {
  canCarryFromPreviousYear,
  computeEntitlementWithCarry,
} from './leave-carry.ts'

assert.equal(canCarryFromPreviousYear(2025, 2026), false)
assert.equal(canCarryFromPreviousYear(2026, 2026), true)
assert.equal(canCarryFromPreviousYear(2027, 2026), true)

// New hire this year, carry-forward on, no history → only maxDays
assert.equal(
  computeEntitlementWithCarry({
    maxDays: 12,
    carryForward: true,
    year: 2026,
    hireYear: 2026,
    usedByYear: {},
  }),
  12,
)

// Same without carry-forward
assert.equal(
  computeEntitlementWithCarry({
    maxDays: 12,
    carryForward: false,
    year: 2026,
    hireYear: 2026,
    usedByYear: {},
  }),
  12,
)

// Hired 2024, unused both prior years, CF on → 12 + 12 + 12 = 36 in 2026
assert.equal(
  computeEntitlementWithCarry({
    maxDays: 12,
    carryForward: true,
    year: 2026,
    hireYear: 2024,
    usedByYear: { 2024: 0, 2025: 0 },
  }),
  36,
)

// Must NOT invent pre-hire years (old bug: ~12 years × 12 = 144)
assert.notEqual(
  computeEntitlementWithCarry({
    maxDays: 12,
    carryForward: true,
    year: 2026,
    hireYear: 2026,
    usedByYear: {},
  }),
  144,
)

console.log('leave-carry.test.mjs: all assertions passed')
