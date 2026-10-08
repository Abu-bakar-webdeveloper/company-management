import { Types } from 'mongoose'
import { AppError } from '../../utils/AppError.js'
import { User } from '../auth/user.model.js'
import {
  CompensationEvent,
  type CompensationAllowances,
  type CompensationEventType,
  type ICompensationEvent,
} from './compensation-event.model.js'
import {
  getIncrementEligibility,
  isPeriodInRange,
  type EmploymentStage,
  type IncrementEligibility,
} from './compensation-utils.js'
import { ensurePayrollSettings } from './payroll-settings.service.js'
import { PayrollAssignment, type IPayrollAssignment } from './payroll-assignment.model.js'
import {
  EmployeeLoan,
  type IEmployeeLoan,
} from './employee-loan.model.js'
import { buildLoanSchedule } from './compensation-utils.js'

export type PackageSnapshot = {
  basic: number
  allowances: CompensationAllowances
  source: 'event' | 'user'
  eventId?: string
  effectiveFrom?: string
}

function allowancesFromUser(user: InstanceType<typeof User>): CompensationAllowances {
  return {
    HRA: user.hra ?? 0,
    UTILITY: user.utilityAllowance ?? 0,
    CONVEYANCE: user.conveyanceAllowance ?? 0,
  }
}

function applyPackageToUserCache(
  user: InstanceType<typeof User>,
  basic: number,
  allowances: CompensationAllowances,
): void {
  user.basicSalary = basic
  if (allowances.HRA !== undefined) user.hra = allowances.HRA
  if (allowances.UTILITY !== undefined) user.utilityAllowance = allowances.UTILITY
  if (allowances.CONVEYANCE !== undefined) {
    user.conveyanceAllowance = allowances.CONVEYANCE
  }
}

export async function ensureInitialCompensationEvent(
  companyId: string,
  user: InstanceType<typeof User>,
): Promise<ICompensationEvent | null> {
  const existing = await CompensationEvent.findOne({
    companyId,
    employeeId: user._id,
  })
    .sort({ effectiveFrom: 1 })
    .select('_id')

  if (existing) return null

  const effectiveFrom = user.joinDate ?? new Date()
  return CompensationEvent.create({
    companyId,
    employeeId: user._id,
    effectiveFrom,
    type: 'initial',
    basic: user.basicSalary ?? 0,
    allowances: allowancesFromUser(user),
    reason: 'Backfilled from employee profile',
  })
}

export async function resolvePackageAsOf(params: {
  companyId: string
  user: InstanceType<typeof User>
  asOf: Date
}): Promise<PackageSnapshot> {
  const { companyId, user, asOf } = params
  await ensureInitialCompensationEvent(companyId, user)

  const event = await CompensationEvent.findOne({
    companyId,
    employeeId: user._id,
    effectiveFrom: { $lte: asOf },
  }).sort({ effectiveFrom: -1 })

  if (!event) {
    return {
      basic: user.basicSalary ?? 0,
      allowances: allowancesFromUser(user),
      source: 'user',
    }
  }

  return {
    basic: event.basic,
    allowances: { ...event.allowances },
    source: 'event',
    eventId: event._id.toString(),
    effectiveFrom: event.effectiveFrom.toISOString().slice(0, 10),
  }
}

export type CompensationEventDto = {
  id: string
  effectiveFrom: string
  type: CompensationEventType
  basic: number
  allowances: CompensationAllowances
  reason?: string
  createdAt: string
}

function toEventDto(doc: ICompensationEvent): CompensationEventDto {
  return {
    id: doc._id.toString(),
    effectiveFrom: doc.effectiveFrom.toISOString().slice(0, 10),
    type: doc.type,
    basic: doc.basic,
    allowances: { ...doc.allowances },
    reason: doc.reason,
    createdAt: doc.createdAt.toISOString(),
  }
}

