import { User } from '../auth/user.model.js'
import type { PfSettings } from './company-payroll-settings.model.js'
import type { IPayrollComponent } from './payroll-component.model.js'
import {
  DEDUCTION_CODE_TO_FIELD,
  EARNING_CODE_TO_FIELD,
} from './payroll-defaults.js'
import { computePfAmounts } from './provident-fund.service.js'
import type {
  SalaryDeductions,
  SalaryEarnings,
  SalaryLineItem,
} from './salary.model.js'

export type AmountOverrides = Record<string, number>

function emptyEarnings(): SalaryEarnings {
  return {
    basic: 0,
    hra: 0,
    utilityAllowance: 0,
    conveyanceAllowance: 0,
    reimburse: 0,
    overTime: 0,
    bonus: 0,
    loanIssued: 0,
    leaveEncashment: 0,
  }
}

function emptyDeductions(): SalaryDeductions {
  return {
    leave: 0,
    loan: 0,
    providentFund: 0,
    advance: 0,
    incomeTax: 0,
    other: 0,
  }
}

function userOverrideForCode(
  user: InstanceType<typeof User>,
  code: string,
): number | undefined {
  switch (code) {
    case 'BASIC':
      return user.basicSalary
    case 'HRA':
      return user.hra
    case 'UTILITY':
      return user.utilityAllowance
    case 'CONVEYANCE':
      return user.conveyanceAllowance
    default:
      return undefined
  }
}

export function resolveComponentAmount(
  component: IPayrollComponent,
  basic: number,
  user: InstanceType<typeof User>,
  overrides?: AmountOverrides,
): number {
  if (overrides && overrides[component.code] !== undefined) {
    return Math.max(0, Number(overrides[component.code]) || 0)
  }

  // PF is company-controlled via Payroll Settings % — never from employee profile
  if (component.code === 'PF') {
    if (component.calcType === 'percent_of_basic') {
      return Math.round((basic * component.defaultValue) / 100)
    }
    return Math.max(0, component.defaultValue)
  }

  const userValue = userOverrideForCode(user, component.code)
  if (userValue !== undefined && userValue !== null) {
    return Math.max(0, userValue)
  }

  if (component.calcType === 'percent_of_basic') {
    return Math.round((basic * component.defaultValue) / 100)
  }

  return Math.max(0, component.defaultValue)
}

