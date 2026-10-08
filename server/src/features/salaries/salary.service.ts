import { Types } from 'mongoose'
import { AppError } from '../../utils/AppError.js'
import {
  buildPaginatedResult,
  buildSearchFilter,
  parsePagination,
} from '../../utils/pagination.js'
import type { UserRole } from '../auth/auth.types.js'
import type { Permission } from '../auth/permissions.js'
import { hasPermission } from '../auth/permissions.js'
import { User } from '../auth/user.model.js'
import { Company } from '../companies/company.model.js'
import { LeaveEncashment } from '../leave/leave-encashment.model.js'
import { dispatchDomainEventSafe } from '../notifications/notification.service.js'
import { ensureEmployeeCode } from '../users/user.service.js'
import { dailyRateFromBasic, getDeductibleLeaveDays } from './leave-payroll.js'
import {
  getActiveAssignmentsForPeriod,
  getLoanAmountsForPeriod,
  markLoanInstallmentsApplied,
  resolvePackageAsOf,
  revertLoanInstallmentsForSalary,
} from './compensation.service.js'
import {
  buildPayrollSnapshot,
  lineItemsFromLegacy,
  overridesFromEarningsDeductions,
} from './payroll-calc.js'
import {
  ensurePayrollSettings,
  getActiveComponents,
} from './payroll-settings.service.js'
import {
  getEmployeePfBalance,
  postPfContributionFromSalary,
  reversePfContributionFromSalary,
} from './provident-fund.service.js'
import {
  Salary,
  type ISalary,
  type SalaryActivityType,
  type SalaryDeductions,
  type SalaryEarnings,
  type SalaryLineItem,
  type SalaryStatus,
} from './salary.model.js'
import type {
  BulkSalaryStatusInput,
  CreateSalaryInput,
  GenerateMonthInput,
  ListSalariesQuery,
  UpdateSalaryInput,
  UpdateSalaryStatusInput,
} from './salary.validation.js'
import { buildSalarySlipPdf } from './exporters/salary-slip-pdf.js'

export type SalaryActor = {
  id: string
  companyId: string
  role: UserRole
  fullName: string
  permissions: Permission[]
}