export type EmployeeCompensationSummary = {
  employeeId: string
  employmentStage: EmploymentStage
  probationEndDate?: string
  confirmationDate?: string
  lastIncrementAt?: string
  currentPackage: PackageSnapshot
  eligibility: IncrementEligibility
  history: CompensationEventDto[]
}

export async function getEmployeeCompensation(
  companyId: string,
  employeeId: string,
): Promise<EmployeeCompensationSummary> {
  const user = await User.findOne({ _id: employeeId, companyId })
  if (!user) throw new AppError('Employee not found', 404, 'EMPLOYEE_NOT_FOUND')

  const settings = await ensurePayrollSettings(companyId)
  await ensureInitialCompensationEvent(companyId, user)

  const asOf = new Date()
  const currentPackage = await resolvePackageAsOf({ companyId, user, asOf })
  const stage = (user.employmentStage ?? 'probation') as EmploymentStage
  const eligibility = getIncrementEligibility({
    stage,
    joinDate: user.joinDate,
    confirmationDate: user.confirmationDate,
    lastIncrementAt: user.lastIncrementAt,
    probationEndDate: user.probationEndDate,
    policy: settings.incrementPolicy,
    asOf,
  })

  const history = await CompensationEvent.find({ companyId, employeeId: user._id })
    .sort({ effectiveFrom: -1 })
    .limit(50)

  return {
    employeeId,
    employmentStage: stage,
    probationEndDate: user.probationEndDate
      ? user.probationEndDate.toISOString().slice(0, 10)
      : undefined,
    confirmationDate: user.confirmationDate
      ? user.confirmationDate.toISOString().slice(0, 10)
      : undefined,
    lastIncrementAt: user.lastIncrementAt
      ? user.lastIncrementAt.toISOString().slice(0, 10)
      : undefined,
    currentPackage,
    eligibility,
    history: history.map(toEventDto),
  }
}

export type CreateCompensationEventInput = {
  effectiveFrom: Date
  type: CompensationEventType
  basic: number
  allowances?: CompensationAllowances
  reason?: string
  setPermanent?: boolean
  regeneratePending?: boolean
}

export async function createCompensationEvent(
  companyId: string,
  employeeId: string,
  input: CreateCompensationEventInput,
  actorId: string,
): Promise<{
  event: CompensationEventDto
  shouldRegenerateFrom: { month: number; year: number } | null
}> {
  const user = await User.findOne({ _id: employeeId, companyId })
  if (!user) throw new AppError('Employee not found', 404, 'EMPLOYEE_NOT_FOUND')

  await ensureInitialCompensationEvent(companyId, user)

  const allowances: CompensationAllowances = {
    HRA: input.allowances?.HRA ?? user.hra ?? 0,
    UTILITY: input.allowances?.UTILITY ?? user.utilityAllowance ?? 0,
    CONVEYANCE: input.allowances?.CONVEYANCE ?? user.conveyanceAllowance ?? 0,
    ...input.allowances,
  }

  const event = await CompensationEvent.create({
    companyId,
    employeeId: user._id,
    effectiveFrom: input.effectiveFrom,
    type: input.type,
    basic: input.basic,
    allowances,
    reason: input.reason,
    actorId: new Types.ObjectId(actorId),
  })

  const now = new Date()
  if (input.effectiveFrom <= now) {
    applyPackageToUserCache(user, input.basic, allowances)
  }

  if (input.setPermanent || input.type === 'confirmation') {
    user.employmentStage = 'permanent'
    user.confirmationDate = user.confirmationDate ?? input.effectiveFrom
  }

  if (input.type === 'increment') {
    user.lastIncrementAt = input.effectiveFrom
  }

  await user.save()

  const shouldRegenerateFrom = input.regeneratePending
    ? {
        month: input.effectiveFrom.getUTCMonth() + 1,
        year: input.effectiveFrom.getUTCFullYear(),
      }
    : null

  return { event: toEventDto(event), shouldRegenerateFrom }
}

// ——— Assignments ———

