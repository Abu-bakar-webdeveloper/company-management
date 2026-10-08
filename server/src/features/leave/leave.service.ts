import { Types } from 'mongoose'
import { AppError } from '../../utils/AppError.js'
import {
  buildPaginatedResult,
  parsePagination,
} from '../../utils/pagination.js'
import type { UserRole } from '../auth/auth.types.js'
import { hasPermission, type Permission } from '../auth/permissions.js'
import { User } from '../auth/user.model.js'
import { dispatchDomainEventSafe } from '../notifications/notification.service.js'
import {
  balanceDaysInYear,
  durationDaysInYear,
  inclusiveUtcDays,
  utcDayMs,
  yearBoundsUtc,
} from './leave-dates.js'
import { LeaveEncashment } from './leave-encashment.model.js'
import { LeaveRequest, type ILeaveRequest } from './leave-request.model.js'
import { LeaveType, type ILeaveType, type LeaveTypeIcon } from './leave-type.model.js'
import type {
  CreateLeaveRequestInput,
  CreateLeaveTypeInput,
  LeaveEncashmentInput,
  ListLeaveRequestsQuery,
  UpdateLeaveRequestStatusInput,
  UpdateLeaveTypeInput,
} from './leave.validation.js'

export type LeaveActor = {
  id: string
  companyId: string
  role: UserRole
  permissions: Permission[]
  canManage: boolean
  canApprove: boolean
  canRequest: boolean
}

export type LeaveTypeDto = {
  id: string
  name: string
  maxDays: number | 'unlimited'
  description: string
  icon: LeaveTypeIcon
  carryForward: boolean
  paidLeave: boolean
  status: 'active' | 'inactive'
}

export type LeaveRequestDto = {
  id: string
  requestId: string
  employeeId: string
  employeeName: string
  department: string
  avatar?: string
  leaveTypeId: string
  leaveTypeName: string
  reason: string
  startDate: string
  endDate: string
  durationDays: number
  balanceDaysUsed: number
  excessDays: number
  excessDisposition: 'none' | 'unpaid_deduct' | 'waived' | 'rejected_excess'
  status: 'pending' | 'approved' | 'rejected'
  /** True when still pending and leave end date is before today (UTC). */
  isOverdue: boolean
  appliedDate: string
  adminComment?: string
  totalLeavesTaken?: number
  remainingBalance?: number
  /** Present on detail fetch — company policy for handling excess leave. */
  excessLeaveMode?: 'reject' | 'deduct_from_salary' | 'admin_can_waive'
}

export type LeaveStatsDto = {
  total: number
  /** Pending requests whose end date is still today or in the future. */
  pending: number
  /** Pending requests whose end date is already in the past. */
  overdue: number
  approved: number
  rejected: number
  currentlyOnLeave: number
}

export type LeaveRecordDto = {
  id: string
  type: string
  typeColor: string
  dates: string
  duration: string
  reason: string
  status: 'approved' | 'pending' | 'rejected'
}

export type LeaveTypeBalanceDto = {
  leaveTypeId: string
  name: string
  icon: LeaveTypeIcon
  maxDays: number | 'unlimited'
  /** Annual entitlement including carry-in; null when unlimited. */
  entitlement: number | null
  carryIn: number
  used: number
  pending: number
  /** Days still available (entitlement − used); null when unlimited. */
  remaining: number | null
  /** Days still free to request (entitlement − used − pending); null when unlimited. */
  available: number | null
  carryForward: boolean
  paidLeave: boolean
}

export type EmployeeLeaveSummaryDto = {
  year: number
  yearlyTaken: number
  remainingBalance: number
  pendingRequests: number
  totalTaken: number
  balances: LeaveTypeBalanceDto[]
  history: LeaveRecordDto[]
}

const LEAVE_TYPE_COLORS: Record<LeaveTypeIcon, string> = {
  sick: '#dc2626',
  casual: '#1877f2',
  annual: '#7c3aed',
  unpaid: '#64748b',
}

function assertCompanyContext(acting: LeaveActor): void {
  if (!acting.companyId) {
    throw new AppError('Company context required', 403, 'FORBIDDEN')
  }
}

function toDateString(value: Date): string {
  return value.toISOString().slice(0, 10)
}