export function buildPayrollSnapshot(params: {
  components: IPayrollComponent[]
  user: InstanceType<typeof User>
  pf: PfSettings
  overrides?: AmountOverrides
  leaveDeduction?: number
  leaveEncashment?: number
}): {
  lineItems: SalaryLineItem[]
  earnings: SalaryEarnings
  deductions: SalaryDeductions
  employerProvidentFund: number
  totalEarnings: number
  totalDeductions: number
  net: number
} {
  const { components, user, pf, overrides, leaveDeduction = 0, leaveEncashment = 0 } =
    params

  const basicOverride = overrides?.BASIC
  const basic =
    basicOverride !== undefined
      ? Math.max(0, basicOverride)
      : Math.max(0, user.basicSalary ?? 0)

  const lineItems: SalaryLineItem[] = []

  for (const component of components) {
    if (!component.active) continue
    if (component.code === 'PF') continue // computed after earnings
    if (component.code === 'LEAVE') continue // applied after
    if (component.code === 'LEAVE_ENCASHMENT' && leaveEncashment <= 0) continue

    let amount = resolveComponentAmount(component, basic, user, overrides)
    if (component.code === 'LEAVE_ENCASHMENT') {
      amount = leaveEncashment
    }
    if (component.code === 'BASIC') {
      amount = basic
    }

    lineItems.push({
      componentId: component._id,
      code: component.code,
      name: component.name,
      kind: component.kind,
      amount,
    })
  }

  // Ensure LEAVE_ENCASHMENT line when amount > 0 even if component inactive somehow
  if (leaveEncashment > 0 && !lineItems.some((l) => l.code === 'LEAVE_ENCASHMENT')) {
    const enc = components.find((c) => c.code === 'LEAVE_ENCASHMENT')
    lineItems.push({
      componentId: enc?._id,
      code: 'LEAVE_ENCASHMENT',
      name: enc?.name ?? 'Leave Encashment',
      kind: 'earning',
      amount: leaveEncashment,
    })
  }

  const grossBeforePf = lineItems
    .filter((l) => l.kind === 'earning')
    .reduce((sum, l) => sum + l.amount, 0)

  const { employeeAmount, employerAmount } = computePfAmounts(pf, basic, grossBeforePf)

  const pfComponent = components.find((c) => c.code === 'PF')
  const pfAmount =
    overrides?.PF !== undefined
      ? Math.max(0, overrides.PF)
      : pf.enabled
        ? employeeAmount
        : resolveComponentAmount(
            pfComponent ??
              ({
                code: 'PF',
                calcType: 'fixed',
                defaultValue: 0,
                active: true,
              } as IPayrollComponent),
            basic,
            user,
            overrides,
          )

  if (pfAmount > 0 || pfComponent?.active) {
    lineItems.push({
      componentId: pfComponent?._id,
      code: 'PF',
      name: pfComponent?.name ?? 'Provident Fund',
      kind: 'deduction',
      amount: pfAmount,
    })
  }

  const leaveComponent = components.find((c) => c.code === 'LEAVE')
  const leaveAmount =
    overrides?.LEAVE !== undefined ? Math.max(0, overrides.LEAVE) : leaveDeduction
  if (leaveAmount > 0 || leaveComponent?.active) {
    lineItems.push({
      componentId: leaveComponent?._id,
      code: 'LEAVE',
      name: leaveComponent?.name ?? 'Leave',
      kind: 'deduction',
      amount: leaveAmount,
    })
  }

  // Sort by catalog order when possible
  const order = new Map(components.map((c, i) => [c.code, c.sortOrder ?? i]))
  lineItems.sort((a, b) => (order.get(a.code) ?? 999) - (order.get(b.code) ?? 999))

  const earnings = emptyEarnings()
  const deductions = emptyDeductions()

  for (const item of lineItems) {
    if (item.kind === 'earning') {
      const field = EARNING_CODE_TO_FIELD[item.code]
      if (field) earnings[field] = item.amount
    } else {
      const field = DEDUCTION_CODE_TO_FIELD[item.code]
      if (field) deductions[field] = item.amount
    }
  }

  // Custom components not in legacy map still count via lineItems
  const totalEarnings = lineItems
    .filter((l) => l.kind === 'earning')
    .reduce((s, l) => s + l.amount, 0)
  const totalDeductions = lineItems
    .filter((l) => l.kind === 'deduction')
    .reduce((s, l) => s + l.amount, 0)

  return {
    lineItems,
    earnings,
    deductions,
    employerProvidentFund: pf.enabled ? employerAmount : 0,
    totalEarnings,
    totalDeductions,
    net: totalEarnings - totalDeductions,
  }
}

export function lineItemsFromLegacy(
  earnings: SalaryEarnings,
  deductions: SalaryDeductions,
): SalaryLineItem[] {
  const items: SalaryLineItem[] = []
  for (const [code, field] of Object.entries(EARNING_CODE_TO_FIELD)) {
    const amount = earnings[field]
    if (amount > 0 || code === 'BASIC') {
      items.push({
        code,
        name: code.replace(/_/g, ' '),
        kind: 'earning',
        amount,
      })
    }
  }
  for (const [code, field] of Object.entries(DEDUCTION_CODE_TO_FIELD)) {
    const amount = deductions[field]
    if (amount > 0) {
      items.push({
        code,
        name: code.replace(/_/g, ' '),
        kind: 'deduction',
        amount,
      })
    }
  }
  return items
}

export function overridesFromEarningsDeductions(
  earnings?: Partial<SalaryEarnings>,
  deductions?: Partial<SalaryDeductions>,
  lineItemOverrides?: { code: string; amount: number }[],
): AmountOverrides {
  const overrides: AmountOverrides = {}
  if (earnings) {
    for (const [code, field] of Object.entries(EARNING_CODE_TO_FIELD)) {
      if (earnings[field] !== undefined) overrides[code] = earnings[field]!
    }
  }
  if (deductions) {
    for (const [code, field] of Object.entries(DEDUCTION_CODE_TO_FIELD)) {
      if (deductions[field] !== undefined) overrides[code] = deductions[field]!
    }
  }
  if (lineItemOverrides) {
    for (const item of lineItemOverrides) {
      overrides[item.code.toUpperCase()] = item.amount
    }
  }
  return overrides
}