export type AssignmentDto = {
  id: string
  componentCode: string
  kind: 'earning' | 'deduction'
  amount: number
  startMonth: number
  startYear: number
  endMonth?: number | null
  endYear?: number | null
  note?: string
  active: boolean
  source: string
}

function toAssignmentDto(doc: IPayrollAssignment): AssignmentDto {
  return {
    id: doc._id.toString(),
    componentCode: doc.componentCode,
    kind: doc.kind,
    amount: doc.amount,
    startMonth: doc.startMonth,
    startYear: doc.startYear,
    endMonth: doc.endMonth,
    endYear: doc.endYear,
    note: doc.note,
    active: doc.active,
    source: doc.source,
  }
}

export async function listAssignments(
  companyId: string,
  employeeId: string,
): Promise<AssignmentDto[]> {
  const docs = await PayrollAssignment.find({ companyId, employeeId }).sort({
    startYear: -1,
    startMonth: -1,
  })
  return docs.map(toAssignmentDto)
}

export type CreateAssignmentInput = {
  componentCode: string
  kind: 'earning' | 'deduction'
  amount: number
  startMonth: number
  startYear: number
  endMonth?: number | null
  endYear?: number | null
  note?: string
}

export async function createAssignment(
  companyId: string,
  employeeId: string,
  input: CreateAssignmentInput,
): Promise<AssignmentDto> {
  const user = await User.findOne({ _id: employeeId, companyId }).select('_id')
  if (!user) throw new AppError('Employee not found', 404, 'EMPLOYEE_NOT_FOUND')

  const code = input.componentCode.trim().toUpperCase()
  if (['BASIC', 'PF', 'LEAVE', 'LEAVE_ENCASHMENT'].includes(code)) {
    throw new AppError(
      'Use Change package or system payroll for this component',
      400,
      'INVALID_ASSIGNMENT_CODE',
    )
  }

  const doc = await PayrollAssignment.create({
    companyId,
    employeeId,
    componentCode: code,
    kind: input.kind,
    amount: input.amount,
    startMonth: input.startMonth,
    startYear: input.startYear,
    endMonth: input.endMonth ?? null,
    endYear: input.endYear ?? null,
    note: input.note,
    active: true,
    source: 'manual',
  })

  return toAssignmentDto(doc)
}

export async function updateAssignment(
  companyId: string,
  assignmentId: string,
  input: Partial<CreateAssignmentInput> & { active?: boolean },
): Promise<AssignmentDto> {
  const doc = await PayrollAssignment.findOne({ _id: assignmentId, companyId })
  if (!doc) throw new AppError('Assignment not found', 404, 'ASSIGNMENT_NOT_FOUND')

  if (input.amount !== undefined) doc.amount = input.amount
  if (input.startMonth !== undefined) doc.startMonth = input.startMonth
  if (input.startYear !== undefined) doc.startYear = input.startYear
  if (input.endMonth !== undefined) doc.endMonth = input.endMonth
  if (input.endYear !== undefined) doc.endYear = input.endYear
  if (input.note !== undefined) doc.note = input.note
  if (input.active !== undefined) doc.active = input.active
  if (input.kind !== undefined) doc.kind = input.kind
  if (input.componentCode !== undefined) {
    doc.componentCode = input.componentCode.trim().toUpperCase()
  }

  await doc.save()
  return toAssignmentDto(doc)
}

export async function deleteAssignment(
  companyId: string,
  assignmentId: string,
): Promise<void> {
  const doc = await PayrollAssignment.findOne({ _id: assignmentId, companyId })
  if (!doc) throw new AppError('Assignment not found', 404, 'ASSIGNMENT_NOT_FOUND')
  await doc.deleteOne()
}

export async function getActiveAssignmentsForPeriod(params: {
  companyId: string
  employeeId: string
  month: number
  year: number
}): Promise<IPayrollAssignment[]> {
  const docs = await PayrollAssignment.find({
    companyId: params.companyId,
    employeeId: params.employeeId,
    active: true,
    source: 'manual',
  })

  return docs.filter((d) =>
    isPeriodInRange(
      params.year,
      params.month,
      d.startYear,
      d.startMonth,
      d.endYear,
      d.endMonth,
    ),
  )
}