export function buildSalaryActor(
  id: string,
  companyId: string,
  role: UserRole,
  fullName: string,
  permissions: Permission[] = [],
): SalaryActor {
  return { id, companyId, role, fullName, permissions }
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

function pushActivity(
  doc: ISalary,
  type: SalaryActivityType,
  actor: SalaryActor,
  note?: string,
): void {
  doc.activities.unshift({
    type,
    actorId: new Types.ObjectId(actor.id),
    actorName: actor.fullName,
    ...(note ? { note } : {}),
    createdAt: new Date(),
  })
}

function payPeriodLabel(month: number, year: number): string {
  return `${MONTH_NAMES[month - 1]} ${year}`
}

async function dispatchSalaryStatusEvent(
  doc: ISalary,
  actor: SalaryActor,
  status: SalaryStatus,
): Promise<void> {
  const subjectUserId = doc.employeeId.toString()
  const entityLabel = payPeriodLabel(doc.payPeriodMonth, doc.payPeriodYear)
  await dispatchDomainEventSafe({
    type: status === 'paid' ? 'salary.paid' : 'salary.status_changed',
    actor: { id: actor.id, fullName: actor.fullName, companyId: actor.companyId },
    entityId: doc._id.toString(),
    subjectUserId,
    context: {
      subjectName: doc.employeeName,
      entityLabel,
      statusLabel: status,
    },
  })
}

function periodDate(year: number, month: number): Date {
  return new Date(Date.UTC(year, month - 1, 1))
}

function formatDepartment(value?: string): string {
  if (!value) return 'General'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export type SalaryDto = {
  id: string
  employeeId: string
  employeeCode: string
  employeeName: string
  employeeAvatar?: string
  department: string
  designation: string
  basic: number
  allowances: number
  deductions: number
  providentFund: number
  employerProvidentFund: number
  net: number
  date: string
  payPeriodMonth: number
  payPeriodYear: number
  payPeriodLabel: string
  status: SalaryStatus
  description: string
  earnings: SalaryEarnings
  deductionBreakdown: SalaryDeductions
  lineItems: SalaryLineItem[]
  activities: {
    id: string
    type: SalaryActivityType
    actor: string
    timestamp: string
    note?: string
  }[]
  approvedBy?: string
  approvedAt?: string
  bankName?: string
  bankAccountNo?: string
}

function toDto(doc: ISalary): SalaryDto {
  const lineItems =
    doc.lineItems?.length > 0
      ? doc.lineItems
      : lineItemsFromLegacy(doc.earnings, doc.deductions)

  const allowances = lineItems
    .filter((l) => l.kind === 'earning' && l.code !== 'BASIC')
    .reduce((s, l) => s + l.amount, 0)

  const monthName = MONTH_NAMES[doc.payPeriodMonth - 1] ?? String(doc.payPeriodMonth)

  return {
    id: doc._id.toString(),
    employeeId: doc.employeeId.toString(),
    employeeCode: doc.employeeCode,
    employeeName: doc.employeeName,
    ...(doc.employeeAvatar ? { employeeAvatar: doc.employeeAvatar } : {}),
    department: formatDepartment(doc.department),
    designation: doc.designation,
    basic: doc.earnings.basic,
    allowances,
    deductions: doc.totalDeductions,
    providentFund: doc.deductions.providentFund,
    employerProvidentFund: doc.employerProvidentFund ?? 0,
    net: doc.net,
    date: periodDate(doc.payPeriodYear, doc.payPeriodMonth).toISOString(),
    payPeriodMonth: doc.payPeriodMonth,
    payPeriodYear: doc.payPeriodYear,
    payPeriodLabel: `${monthName} ${doc.payPeriodYear}`,
    status: doc.status,
    description: doc.description,
    earnings: { ...doc.earnings },
    deductionBreakdown: { ...doc.deductions },
    lineItems: lineItems.map((l) => ({
      code: l.code,
      name: l.name,
      kind: l.kind,
      amount: l.amount,
      ...(l.componentId ? { componentId: l.componentId } : {}),
    })),
    activities: doc.activities.map((a, index) => ({
      id: `${doc._id.toString()}-a${index}`,
      type: a.type,
      actor: a.actorName,
      timestamp: a.createdAt.toISOString(),
      ...(a.note ? { note: a.note } : {}),
    })),
    ...(doc.approvedByName ? { approvedBy: doc.approvedByName } : {}),
    ...(doc.approvedAt ? { approvedAt: doc.approvedAt.toISOString() } : {}),
    ...(doc.bankName ? { bankName: doc.bankName } : {}),
    ...(doc.bankAccountNo ? { bankAccountNo: doc.bankAccountNo } : {}),
  }
}

async function applyStatusSideEffects(
  doc: ISalary,
  previousStatus: SalaryStatus,
  status: SalaryStatus,
  actor: SalaryActor,
): Promise<void> {
  if (status === 'paid') {
    doc.approvedById = new Types.ObjectId(actor.id)
    doc.approvedByName = actor.fullName
    doc.approvedAt = new Date()
    if (previousStatus !== 'paid') {
      await postPfContributionFromSalary(doc)
    }
  } else {
    doc.approvedById = undefined
    doc.approvedByName = undefined
    doc.approvedAt = undefined
    if (previousStatus === 'paid') {
      await reversePfContributionFromSalary(doc)
    }
  }
}

async function applyDefaultsToEmployee(
  user: InstanceType<typeof User>,
  earnings: SalaryEarnings,
  _deductions: SalaryDeductions,
): Promise<void> {
  user.basicSalary = earnings.basic
  user.hra = earnings.hra
  user.utilityAllowance = earnings.utilityAllowance
  user.conveyanceAllowance = earnings.conveyanceAllowance
  await user.save()
}

async function buildEmployeePayroll(params: {
  companyId: string
  user: InstanceType<typeof User>
  month: number
  year: number
  overrides?: ReturnType<typeof overridesFromEarningsDeductions>
}) {
  const { companyId, user, month, year, overrides } = params
  const settings = await ensurePayrollSettings(companyId)
  const components = await getActiveComponents(companyId)

  const asOf = new Date(Date.UTC(year, month - 1, 1))
  const pkg = await resolvePackageAsOf({ companyId, user, asOf })
  const assignments = await getActiveAssignmentsForPeriod({
    companyId,
    employeeId: user._id.toString(),
    month,
    year,
  })
  const loanInfo = await getLoanAmountsForPeriod({
    companyId,
    employeeId: user._id.toString(),
    month,
    year,
  })

  const resolvedOverrides: Record<string, number> = { ...(overrides ?? {}) }

  // Package fills structural amounts unless explicitly overridden on the slip
  if (resolvedOverrides.BASIC === undefined) resolvedOverrides.BASIC = pkg.basic
  if (resolvedOverrides.HRA === undefined) {
    resolvedOverrides.HRA = pkg.allowances.HRA ?? 0
  }
  if (resolvedOverrides.UTILITY === undefined) {
    resolvedOverrides.UTILITY = pkg.allowances.UTILITY ?? 0
  }
  if (resolvedOverrides.CONVEYANCE === undefined) {
    resolvedOverrides.CONVEYANCE = pkg.allowances.CONVEYANCE ?? 0
  }

  const assignmentTotals = new Map<string, { amount: number; kind: 'earning' | 'deduction' }>()
  for (const a of assignments) {
    const prev = assignmentTotals.get(a.componentCode)
    assignmentTotals.set(a.componentCode, {
      amount: (prev?.amount ?? 0) + a.amount,
      kind: a.kind,
    })
  }
  for (const [code, { amount }] of assignmentTotals) {
    // Time-bound assignments override package for that code in this month
    resolvedOverrides[code] = amount
  }

  if (resolvedOverrides.LOAN === undefined && loanInfo.loanDeduction > 0) {
    resolvedOverrides.LOAN = loanInfo.loanDeduction
  }
  if (resolvedOverrides.LOAN_ISSUED === undefined && loanInfo.loanIssued > 0) {
    resolvedOverrides.LOAN_ISSUED = loanInfo.loanIssued
  }

  const leaveDays = await getDeductibleLeaveDays({
    companyId,
    employeeId: user._id.toString(),
    month,
    year,
  })
  const basic = resolvedOverrides.BASIC ?? user.basicSalary ?? 0
  const leaveDeduction =
    resolvedOverrides.LEAVE !== undefined
      ? resolvedOverrides.LEAVE
      : Math.round(
          leaveDays *
            dailyRateFromBasic(basic, settings.leavePolicy.leaveDeductionDivisor) *
            100,
        ) / 100

  const pendingEncashments = await LeaveEncashment.find({
    companyId,
    employeeId: user._id,
    status: 'pending',
    targetMonth: month,
    targetYear: year,
  })
  const pendingTotal = pendingEncashments.reduce((s, e) => s + e.amount, 0)
  const leaveEncashment =
    resolvedOverrides.LEAVE_ENCASHMENT !== undefined
      ? resolvedOverrides.LEAVE_ENCASHMENT
      : pendingTotal

  const snapshot = buildPayrollSnapshot({
    components,
    user,
    pf: settings.pf,
    overrides: resolvedOverrides,
    leaveDeduction,
    leaveEncashment,
  })

  // Add assignment lines for codes not already in the catalog snapshot
  const existingCodes = new Set(snapshot.lineItems.map((l) => l.code))
  for (const [code, { amount, kind }] of assignmentTotals) {
    if (existingCodes.has(code)) continue
    if (amount <= 0) continue
    snapshot.lineItems.push({
      code,
      name: code.replace(/_/g, ' '),
      kind,
      amount,
    })
    if (kind === 'earning') {
      snapshot.totalEarnings += amount
    } else {
      snapshot.totalDeductions += amount
    }
    snapshot.net = snapshot.totalEarnings - snapshot.totalDeductions
    existingCodes.add(code)
  }

  const encashmentsToApply =
    leaveEncashment > 0 && pendingEncashments.length > 0 ? pendingEncashments : []

  const loansToApply =
    (resolvedOverrides.LOAN ?? 0) > 0 ? loanInfo.pendingInstallments : []

  return {
    snapshot,
    pendingEncashments: encashmentsToApply,
    pendingLoanInstallments: loansToApply,
  }
}

async function markEncashmentsApplied(
  encashments: InstanceType<typeof LeaveEncashment>[],
  salaryId: Types.ObjectId,
): Promise<void> {
  if (encashments.length === 0) return
  await LeaveEncashment.updateMany(
    { _id: { $in: encashments.map((e) => e._id) }, status: 'pending' },
    { $set: { status: 'applied', salaryId } },
  )
}

async function revertEncashmentsForSalary(salaryId: Types.ObjectId): Promise<void> {
  await LeaveEncashment.updateMany(
    { salaryId, status: 'applied' },
    { $set: { status: 'pending' }, $unset: { salaryId: 1 } },
  )
}

export async function regeneratePendingForEmployee(
  companyId: string,
  employeeId: string,
  fromMonth: number,
  fromYear: number,
): Promise<number> {
  const user = await User.findOne({ _id: employeeId, companyId })
  if (!user) return 0

  const pending = await Salary.find({
    companyId,
    employeeId,
    status: 'pending',
  })

  let count = 0
  const fromKey = fromYear * 12 + fromMonth

  for (const doc of pending) {
    const key = doc.payPeriodYear * 12 + doc.payPeriodMonth
    if (key < fromKey) continue

    await revertEncashmentsForSalary(doc._id)
    await revertLoanInstallmentsForSalary(doc._id)

    const { snapshot, pendingEncashments, pendingLoanInstallments } =
      await buildEmployeePayroll({
        companyId,
        user,
        month: doc.payPeriodMonth,
        year: doc.payPeriodYear,
      })

    doc.earnings = snapshot.earnings
    doc.deductions = snapshot.deductions
    doc.lineItems = snapshot.lineItems
    doc.employerProvidentFund = snapshot.employerProvidentFund
    doc.totalEarnings = snapshot.totalEarnings
    doc.totalDeductions = snapshot.totalDeductions
    doc.net = snapshot.net
    await doc.save()

    await markEncashmentsApplied(pendingEncashments, doc._id)
    await markLoanInstallmentsApplied(pendingLoanInstallments, doc._id)
    count += 1
  }

  return count
}

function canReadCompanyPayroll(actor: SalaryActor): boolean {
  return (
    hasPermission(actor.role, 'salaries:read', actor.permissions) ||
    hasPermission(actor.role, 'salaries:write', actor.permissions)
  )
}

function canAccessOwnSalary(actor: SalaryActor): boolean {
  return hasPermission(actor.role, 'salaries:self', actor.permissions)
}

function assertCanAccessEmployee(actor: SalaryActor, employeeId: string): void {
  if (canReadCompanyPayroll(actor)) return
  if (canAccessOwnSalary(actor) && actor.id === employeeId) return
  throw new AppError('You do not have permission to view this salary data', 403, 'FORBIDDEN')
}

export async function listSalaries(query: ListSalariesQuery, actor: SalaryActor) {
  const { page, limit, skip } = parsePagination(query)
  const filter: Record<string, unknown> = { companyId: actor.companyId }

  if (!canReadCompanyPayroll(actor)) {
    if (!canAccessOwnSalary(actor)) {
      throw new AppError('You do not have permission to view salaries', 403, 'FORBIDDEN')
    }
    filter.employeeId = new Types.ObjectId(actor.id)
  } else if (query.employeeId) {
    filter.employeeId = new Types.ObjectId(query.employeeId)
  }

  if (query.status) filter.status = query.status
  if (query.department) {
    filter.department = new RegExp(`^${query.department}$`, 'i')
  }
  if (query.month) filter.payPeriodMonth = query.month
  if (query.year) filter.payPeriodYear = query.year

  if (query.period === 'this_month' || query.period === 'last_month') {
    const now = new Date()
    let month = now.getMonth() + 1
    let year = now.getFullYear()
    if (query.period === 'last_month') {
      month -= 1
      if (month < 1) {
        month = 12
        year -= 1
      }
    }
    filter.payPeriodMonth = month
    filter.payPeriodYear = year
  }

  const searchFilter = buildSearchFilter(query.search, [
    'employeeName',
    'employeeCode',
    'department',
  ])
  if (searchFilter) Object.assign(filter, searchFilter)

  const [docs, total] = await Promise.all([
    Salary.find(filter)
      .sort({ payPeriodYear: -1, payPeriodMonth: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Salary.countDocuments(filter),
  ])

  const result = buildPaginatedResult(docs.map(toDto), total, page, limit)
  return { salaries: result.items, pagination: result.pagination }
}

export async function getSalaryStats(
  actor: SalaryActor,
  query?: { month?: number; year?: number },
) {
  const now = new Date()
  const month = query?.month ?? now.getMonth() + 1
  const year = query?.year ?? now.getFullYear()

  const matchPeriod = {
    companyId: new Types.ObjectId(actor.companyId),
    payPeriodMonth: month,
    payPeriodYear: year,
  }

  const [byStatusRows, paidRows, byDepartmentRows] = await Promise.all([
    Salary.aggregate<{ _id: SalaryStatus | null; totalNet: number }>([
      { $match: matchPeriod },
      { $group: { _id: '$status', totalNet: { $sum: '$net' } } },
    ]),
    Salary.aggregate<{ totalNet: number }>([
      { $match: { ...matchPeriod, status: 'paid' } },
      { $group: { _id: null, totalNet: { $sum: '$net' } } },
    ]),
    Salary.aggregate<{ _id: string; total: number }>([
      { $match: matchPeriod },
      {
        $group: {
          _id: { $ifNull: ['$department', 'Unassigned'] },
          total: { $sum: '$net' },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 8 },
    ]),
  ])

  const byStatus = Object.fromEntries(
    byStatusRows.map((row) => [row._id ?? 'unknown', row.totalNet]),
  ) as Record<string, number>

  return {
    stats: {
      totalMonthlyPayroll: Object.values(byStatus).reduce((a, b) => a + b, 0),
      pendingPayroll: byStatus.pending ?? 0,
      paidThisMonth: paidRows[0]?.totalNet ?? 0,
      unpaidOnHold: byStatus.on_hold ?? 0,
      month,
      year,
      byDepartment: byDepartmentRows.map((row) => ({
        department: row._id || 'Unassigned',
        total: row.total,
      })),
    },
  }
}

export async function getSalaryById(id: string, actor: SalaryActor): Promise<SalaryDto> {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Salary record not found', 404, 'SALARY_NOT_FOUND')
  }

  const doc = await Salary.findOne({ _id: id, companyId: actor.companyId })
  if (!doc) {
    throw new AppError('Salary record not found', 404, 'SALARY_NOT_FOUND')
  }

  assertCanAccessEmployee(actor, doc.employeeId.toString())
  return toDto(doc)
}

export async function createSalary(
  payload: CreateSalaryInput,
  actor: SalaryActor,
): Promise<SalaryDto> {
  const user = await User.findOne({
    _id: payload.employeeId,
    companyId: actor.companyId,
  })
  if (!user) {
    throw new AppError('Employee not found', 404, 'EMPLOYEE_NOT_FOUND')
  }

  const employeeCode = await ensureEmployeeCode(user)

  const existing = await Salary.findOne({
    companyId: actor.companyId,
    employeeId: user._id,
    payPeriodMonth: payload.payPeriodMonth,
    payPeriodYear: payload.payPeriodYear,
  })
  if (existing) {
    throw new AppError(
      'A salary record already exists for this employee and period',
      409,
      'SALARY_DUPLICATE',
    )
  }

  const overrides = overridesFromEarningsDeductions(
    payload.earnings,
    payload.deductions,
    payload.lineItems,
  )

  const { snapshot, pendingEncashments, pendingLoanInstallments } =
    await buildEmployeePayroll({
      companyId: actor.companyId,
      user,
      month: payload.payPeriodMonth,
      year: payload.payPeriodYear,
      overrides,
    })

  const monthName = MONTH_NAMES[payload.payPeriodMonth - 1]
  const description =
    payload.description?.trim() ||
    `Monthly salary for ${monthName} ${payload.payPeriodYear}.`

  const doc = await Salary.create({
    companyId: actor.companyId,
    employeeId: user._id,
    employeeCode,
    employeeName: user.fullName,
    employeeEmail: user.email,
    employeePhone: user.phone,
    employeeCnic: user.cnic,
    employeeAvatar: user.avatar,
    department: user.department ?? 'general',
    designation: user.jobTitle ?? 'Employee',
    bankName: user.bankName,
    bankAccountNo: user.bankAccountNo,
    dateOfJoining: user.joinDate,
    payPeriodMonth: payload.payPeriodMonth,
    payPeriodYear: payload.payPeriodYear,
    status: payload.status,
    earnings: snapshot.earnings,
    deductions: snapshot.deductions,
    lineItems: snapshot.lineItems,
    employerProvidentFund: snapshot.employerProvidentFund,
    totalEarnings: snapshot.totalEarnings,
    totalDeductions: snapshot.totalDeductions,
    net: snapshot.net,
    description,
    activities: [
      {
        type: 'created',
        actorId: new Types.ObjectId(actor.id),
        actorName: actor.fullName,
        createdAt: new Date(),
      },
    ],
  })

  await markEncashmentsApplied(pendingEncashments, doc._id)
  await markLoanInstallmentsApplied(pendingLoanInstallments, doc._id)

  if (payload.status === 'paid') {
    await applyStatusSideEffects(doc, 'pending', 'paid', actor)
    pushActivity(doc, 'approved', actor, 'Marked as paid on create')
    await doc.save()
    await dispatchSalaryStatusEvent(doc, actor, 'paid')
  }

  if (payload.applyToEmployeeDefaults) {
    await applyDefaultsToEmployee(user, snapshot.earnings, snapshot.deductions)
  }

  return toDto(doc)
}

export async function generateMonthPayroll(
  payload: GenerateMonthInput,
  actor: SalaryActor,
): Promise<{ created: number; skipped: number; month: number; year: number }> {
  const now = new Date()
  const month = payload.month ?? now.getMonth() + 1
  const year = payload.year ?? now.getFullYear()
  const monthName = MONTH_NAMES[month - 1]

  await ensurePayrollSettings(actor.companyId)

  const employees = await User.find({
    companyId: actor.companyId,
    role: { $in: ['employee', 'manager', 'hr'] },
    status: 'active',
  })

  let created = 0
  let skipped = 0

  for (const user of employees) {
    const existing = await Salary.findOne({
      companyId: actor.companyId,
      employeeId: user._id,
      payPeriodMonth: month,
      payPeriodYear: year,
    }).select('_id')

    if (existing) {
      skipped += 1
      continue
    }

    const employeeCode = await ensureEmployeeCode(user)
    const { snapshot, pendingEncashments, pendingLoanInstallments } =
      await buildEmployeePayroll({
        companyId: actor.companyId,
        user,
        month,
        year,
      })

    const doc = await Salary.create({
      companyId: actor.companyId,
      employeeId: user._id,
      employeeCode,
      employeeName: user.fullName,
      employeeEmail: user.email,
      employeePhone: user.phone,
      employeeCnic: user.cnic,
      employeeAvatar: user.avatar,
      department: user.department ?? 'general',
      designation: user.jobTitle ?? 'Employee',
      bankName: user.bankName,
      bankAccountNo: user.bankAccountNo,
      dateOfJoining: user.joinDate,
      payPeriodMonth: month,
      payPeriodYear: year,
      status: 'pending',
      earnings: snapshot.earnings,
      deductions: snapshot.deductions,
      lineItems: snapshot.lineItems,
      employerProvidentFund: snapshot.employerProvidentFund,
      totalEarnings: snapshot.totalEarnings,
      totalDeductions: snapshot.totalDeductions,
      net: snapshot.net,
      description: `Monthly salary for ${monthName} ${year}.`,
      activities: [
        {
          type: 'created',
          actorId: new Types.ObjectId(actor.id),
          actorName: actor.fullName,
          note: 'Auto-generated monthly payroll',
          createdAt: new Date(),
        },
      ],
    })

    await markEncashmentsApplied(pendingEncashments, doc._id)
    await markLoanInstallmentsApplied(pendingLoanInstallments, doc._id)

    created += 1
  }

  return { created, skipped, month, year }
}

export async function updateSalary(
  id: string,
  payload: UpdateSalaryInput,
  actor: SalaryActor,
): Promise<SalaryDto> {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Salary record not found', 404, 'SALARY_NOT_FOUND')
  }

  const doc = await Salary.findOne({ _id: id, companyId: actor.companyId })
  if (!doc) {
    throw new AppError('Salary record not found', 404, 'SALARY_NOT_FOUND')
  }

  const previousStatus = doc.status
  const user = await User.findById(doc.employeeId)
  if (!user) {
    throw new AppError('Employee not found', 404, 'EMPLOYEE_NOT_FOUND')
  }

  if (payload.earnings || payload.deductions || payload.lineItems) {
    const baseOverrides = overridesFromEarningsDeductions(
      { ...doc.earnings, ...(payload.earnings ?? {}) },
      { ...doc.deductions, ...(payload.deductions ?? {}) },
      payload.lineItems ??
        doc.lineItems?.map((l) => ({ code: l.code, amount: l.amount })),
    )

    const { snapshot, pendingEncashments, pendingLoanInstallments } =
      await buildEmployeePayroll({
        companyId: actor.companyId,
        user,
        month: doc.payPeriodMonth,
        year: doc.payPeriodYear,
        overrides: baseOverrides,
      })

    doc.earnings = snapshot.earnings
    doc.deductions = snapshot.deductions
    doc.lineItems = snapshot.lineItems
    doc.employerProvidentFund = snapshot.employerProvidentFund
    doc.totalEarnings = snapshot.totalEarnings
    doc.totalDeductions = snapshot.totalDeductions
    doc.net = snapshot.net

    const encashmentOnSlip =
      snapshot.lineItems.find((l) => l.code === 'LEAVE_ENCASHMENT')?.amount ?? 0
    if (encashmentOnSlip <= 0) {
      await revertEncashmentsForSalary(doc._id)
    } else {
      await markEncashmentsApplied(pendingEncashments, doc._id)
    }

    const loanOnSlip = snapshot.lineItems.find((l) => l.code === 'LOAN')?.amount ?? 0
    if (loanOnSlip <= 0) {
      await revertLoanInstallmentsForSalary(doc._id)
    } else {
      await markLoanInstallmentsApplied(pendingLoanInstallments, doc._id)
    }
  }

  if (payload.description !== undefined) {
    doc.description = payload.description
  }

  pushActivity(doc, 'updated', actor)

  let statusChanged: SalaryStatus | null = null
  if (payload.status && payload.status !== doc.status) {
    doc.status = payload.status
    await applyStatusSideEffects(doc, previousStatus, payload.status, actor)
    pushActivity(doc, 'status_changed', actor, `Status set to ${payload.status}`)
    if (payload.status === 'paid') {
      pushActivity(doc, 'approved', actor)
    }
    statusChanged = payload.status
  }

  await doc.save()

  if (statusChanged) {
    await dispatchSalaryStatusEvent(doc, actor, statusChanged)
  }

  if (payload.applyToEmployeeDefaults) {
    await applyDefaultsToEmployee(user, doc.earnings, doc.deductions)
  }

  return toDto(doc)
}

export async function updateSalaryStatus(
  id: string,
  payload: UpdateSalaryStatusInput,
  actor: SalaryActor,
): Promise<SalaryDto> {
  return updateSalary(id, { status: payload.status }, actor)
}

export async function bulkUpdateSalaryStatus(
  payload: BulkSalaryStatusInput,
  actor: SalaryActor,
): Promise<{ updated: number }> {
  const objectIds = payload.ids
    .filter((id) => Types.ObjectId.isValid(id))
    .map((id) => new Types.ObjectId(id))

  if (objectIds.length === 0) {
    throw new AppError('No valid salary records selected', 400, 'INVALID_IDS')
  }

  const docs = await Salary.find({
    _id: { $in: objectIds },
    companyId: actor.companyId,
  })

  let updated = 0
  for (const doc of docs) {
    if (doc.status === payload.status) continue
    const previousStatus = doc.status
    doc.status = payload.status
    await applyStatusSideEffects(doc, previousStatus, payload.status, actor)
    pushActivity(doc, 'status_changed', actor, `Bulk status set to ${payload.status}`)
    if (payload.status === 'paid') {
      pushActivity(doc, 'approved', actor)
    }
    await doc.save()
    await dispatchSalaryStatusEvent(doc, actor, payload.status)
    updated += 1
  }

  return { updated }
}

export async function deleteSalary(id: string, actor: SalaryActor): Promise<void> {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Salary record not found', 404, 'SALARY_NOT_FOUND')
  }

  const doc = await Salary.findOne({ _id: id, companyId: actor.companyId })
  if (!doc) {
    throw new AppError('Salary record not found', 404, 'SALARY_NOT_FOUND')
  }

  if (doc.status === 'paid') {
    await reversePfContributionFromSalary(doc)
  }

  await revertEncashmentsForSalary(doc._id)
  await revertLoanInstallmentsForSalary(doc._id)
  await doc.deleteOne()
}

export async function getEmployeeDefaults(
  employeeId: string,
  actor: SalaryActor,
): Promise<{
  employeeId: string
  employeeCode: string
  employeeName: string
  earnings: SalaryEarnings
  deductions: SalaryDeductions
  lineItems: SalaryLineItem[]
  employerProvidentFund: number
}> {
  const user = await User.findOne({ _id: employeeId, companyId: actor.companyId })
  if (!user) {
    throw new AppError('Employee not found', 404, 'EMPLOYEE_NOT_FOUND')
  }

  const employeeCode = await ensureEmployeeCode(user)
  const now = new Date()
  const { snapshot } = await buildEmployeePayroll({
    companyId: actor.companyId,
    user,
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  })

  return {
    employeeId: user._id.toString(),
    employeeCode,
    employeeName: user.fullName,
    earnings: snapshot.earnings,
    deductions: snapshot.deductions,
    lineItems: snapshot.lineItems,
    employerProvidentFund: snapshot.employerProvidentFund,
  }
}

export async function getEmployeePfAccount(employeeId: string, actor: SalaryActor) {
  assertCanAccessEmployee(actor, employeeId)
  const user = await User.findOne({ _id: employeeId, companyId: actor.companyId })
  if (!user) {
    throw new AppError('Employee not found', 404, 'EMPLOYEE_NOT_FOUND')
  }
  const result = await getEmployeePfBalance(actor.companyId, employeeId)
  return {
    employeeId,
    balance: result.balance,
    entries: result.entries.map((e) => ({
      id: e._id.toString(),
      year: e.year,
      month: e.month,
      employeeAmount: e.employeeAmount,
      employerAmount: e.employerAmount,
      type: e.type,
      note: e.note,
      createdAt: e.createdAt.toISOString(),
    })),
  }
}

export async function downloadSalarySlip(
  id: string,
  actor: SalaryActor,
): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Salary record not found', 404, 'SALARY_NOT_FOUND')
  }

  const doc = await Salary.findOne({ _id: id, companyId: actor.companyId })
  if (!doc) {
    throw new AppError('Salary record not found', 404, 'SALARY_NOT_FOUND')
  }

  assertCanAccessEmployee(actor, doc.employeeId.toString())

  const company = await Company.findById(actor.companyId)
  if (!company) {
    throw new AppError('Company not found', 404, 'COMPANY_NOT_FOUND')
  }

  const monthName = MONTH_NAMES[doc.payPeriodMonth - 1] ?? String(doc.payPeriodMonth)
  const lineItems =
    doc.lineItems?.length > 0
      ? doc.lineItems
      : lineItemsFromLegacy(doc.earnings, doc.deductions)

  const buffer = await buildSalarySlipPdf({
    companyName: company.name,
    companyAddress: [company.addressLine, company.city, company.country]
      .filter(Boolean)
      .join(', '),
    companyWebsite: company.email,
    currency: company.currency,
    payPeriodMonth: monthName,
    payPeriodYear: String(doc.payPeriodYear),
    employeeName: doc.employeeName,
    employeeCode: doc.employeeCode,
    department: formatDepartment(doc.department),
    designation: doc.designation,
    employeeEmail: doc.employeeEmail ?? '—',
    employeeNic: doc.employeeCnic ?? '—',
    employeeContact: doc.employeePhone ?? '—',
    bankName: doc.bankName ?? '—',
    bankAccountNo: doc.bankAccountNo ?? '—',
    dateOfJoining: doc.dateOfJoining
      ? doc.dateOfJoining.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '—',
    earnings: doc.earnings,
    deductions: doc.deductions,
    lineItems: lineItems.map((l) => ({
      name: l.name,
      kind: l.kind,
      amount: l.amount,
    })),
    employerProvidentFund: doc.employerProvidentFund ?? 0,
    totalEarnings: doc.totalEarnings,
    totalDeductions: doc.totalDeductions,
    disbursement: doc.net,
  })

  const safeName = doc.employeeName.replace(/\s+/g, '_')
  return {
    buffer,
    filename: `SalarySlip_${safeName}_${monthName}-${doc.payPeriodYear}.pdf`,
    contentType: 'application/pdf',
  }
}
