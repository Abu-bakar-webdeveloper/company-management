import type { IncrementPolicy } from './company-payroll-settings.model.js'

export type EmploymentStage = 'probation' | 'permanent'

export type IncrementEligibility = {
  stage: EmploymentStage
  due: boolean
  nextEligibleOn: string | null
  monthsUntilDue: number | null
  message: string
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  d.setUTCMonth(d.getUTCMonth() + months)
  return d
}

function monthsBetween(from: Date, to: Date): number {
  return (
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 +
    (to.getUTCMonth() - from.getUTCMonth())
  )
}

export function getIncrementEligibility(params: {
  stage: EmploymentStage
  joinDate?: Date | null
  confirmationDate?: Date | null
  lastIncrementAt?: Date | null
  probationEndDate?: Date | null
  policy: IncrementPolicy
  asOf?: Date
}): IncrementEligibility {
  const asOf = params.asOf ?? new Date()
  const stage = params.stage

  if (stage === 'probation') {
    const base = params.joinDate
    if (!base) {
      return {
        stage,
        due: false,
        nextEligibleOn: null,
        monthsUntilDue: null,
        message: 'Set join date to track probation review',
      }
    }
    const dueDate =
      params.probationEndDate ?? addMonths(base, params.policy.probationMonths)
    const due = asOf >= dueDate
    const monthsUntil = Math.max(0, monthsBetween(asOf, dueDate))
    return {
      stage,
      due,
      nextEligibleOn: dueDate.toISOString().slice(0, 10),
      monthsUntilDue: due ? 0 : monthsUntil,
      message: due
        ? 'Probation review / increment is due'
        : `Probation review due on ${dueDate.toISOString().slice(0, 10)}`,
    }
  }

  // permanent
  let anchor: Date | null = null
  if (params.policy.eligibleFrom === 'join_date') {
    anchor = params.joinDate ?? null
  } else {
    anchor = params.lastIncrementAt ?? params.confirmationDate ?? params.joinDate ?? null
  }

  if (!anchor) {
    return {
      stage,
      due: false,
      nextEligibleOn: null,
      monthsUntilDue: null,
      message: 'Set confirmation or join date to track increment cycle',
    }
  }

  const dueDate = addMonths(anchor, params.policy.permanentMonths)
  const due = asOf >= dueDate
  const monthsUntil = Math.max(0, monthsBetween(asOf, dueDate))
  return {
    stage,
    due,
    nextEligibleOn: dueDate.toISOString().slice(0, 10),
    monthsUntilDue: due ? 0 : monthsUntil,
    message: due
      ? 'Annual increment is due'
      : `Next increment eligible on ${dueDate.toISOString().slice(0, 10)}`,
  }
}

/** Inclusive period key compare: year*12+month */
export function periodKey(year: number, month: number): number {
  return year * 12 + month
}

export function isPeriodInRange(
  year: number,
  month: number,
  startYear: number,
  startMonth: number,
  endYear?: number | null,
  endMonth?: number | null,
): boolean {
  const cur = periodKey(year, month)
  const start = periodKey(startYear, startMonth)
  if (cur < start) return false
  if (endYear == null || endMonth == null) return true
  return cur <= periodKey(endYear, endMonth)
}

export function buildLoanSchedule(params: {
  principal: number
  installmentAmount: number
  startMonth: number
  startYear: number
}): {
  schedule: { month: number; year: number; amount: number; status: 'pending' }[]
  endMonth: number
  endYear: number
} {
  const { principal, installmentAmount, startMonth, startYear } = params
  if (installmentAmount <= 0 || principal <= 0) {
    return {
      schedule: [],
      endMonth: startMonth,
      endYear: startYear,
    }
  }

  const schedule: { month: number; year: number; amount: number; status: 'pending' }[] =
    []
  let remaining = Math.round(principal * 100) / 100
  let month = startMonth
  let year = startYear
  let guard = 0

  while (remaining > 0 && guard < 600) {
    const amount = Math.min(installmentAmount, remaining)
    schedule.push({
      month,
      year,
      amount: Math.round(amount * 100) / 100,
      status: 'pending',
    })
    remaining = Math.round((remaining - amount) * 100) / 100
    month += 1
    if (month > 12) {
      month = 1
      year += 1
    }
    guard += 1
  }

  const last = schedule[schedule.length - 1]
  return {
    schedule,
    endMonth: last?.month ?? startMonth,
    endYear: last?.year ?? startYear,
  }
}