// ——— Loans ———

export type LoanDto = {
  id: string
  principal: number
  issuedOn: string
  installmentAmount: number
  startMonth: number
  startYear: number
  endMonth: number
  endYear: number
  remainingBalance: number
  status: string
  issueInPayroll: boolean
  note?: string
  schedule: {
    month: number
    year: number
    amount: number
    status: string
    salaryId?: string
  }[]
}

function toLoanDto(doc: IEmployeeLoan): LoanDto {
  return {
    id: doc._id.toString(),
    principal: doc.principal,
    issuedOn: doc.issuedOn.toISOString().slice(0, 10),
    installmentAmount: doc.installmentAmount,
    startMonth: doc.startMonth,
    startYear: doc.startYear,
    endMonth: doc.endMonth,
    endYear: doc.endYear,
    remainingBalance: doc.remainingBalance,
    status: doc.status,
    issueInPayroll: doc.issueInPayroll,
    note: doc.note,
    schedule: doc.schedule.map((s) => ({
      month: s.month,
      year: s.year,
      amount: s.amount,
      status: s.status,
      salaryId: s.salaryId?.toString(),
    })),
  }
}

export async function listLoans(
  companyId: string,
  employeeId: string,
): Promise<LoanDto[]> {
  const docs = await EmployeeLoan.find({ companyId, employeeId }).sort({ createdAt: -1 })
  return docs.map(toLoanDto)
}

export type CreateLoanInput = {
  principal: number
  installmentAmount: number
  startMonth: number
  startYear: number
  issuedOn?: Date
  issueInPayroll?: boolean
  note?: string
}

export async function createLoan(
  companyId: string,
  employeeId: string,
  input: CreateLoanInput,
): Promise<LoanDto> {
  const user = await User.findOne({ _id: employeeId, companyId }).select('_id')
  if (!user) throw new AppError('Employee not found', 404, 'EMPLOYEE_NOT_FOUND')

  if (input.principal <= 0 || input.installmentAmount <= 0) {
    throw new AppError('Principal and installment must be positive', 400, 'INVALID_LOAN')
  }

  const { schedule, endMonth, endYear } = buildLoanSchedule({
    principal: input.principal,
    installmentAmount: input.installmentAmount,
    startMonth: input.startMonth,
    startYear: input.startYear,
  })

  const doc = await EmployeeLoan.create({
    companyId,
    employeeId,
    principal: input.principal,
    issuedOn: input.issuedOn ?? new Date(),
    installmentAmount: input.installmentAmount,
    startMonth: input.startMonth,
    startYear: input.startYear,
    endMonth,
    endYear,
    remainingBalance: input.principal,
    status: 'active',
    issueInPayroll: input.issueInPayroll ?? false,
    schedule,
    note: input.note,
  })

  return toLoanDto(doc)
}

export async function cancelLoan(companyId: string, loanId: string): Promise<LoanDto> {
  const doc = await EmployeeLoan.findOne({ _id: loanId, companyId })
  if (!doc) throw new AppError('Loan not found', 404, 'LOAN_NOT_FOUND')
  doc.status = 'cancelled'
  for (const row of doc.schedule) {
    if (row.status === 'pending') row.status = 'skipped'
  }
  doc.markModified('schedule')
  await doc.save()
  return toLoanDto(doc)
}