/** Start of today in UTC (leave dates are stored as UTC midnights). */
function startOfTodayUtc(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

export function isLeaveRequestOverdue(
  status: 'pending' | 'approved' | 'rejected',
  endDate: Date,
  today: Date = startOfTodayUtc(),
): boolean {
  return status === 'pending' && utcDayMs(endDate) < utcDayMs(today)
}

function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
  if (start === end) {
    return startDate.toLocaleDateString('en-US', opts)
  }
  return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${endDate.toLocaleDateString('en-US', opts)}`
}

export function computeDurationDays(startDate: Date, endDate: Date): number {
  return inclusiveUtcDays(startDate, endDate)
}

function inferIcon(name: string): LeaveTypeIcon {
  const lower = name.toLowerCase()
  if (lower.includes('sick')) return 'sick'
  if (lower.includes('casual')) return 'casual'
  if (lower.includes('annual')) return 'annual'
  if (lower.includes('unpaid')) return 'unpaid'
  return 'casual'
}

function resolveMaxDays(input: { maxDays?: number | null; unlimited?: boolean }): number | null {
  if (input.unlimited) return null
  if (input.maxDays === null) return null
  return input.maxDays ?? 0
}

function toLeaveTypeDto(doc: ILeaveType): LeaveTypeDto {
  return {
    id: doc._id.toString(),
    name: doc.name,
    maxDays: doc.maxDays === null ? 'unlimited' : doc.maxDays,
    description: doc.description,
    icon: doc.icon,
    carryForward: doc.carryForward,
    paidLeave: doc.paidLeave,
    status: doc.status,
  }
}

async function getDirectReportIds(managerId: string, companyId: string): Promise<string[]> {
  const reports = await User.find({
    companyId,
    managerId: new Types.ObjectId(managerId),
  }).select('_id')

  return reports.map((user) => user._id.toString())
}

async function resolveScopedEmployeeIds(
  acting: LeaveActor,
  scope?: 'mine' | 'team' | 'company',
): Promise<string[] | 'all'> {
  if (acting.canManage || acting.role === 'admin' || acting.role === 'hr') {
    if (scope === 'mine') return [acting.id]
    return 'all'
  }

  if (acting.canApprove && acting.role === 'manager') {
    if (scope === 'mine') return [acting.id]
    const reportIds = await getDirectReportIds(acting.id, acting.companyId)
    return [acting.id, ...reportIds]
  }

  return [acting.id]
}

async function canAccessEmployee(acting: LeaveActor, employeeId: string): Promise<boolean> {
  const scoped = await resolveScopedEmployeeIds(acting)
  if (scoped === 'all') return true
  return scoped.includes(employeeId)
}

async function canApproveForEmployee(acting: LeaveActor, employeeId: string): Promise<boolean> {
  if (employeeId === acting.id) return false
  if (!acting.canApprove && !acting.canManage) return false
  if (acting.canManage || acting.role === 'admin' || acting.role === 'hr') return true

  if (acting.role === 'manager') {
    const user = await User.findById(employeeId)
    return user?.managerId?.toString() === acting.id
  }

  return false
}

function getYearBounds(year: number): { start: Date; end: Date } {
  return yearBoundsUtc(year)
}

async function getUsedDays(
  employeeId: string,
  leaveTypeId: string,
  year: number,
  status: 'approved' | 'pending' = 'approved',
): Promise<number> {
  const { start, end } = getYearBounds(year)
  const requests = await LeaveRequest.find({
    employeeId: new Types.ObjectId(employeeId),
    leaveTypeId: new Types.ObjectId(leaveTypeId),
    status,
    startDate: { $lte: end },
    endDate: { $gte: start },
  })

  return requests.reduce((sum, req) => {
    const balancePortion =
      req.balanceDaysUsed > 0 || req.excessDays > 0
        ? req.balanceDaysUsed
        : req.durationDays
    return sum + balanceDaysInYear(req.startDate, req.endDate, balancePortion, year)
  }, 0)
}

async function getTotalApprovedDays(employeeId: string, year: number): Promise<number> {
  const { start, end } = getYearBounds(year)
  const requests = await LeaveRequest.find({
    employeeId: new Types.ObjectId(employeeId),
    status: 'approved',
    startDate: { $lte: end },
    endDate: { $gte: start },
  })

  return requests.reduce(
    (sum, req) => sum + durationDaysInYear(req.startDate, req.endDate, year),
    0,
  )
}

/** Unused days carried from prior years for carry-forward leave types.
 * Only years on/after the employee’s hire year count — no fictional pre-hire balance.
 */
async function getCarryInDays(
  employeeId: string,
  leaveType: ILeaveType,
  year: number,
  hireYear: number,
  depth = 0,
): Promise<number> {
  if (!leaveType.carryForward || leaveType.maxDays === null || year < 2000 || depth > 40) {
    return 0
  }

  const prevYear = year - 1
  // Employee was not employed in prevYear → nothing to carry into `year`
  if (prevYear < hireYear) {
    return 0
  }

  const prevCarryIn = await getCarryInDays(
    employeeId,
    leaveType,
    prevYear,
    hireYear,
    depth + 1,
  )
  const prevEntitlement = leaveType.maxDays + prevCarryIn
  const prevUsed = await getUsedDays(
    employeeId,
    leaveType._id.toString(),
    prevYear,
    'approved',
  )
  return Math.max(0, prevEntitlement - prevUsed)
}

async function resolveHireYear(employeeId: string, fallbackYear: number): Promise<number> {
  const user = await User.findById(employeeId).select('joinDate')
  if (user?.joinDate) {
    return user.joinDate.getUTCFullYear()
  }
  // Prefer not inventing decades of history when join date is missing
  return fallbackYear
}

async function getEntitlementDays(
  employeeId: string,
  leaveType: ILeaveType,
  year: number,
  hireYear?: number,
): Promise<number | null> {
  if (leaveType.maxDays === null) return null
  const resolvedHireYear = hireYear ?? (await resolveHireYear(employeeId, year))
  // No entitlement for years before hire
  if (year < resolvedHireYear) return 0
  const carryIn = await getCarryInDays(employeeId, leaveType, year, resolvedHireYear)
  return leaveType.maxDays + carryIn
}

async function getRemainingBalance(
  employeeId: string,
  leaveTypeId: string,
): Promise<number | null> {
  const leaveType = await LeaveType.findById(leaveTypeId)
  if (!leaveType || leaveType.maxDays === null) return null

  const year = new Date().getUTCFullYear()
  const hireYear = await resolveHireYear(employeeId, year)
  const entitlement = await getEntitlementDays(employeeId, leaveType, year, hireYear)
  if (entitlement === null) return null
  const used = await getUsedDays(employeeId, leaveTypeId, year, 'approved')
  return Math.max(0, entitlement - used)
}

async function nextRequestCode(companyId: string): Promise<string> {
  const latest = await LeaveRequest.findOne({ companyId })
    .sort({ createdAt: -1 })
    .select('requestCode')

  if (!latest?.requestCode) return 'LR-001'

  const match = latest.requestCode.match(/LR-(\d+)/)
  const num = match ? Number.parseInt(match[1], 10) + 1 : 1
  return `LR-${String(num).padStart(3, '0')}`
}

async function assertNoOverlap(
  employeeId: string,
  startDate: Date,
  endDate: Date,
  excludeId?: string,
): Promise<void> {
  const filter: Record<string, unknown> = {
    employeeId: new Types.ObjectId(employeeId),
    status: { $in: ['pending', 'approved'] },
    startDate: { $lte: endDate },
    endDate: { $gte: startDate },
  }

  if (excludeId) {
    filter._id = { $ne: new Types.ObjectId(excludeId) }
  }

  const overlap = await LeaveRequest.findOne(filter)
  if (overlap) {
    throw new AppError(
      'You already have a leave request that overlaps these dates',
      409,
      'LEAVE_OVERLAP',
    )
  }
}

async function toLeaveRequestDto(
  doc: ILeaveRequest,
  leaveType?: ILeaveType | null,
  employee?: { fullName: string; department?: string; avatar?: string; _id: Types.ObjectId } | null,
): Promise<LeaveRequestDto> {
  const type =
    leaveType ?? (await LeaveType.findById(doc.leaveTypeId))
  const emp =
    employee ??
    (await User.findById(doc.employeeId).select('fullName department avatar'))

  const employeeId = doc.employeeId.toString()
  const leaveTypeId = doc.leaveTypeId.toString()
  const year = new Date().getUTCFullYear()
  const totalTaken = await getTotalApprovedDays(employeeId, year)
  const remaining = type ? await getRemainingBalance(employeeId, leaveTypeId) : null

  return {
    id: doc._id.toString(),
    requestId: doc.requestCode,
    employeeId,
    employeeName: emp?.fullName ?? 'Unknown',
    department: emp?.department ?? '—',
    ...(emp?.avatar ? { avatar: emp.avatar } : {}),
    leaveTypeId,
    leaveTypeName: type?.name ?? 'Unknown',
    reason: doc.reason,
    startDate: toDateString(doc.startDate),
    endDate: toDateString(doc.endDate),
    durationDays: doc.durationDays,
    balanceDaysUsed: doc.balanceDaysUsed ?? doc.durationDays,
    excessDays: doc.excessDays ?? 0,
    excessDisposition: doc.excessDisposition ?? 'none',
    status: doc.status,
    isOverdue: isLeaveRequestOverdue(doc.status, doc.endDate),
    appliedDate: toDateString(doc.appliedAt),
    adminComment: doc.adminComment,
    totalLeavesTaken: totalTaken,
    remainingBalance: remaining ?? undefined,
  }
}

export async function listLeaveTypes(acting: LeaveActor): Promise<LeaveTypeDto[]> {
  assertCompanyContext(acting)

  const types = await LeaveType.find({ companyId: acting.companyId }).sort({ name: 1 })
  return types.map(toLeaveTypeDto)
}

export async function getLeaveTypeById(id: string, acting: LeaveActor): Promise<LeaveTypeDto> {
  assertCompanyContext(acting)

  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Leave type not found', 404, 'LEAVE_TYPE_NOT_FOUND')
  }

  const leaveType = await LeaveType.findOne({
    _id: id,
    companyId: acting.companyId,
  })

  if (!leaveType) {
    throw new AppError('Leave type not found', 404, 'LEAVE_TYPE_NOT_FOUND')
  }

  return toLeaveTypeDto(leaveType)
}

export async function createLeaveType(
  input: CreateLeaveTypeInput,
  acting: LeaveActor,
): Promise<LeaveTypeDto> {
  assertCompanyContext(acting)

  const paidLeave = input.paidLeave
  const leaveType = await LeaveType.create({
    companyId: acting.companyId,
    name: input.name,
    maxDays: resolveMaxDays(input),
    description: input.description,
    icon: input.icon ?? inferIcon(input.name),
    // Unpaid leave has no balance to roll over or encash
    carryForward: paidLeave ? input.carryForward : false,
    paidLeave,
    status: input.status,
  })

  return toLeaveTypeDto(leaveType)
}

export async function updateLeaveType(
  id: string,
  input: UpdateLeaveTypeInput,
  acting: LeaveActor,
): Promise<LeaveTypeDto> {
  assertCompanyContext(acting)

  const leaveType = await LeaveType.findOne({
    _id: id,
    companyId: acting.companyId,
  })

  if (!leaveType) {
    throw new AppError('Leave type not found', 404, 'LEAVE_TYPE_NOT_FOUND')
  }

  if (input.name !== undefined) leaveType.name = input.name
  if (input.description !== undefined) leaveType.description = input.description
  if (input.icon !== undefined) leaveType.icon = input.icon
  if (input.carryForward !== undefined) leaveType.carryForward = input.carryForward
  if (input.paidLeave !== undefined) leaveType.paidLeave = input.paidLeave
  if (input.status !== undefined) leaveType.status = input.status
  if (input.unlimited !== undefined || input.maxDays !== undefined) {
    leaveType.maxDays = resolveMaxDays(input)
  }
  // Unpaid leave has no balance to roll over or encash
  if (!leaveType.paidLeave) leaveType.carryForward = false

  await leaveType.save()
  return toLeaveTypeDto(leaveType)
}

export async function deleteLeaveType(id: string, acting: LeaveActor): Promise<void> {
  assertCompanyContext(acting)

  const leaveType = await LeaveType.findOne({
    _id: id,
    companyId: acting.companyId,
  })

  if (!leaveType) {
    throw new AppError('Leave type not found', 404, 'LEAVE_TYPE_NOT_FOUND')
  }

  const inUse = await LeaveRequest.exists({ leaveTypeId: leaveType._id })
  if (inUse) {
    throw new AppError(
      'Cannot delete leave type that has existing requests. Set it to inactive instead.',
      409,
      'LEAVE_TYPE_IN_USE',
    )
  }

  await leaveType.deleteOne()
}

export async function listLeaveRequests(
  query: ListLeaveRequestsQuery,
  acting: LeaveActor,
): Promise<{ requests: LeaveRequestDto[]; pagination: ReturnType<typeof buildPaginatedResult<LeaveRequestDto>>['pagination'] }> {
  assertCompanyContext(acting)

  const { page, limit, skip } = parsePagination(query)
  const scopedIds = await resolveScopedEmployeeIds(acting, query.scope)

  const filter: Record<string, unknown> = {
    companyId: acting.companyId,
  }

  if (scopedIds !== 'all') {
    filter.employeeId = { $in: scopedIds.map((id) => new Types.ObjectId(id)) }
  }

  if (query.leaveTypeId) {
    filter.leaveTypeId = new Types.ObjectId(query.leaveTypeId)
  }

  const today = startOfTodayUtc()

  // `pending` = still actionable (end date today or later).
  // `overdue` = pending but leave dates already passed (still approvable).
  if (query.status === 'overdue') {
    filter.status = 'pending'
    filter.endDate = { $lt: today }
  } else if (query.status === 'pending') {
    filter.status = 'pending'
    filter.endDate = { $gte: today }
  } else if (query.status) {
    filter.status = query.status
  }

  const andConditions: Record<string, unknown>[] = []

  if (query.month && query.month !== 'all') {
    const [yearStr, monthStr] = query.month.split('-')
    const year = Number.parseInt(yearStr, 10)
    const month = Number.parseInt(monthStr, 10) - 1
    if (!Number.isNaN(year) && !Number.isNaN(month)) {
      const monthStart = new Date(year, month, 1)
      const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999)
      andConditions.push({
        $or: [
          { startDate: { $gte: monthStart, $lte: monthEnd } },
          { appliedAt: { $gte: monthStart, $lte: monthEnd } },
        ],
      })
    }
  }

  if (query.search?.trim()) {
    const term = query.search.trim()
    const employees = await User.find({
      companyId: acting.companyId,
      fullName: { $regex: term, $options: 'i' },
    }).select('_id')

    const employeeIds = employees.map((e) => e._id)
    andConditions.push({
      $or: [
        { requestCode: { $regex: term, $options: 'i' } },
        { reason: { $regex: term, $options: 'i' } },
        ...(employeeIds.length ? [{ employeeId: { $in: employeeIds } }] : []),
      ],
    })
  }

  if (andConditions.length === 1) {
    Object.assign(filter, andConditions[0])
  } else if (andConditions.length > 1) {
    filter.$and = andConditions
  }

  const [docs, total] = await Promise.all([
    LeaveRequest.find(filter).sort({ appliedAt: -1 }).skip(skip).limit(limit),
    LeaveRequest.countDocuments(filter),
  ])

  const typeIds = [...new Set(docs.map((d) => d.leaveTypeId.toString()))]
  const employeeIdList = [...new Set(docs.map((d) => d.employeeId.toString()))]

  const [types, employees] = await Promise.all([
    LeaveType.find({ _id: { $in: typeIds } }),
    User.find({ _id: { $in: employeeIdList } }).select('fullName department avatar'),
  ])

  const typeMap = new Map(types.map((t) => [t._id.toString(), t]))
  const employeeMap = new Map(employees.map((e) => [e._id.toString(), e]))

  const requests = await Promise.all(
    docs.map((doc) =>
      toLeaveRequestDto(
        doc,
        typeMap.get(doc.leaveTypeId.toString()),
        employeeMap.get(doc.employeeId.toString()),
      ),
    ),
  )

  const paginated = buildPaginatedResult(requests, total, page, limit)
  return { requests: paginated.items, pagination: paginated.pagination }
}

export async function getLeaveRequestStats(
  acting: LeaveActor,
  scope?: 'mine' | 'team' | 'company',
): Promise<LeaveStatsDto> {
  assertCompanyContext(acting)

  const scopedIds = await resolveScopedEmployeeIds(acting, scope)
  const filter: Record<string, unknown> = { companyId: acting.companyId }

  if (scopedIds !== 'all') {
    filter.employeeId = { $in: scopedIds.map((id) => new Types.ObjectId(id)) }
  }

  const today = startOfTodayUtc()
  const endOfToday = new Date(today)
  endOfToday.setUTCHours(23, 59, 59, 999)

  const pendingBase = { ...filter, status: 'pending' as const }

  const [total, pending, overdue, approved, rejected, currentlyOnLeave] = await Promise.all([
    LeaveRequest.countDocuments(filter),
    LeaveRequest.countDocuments({ ...pendingBase, endDate: { $gte: today } }),
    LeaveRequest.countDocuments({ ...pendingBase, endDate: { $lt: today } }),
    LeaveRequest.countDocuments({ ...filter, status: 'approved' }),
    LeaveRequest.countDocuments({ ...filter, status: 'rejected' }),
    LeaveRequest.distinct('employeeId', {
      ...filter,
      status: 'approved',
      startDate: { $lte: endOfToday },
      endDate: { $gte: today },
    }).then((ids) => ids.length),
  ])

  return { total, pending, overdue, approved, rejected, currentlyOnLeave }
}

export async function getLeaveRequestById(
  id: string,
  acting: LeaveActor,
): Promise<LeaveRequestDto> {
  assertCompanyContext(acting)

  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Leave request not found', 404, 'LEAVE_REQUEST_NOT_FOUND')
  }

  const doc = await LeaveRequest.findOne({
    _id: id,
    companyId: acting.companyId,
  })

  if (!doc) {
    throw new AppError('Leave request not found', 404, 'LEAVE_REQUEST_NOT_FOUND')
  }

  const canAccess = await canAccessEmployee(acting, doc.employeeId.toString())
  if (!canAccess) {
    throw new AppError('Leave request not found', 404, 'LEAVE_REQUEST_NOT_FOUND')
  }

  const dto = await toLeaveRequestDto(doc)
  const { ensurePayrollSettings } = await import(
    '../salaries/payroll-settings.service.js'
  )
  const settings = await ensurePayrollSettings(acting.companyId)
  return {
    ...dto,
    excessLeaveMode: settings.leavePolicy.excessLeaveMode,
  }
}

export async function createLeaveRequest(
  input: CreateLeaveRequestInput,
  acting: LeaveActor,
): Promise<LeaveRequestDto> {
  assertCompanyContext(acting)

  if (!acting.canRequest) {
    throw new AppError('You do not have permission to request leave', 403, 'FORBIDDEN')
  }

  const leaveType = await LeaveType.findOne({
    _id: input.leaveTypeId,
    companyId: acting.companyId,
    status: 'active',
  })

  if (!leaveType) {
    throw new AppError('Leave type not found or inactive', 404, 'LEAVE_TYPE_NOT_FOUND')
  }

  const durationDays = computeDurationDays(input.startDate, input.endDate)

  await assertNoOverlap(acting.id, input.startDate, input.endDate)

  const { ensurePayrollSettings } = await import(
    '../salaries/payroll-settings.service.js'
  )
  const payrollSettings = await ensurePayrollSettings(acting.companyId)
  const excessMode = payrollSettings.leavePolicy.excessLeaveMode

  let balanceDaysUsed = durationDays
  let excessDays = 0
  let excessDisposition: ILeaveRequest['excessDisposition'] = 'none'

  if (leaveType.maxDays !== null) {
    const year = input.startDate.getUTCFullYear()
    const entitlement = (await getEntitlementDays(acting.id, leaveType, year)) ?? 0
    const used = await getUsedDays(acting.id, leaveType._id.toString(), year, 'approved')
    const pending = await getUsedDays(acting.id, leaveType._id.toString(), year, 'pending')
    const remaining = Math.max(0, entitlement - used - pending)

    if (durationDays > remaining) {
      excessDays = durationDays - remaining
      balanceDaysUsed = remaining

      if (excessMode === 'reject') {
        throw new AppError(
          `Insufficient leave balance. You have ${remaining} day(s) remaining for ${leaveType.name}.`,
          400,
          'INSUFFICIENT_BALANCE',
        )
      }

      if (excessMode === 'deduct_from_salary') {
        excessDisposition = 'unpaid_deduct'
      } else {
        // admin_can_waive — disposition chosen on approve
        excessDisposition = 'none'
      }
    }
  }

  const requestCode = await nextRequestCode(acting.companyId)

  const doc = await LeaveRequest.create({
    companyId: acting.companyId,
    requestCode,
    employeeId: acting.id,
    leaveTypeId: leaveType._id,
    reason: input.reason,
    startDate: input.startDate,
    endDate: input.endDate,
    durationDays,
    balanceDaysUsed,
    excessDays,
    excessDisposition,
    status: 'pending',
    appliedAt: new Date(),
  })

  const actorUser = await User.findById(acting.id).select('fullName')
  const actorName = actorUser?.fullName ?? 'User'
  await dispatchDomainEventSafe({
    type: 'leave.submitted',
    actor: { id: acting.id, fullName: actorName, companyId: acting.companyId },
    entityId: doc._id.toString(),
    subjectUserId: acting.id,
    context: {
      subjectName: actorName,
      entityLabel: leaveType.name,
    },
  })

  return toLeaveRequestDto(doc, leaveType)
}

export async function updateLeaveRequestStatus(
  id: string,
  input: UpdateLeaveRequestStatusInput,
  acting: LeaveActor,
): Promise<LeaveRequestDto> {
  assertCompanyContext(acting)

  const doc = await LeaveRequest.findOne({
    _id: id,
    companyId: acting.companyId,
  })

  if (!doc) {
    throw new AppError('Leave request not found', 404, 'LEAVE_REQUEST_NOT_FOUND')
  }

  if (doc.status !== 'pending') {
    throw new AppError('Only pending requests can be updated', 400, 'INVALID_STATUS')
  }

  const canApprove = await canApproveForEmployee(acting, doc.employeeId.toString())
  if (!canApprove) {
    throw new AppError('You do not have permission to approve this request', 403, 'FORBIDDEN')
  }

  if (input.status === 'approved') {
    const leaveType = await LeaveType.findById(doc.leaveTypeId)
    const { ensurePayrollSettings } = await import(
      '../salaries/payroll-settings.service.js'
    )
    const payrollSettings = await ensurePayrollSettings(acting.companyId)
    const excessMode = payrollSettings.leavePolicy.excessLeaveMode

    if (leaveType && leaveType.maxDays !== null) {
      const year = doc.startDate.getUTCFullYear()
      const entitlement =
        (await getEntitlementDays(doc.employeeId.toString(), leaveType, year)) ?? 0
      const used = await getUsedDays(
        doc.employeeId.toString(),
        leaveType._id.toString(),
        year,
        'approved',
      )
      const remaining = Math.max(0, entitlement - used)
      const excess = Math.max(0, doc.durationDays - remaining)

      if (excess > 0) {
        doc.balanceDaysUsed = remaining
        doc.excessDays = excess

        if (excessMode === 'reject') {
          throw new AppError(
            `Employee has insufficient balance. Only ${remaining} day(s) remaining.`,
            400,
            'INSUFFICIENT_BALANCE',
          )
        }

        if (excessMode === 'deduct_from_salary') {
          doc.excessDisposition = 'unpaid_deduct'
        } else if (excessMode === 'admin_can_waive') {
          if (!input.excessDisposition || input.excessDisposition === 'none') {
            throw new AppError(
              'This request exceeds balance. Choose waive or deduct from salary.',
              400,
              'EXCESS_DISPOSITION_REQUIRED',
            )
          }
          if (
            input.excessDisposition !== 'waived' &&
            input.excessDisposition !== 'unpaid_deduct'
          ) {
            throw new AppError('Invalid excess disposition', 400, 'INVALID_DISPOSITION')
          }
          doc.excessDisposition = input.excessDisposition
        }
      } else {
        doc.balanceDaysUsed = doc.durationDays
        doc.excessDays = 0
        doc.excessDisposition = 'none'
      }
    }
  }

  doc.status = input.status
  doc.adminComment = input.adminComment
  doc.reviewedById = new Types.ObjectId(acting.id)
  doc.reviewedAt = new Date()
  await doc.save()

  const [actorUser, employee] = await Promise.all([
    User.findById(acting.id).select('fullName'),
    User.findById(doc.employeeId).select('fullName'),
  ])
  const leaveType = await LeaveType.findById(doc.leaveTypeId).select('name')
  const eventType = input.status === 'approved' ? 'leave.approved' : 'leave.rejected'
  await dispatchDomainEventSafe({
    type: eventType,
    actor: {
      id: acting.id,
      fullName: actorUser?.fullName ?? 'User',
      companyId: acting.companyId,
    },
    entityId: doc._id.toString(),
    subjectUserId: doc.employeeId.toString(),
    context: {
      subjectName: employee?.fullName,
      entityLabel: leaveType?.name,
      note: input.adminComment,
    },
  })

  // Best-effort: refresh attendance overlays for the leave span
  await syncAttendanceForLeaveRange(
    acting.companyId,
    doc.employeeId.toString(),
    doc.startDate,
    doc.endDate,
  )

  return toLeaveRequestDto(doc)
}

async function syncAttendanceForLeaveRange(
  companyId: string,
  employeeId: string,
  startDate: Date,
  endDate: Date,
): Promise<void> {
  try {
    const { eachDateInRange } = await import('../attendance/attendance-calc.js')
    const { recomputeAttendanceDay } = await import('../attendance/attendance.service.js')
    const from = startDate.toISOString().slice(0, 10)
    const to = endDate.toISOString().slice(0, 10)
    for (const date of eachDateInRange(from, to)) {
      await recomputeAttendanceDay(companyId, employeeId, date).catch(() => null)
    }
  } catch {
    // Leave decision must not fail if attendance sync errors
  }
}

export async function getEmployeeLeaveSummary(
  userId: string,
  acting: LeaveActor,
): Promise<EmployeeLeaveSummaryDto> {
  assertCompanyContext(acting)

  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError('Employee not found', 404, 'EMPLOYEE_NOT_FOUND')
  }

  const canAccess = await canAccessEmployee(acting, userId)
  const hasEmployeeRead = hasPermission(acting.role, 'employees:read', acting.permissions)

  if (!canAccess && !hasEmployeeRead) {
    throw new AppError('Employee not found', 404, 'EMPLOYEE_NOT_FOUND')
  }

  if (!canAccess && hasEmployeeRead) {
    const user = await User.findOne({ _id: userId, companyId: acting.companyId })
    if (!user) {
      throw new AppError('Employee not found', 404, 'EMPLOYEE_NOT_FOUND')
    }
  }

  const year = new Date().getUTCFullYear()

  const requests = await LeaveRequest.find({
    employeeId: new Types.ObjectId(userId),
    companyId: acting.companyId,
  })
    .sort({ appliedAt: -1 })
    .limit(50)

  const typeIds = [...new Set(requests.map((r) => r.leaveTypeId.toString()))]
  const types = await LeaveType.find({ _id: { $in: typeIds } })
  const typeMap = new Map(types.map((t) => [t._id.toString(), t]))

  const yearlyTaken = requests
    .filter((r) => r.status === 'approved')
    .reduce((sum, r) => sum + durationDaysInYear(r.startDate, r.endDate, year), 0)

  const pendingRequests = requests.filter((r) => r.status === 'pending').length
  const totalTaken = requests
    .filter((r) => r.status === 'approved')
    .reduce((sum, r) => sum + r.durationDays, 0)

  const activeTypes = await LeaveType.find({
    companyId: acting.companyId,
    status: 'active',
  }).sort({ name: 1 })

  const hireYear = await resolveHireYear(userId, year)
  let totalAllocated = 0
  let totalUsedAcrossTypes = 0
  const balances: LeaveTypeBalanceDto[] = []

  for (const type of activeTypes) {
    const typeId = type._id.toString()
    const used = await getUsedDays(userId, typeId, year, 'approved')
    const pending = await getUsedDays(userId, typeId, year, 'pending')
    const unlimited = type.maxDays === null
    const carryIn =
      unlimited || year < hireYear
        ? 0
        : await getCarryInDays(userId, type, year, hireYear)
    const entitlement = unlimited
      ? null
      : year < hireYear
        ? 0
        : type.maxDays! + carryIn

    if (entitlement !== null) {
      totalAllocated += entitlement
      totalUsedAcrossTypes += used
    }

    const remaining = entitlement === null ? null : Math.max(0, entitlement - used)
    const available =
      entitlement === null ? null : Math.max(0, entitlement - used - pending)

    balances.push({
      leaveTypeId: typeId,
      name: type.name,
      icon: type.icon,
      maxDays: unlimited ? 'unlimited' : type.maxDays!,
      entitlement,
      carryIn,
      used,
      pending,
      remaining,
      available,
      carryForward: type.carryForward,
      paidLeave: type.paidLeave,
    })
  }

  const remainingBalance = Math.max(0, totalAllocated - totalUsedAcrossTypes)

  const history: LeaveRecordDto[] = requests.map((doc) => {
    const type = typeMap.get(doc.leaveTypeId.toString())
    const icon = type?.icon ?? 'casual'
    return {
      id: doc._id.toString(),
      type: type?.name ?? 'Leave',
      typeColor: LEAVE_TYPE_COLORS[icon],
      dates: formatDateRange(toDateString(doc.startDate), toDateString(doc.endDate)),
      duration: `${doc.durationDays} day${doc.durationDays !== 1 ? 's' : ''}`,
      reason: doc.reason,
      status: doc.status,
    }
  })

  return {
    year,
    yearlyTaken,
    remainingBalance,
    pendingRequests,
    totalTaken,
    balances,
    history,
  }
}

export function buildLeaveActor(
  userId: string,
  companyId: string,
  role: UserRole,
  permissions: Permission[],
): LeaveActor {
  return {
    id: userId,
    companyId,
    role,
    permissions,
    canManage: hasPermission(role, 'leave:manage', permissions),
    canApprove: hasPermission(role, 'leave:approve', permissions),
    canRequest: hasPermission(role, 'leave:request', permissions),
  }
}

/**
 * Encash unused paid leave (carryForward=false) for a year into pending payroll line items.
 */
export async function runLeaveEncashment(
  input: LeaveEncashmentInput,
  acting: LeaveActor,
): Promise<{ created: number; skipped: number; year: number }> {
  assertCompanyContext(acting)
  if (!acting.canManage) {
    throw new AppError('Only HR/Admin can run leave encashment', 403, 'FORBIDDEN')
  }

  const { ensurePayrollSettings } = await import('../salaries/payroll-settings.service.js')
  const { dailyRateFromBasic } = await import('../salaries/leave-payroll.js')

  const settings = await ensurePayrollSettings(acting.companyId)
  if (!settings.leavePolicy.encashmentEnabled) {
    throw new AppError(
      'Leave encashment is disabled for this company',
      400,
      'ENCASHMENT_DISABLED',
    )
  }

  const year = input.year
  const targetMonth = input.targetMonth ?? 12
  const targetYear = input.targetYear ?? year
  const divisor = settings.leavePolicy.encashmentDivisor

  const leaveTypes = await LeaveType.find({
    companyId: acting.companyId,
    status: 'active',
    paidLeave: true,
    carryForward: false,
    maxDays: { $ne: null },
  })

  const employees = await User.find({
    companyId: acting.companyId,
    role: { $in: ['employee', 'manager', 'hr'] },
    status: 'active',
  })

  let created = 0
  let skipped = 0

  for (const employee of employees) {
    for (const leaveType of leaveTypes) {
      if (leaveType.maxDays === null) continue
      const used = await getUsedDays(
        employee._id.toString(),
        leaveType._id.toString(),
        year,
        'approved',
      )
      const unusedDays = Math.max(0, leaveType.maxDays - used)
      if (unusedDays <= 0) {
        skipped += 1
        continue
      }

      const basic = employee.basicSalary ?? 0
      const amount = Math.round(unusedDays * dailyRateFromBasic(basic, divisor) * 100) / 100
      if (amount <= 0) {
        skipped += 1
        continue
      }

      const existing = await LeaveEncashment.findOne({
        companyId: acting.companyId,
        employeeId: employee._id,
        year,
        leaveTypeId: leaveType._id,
      })

      if (existing) {
        skipped += 1
        continue
      }

      await LeaveEncashment.create({
        companyId: acting.companyId,
        employeeId: employee._id,
        year,
        unusedDays,
        amount,
        targetMonth,
        targetYear,
        status: 'pending',
        leaveTypeId: leaveType._id,
        note: `Encashment of ${unusedDays} unused ${leaveType.name} day(s) for ${year}`,
      })
      created += 1
    }
  }

  return { created, skipped, year }
}
