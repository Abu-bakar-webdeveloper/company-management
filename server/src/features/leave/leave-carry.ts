/** Pure helpers for leave carry-forward / hire-year rules (unit-tested). */

/** Carry into `year` is only possible from `prevYear` if the employee was already hired then. */
export function canCarryFromPreviousYear(prevYear: number, hireYear: number): boolean {
  return prevYear >= hireYear
}

/**
 * Entitlement for a capped leave type in `year`.
 * Only years from hireYear onward accumulate carry-forward.
 */
export function computeEntitlementWithCarry(params: {
  maxDays: number
  carryForward: boolean
  year: number
  hireYear: number
  usedByYear: Record<number, number>
}): number {
  const { maxDays, carryForward, year, hireYear, usedByYear } = params
  if (year < hireYear) return 0
  if (!carryForward) return maxDays

  let carryIn = 0
  for (let y = hireYear; y < year; y += 1) {
    const entitlement = maxDays + carryIn
    const used = usedByYear[y] ?? 0
    carryIn = Math.max(0, entitlement - used)
  }
  return maxDays + carryIn
}