export async function getLoanAmountsForPeriod(params: {
  companyId: string
  employeeId: string
  month: number
  year: number
}): Promise<{
  loanDeduction: number
  loanIssued: number
  pendingInstallments: { loanId: Types.ObjectId; index: number; amount: number }[]
}> {
  const loans = await EmployeeLoan.find({
    companyId: params.companyId,
    employeeId: params.employeeId,
    status: 'active',
  })

  let loanDeduction = 0
  let loanIssued = 0
  const pendingInstallments: {
    loanId: Types.ObjectId
    index: number
    amount: number
  }[] = []

  for (const loan of loans) {
    if (
      loan.issueInPayroll &&
      loan.startMonth === params.month &&
      loan.startYear === params.year
    ) {
      const anyApplied = loan.schedule.some((s) => s.status === 'applied')
      if (!anyApplied) {
        loanIssued += loan.principal
      }
    }

    loan.schedule.forEach((row, index) => {
      if (
        row.month === params.month &&
        row.year === params.year &&
        row.status === 'pending'
      ) {
        loanDeduction += row.amount
        pendingInstallments.push({
          loanId: loan._id,
          index,
          amount: row.amount,
        })
      }
    })
  }

  return {
    loanDeduction: Math.round(loanDeduction * 100) / 100,
    loanIssued: Math.round(loanIssued * 100) / 100,
    pendingInstallments,
  }
}

export async function markLoanInstallmentsApplied(
  pending: { loanId: Types.ObjectId; index: number; amount: number }[],
  salaryId: Types.ObjectId,
): Promise<void> {
  for (const item of pending) {
    const loan = await EmployeeLoan.findById(item.loanId)
    if (!loan) continue
    const row = loan.schedule[item.index]
    if (!row || row.status !== 'pending') continue
    row.status = 'applied'
    row.salaryId = salaryId
    loan.remainingBalance = Math.max(
      0,
      Math.round((loan.remainingBalance - row.amount) * 100) / 100,
    )
    if (loan.remainingBalance <= 0) {
      loan.status = 'paid_off'
      loan.remainingBalance = 0
    }
    loan.markModified('schedule')
    await loan.save()
  }
}

export async function revertLoanInstallmentsForSalary(
  salaryId: Types.ObjectId,
): Promise<void> {
  const loans = await EmployeeLoan.find({
    'schedule.salaryId': salaryId,
  })

  for (const loan of loans) {
    let changed = false
    for (const row of loan.schedule) {
      if (row.salaryId?.equals(salaryId) && row.status === 'applied') {
        row.status = 'pending'
        row.salaryId = undefined
        loan.remainingBalance =
          Math.round((loan.remainingBalance + row.amount) * 100) / 100
        if (loan.status === 'paid_off') loan.status = 'active'
        changed = true
      }
    }
    if (changed) {
      loan.markModified('schedule')
      await loan.save()
    }
  }
}

export async function listIncrementDueEmployees(
  companyId: string,
): Promise<
  {
    employeeId: string
    employeeName: string
    message: string
    stage: EmploymentStage
    kind: 'probation_review' | 'increment_cycle'
    nextEligibleOn: string | null
  }[]
> {
  const settings = await ensurePayrollSettings(companyId)
  const users = await User.find({
    companyId,
    role: { $in: ['employee', 'manager', 'hr'] },
    status: 'active',
  }).select(
    'fullName employmentStage joinDate confirmationDate lastIncrementAt probationEndDate',
  )

  const due: {
    employeeId: string
    employeeName: string
    message: string
    stage: EmploymentStage
    kind: 'probation_review' | 'increment_cycle'
    nextEligibleOn: string | null
  }[] = []

  for (const user of users) {
    const stage = (user.employmentStage ?? 'probation') as EmploymentStage
    const eligibility = getIncrementEligibility({
      stage,
      joinDate: user.joinDate,
      confirmationDate: user.confirmationDate,
      lastIncrementAt: user.lastIncrementAt,
      probationEndDate: user.probationEndDate,
      policy: settings.incrementPolicy,
    })
    if (eligibility.due) {
      due.push({
        employeeId: user._id.toString(),
        employeeName: user.fullName,
        message: eligibility.message,
        stage,
        kind: stage === 'probation' ? 'probation_review' : 'increment_cycle',
        nextEligibleOn: eligibility.nextEligibleOn,
      })
    }
  }
  return due
}
