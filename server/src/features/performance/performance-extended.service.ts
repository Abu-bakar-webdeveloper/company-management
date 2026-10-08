import { Types } from 'mongoose'
import { AppError } from '../../utils/AppError.js'
import type { UserRole } from '../auth/auth.types.js'
import { hasPermission, type Permission } from '../auth/permissions.js'
import { User } from '../auth/user.model.js'
import { Goal, type IGoal } from './goal.model.js'
import { PerformanceAuditLog } from './performance-audit-log.model.js'
import { PerformanceReview } from './performance-review.model.js'
import type {
  CalibrationDto,
  GoalDto,
  PerformanceAuditEntryDto,
  PerformanceLevel,
  ReviewCycleDto,
} from './performance.types.js'
import type {
  CreateGoalInput,
  CreateReviewCycleInput,
  UpdateGoalInput,
  UpdateReviewCycleInput,
} from './performance.validation.js'
import { ReviewCycle } from './review-cycle.model.js'
import type { PerformanceActor } from './performance-actor.js'

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function computeGoalProgress(goal: IGoal): number {
  if (!goal.keyResults.length) return goal.progressPct ?? 0
  const pcts = goal.keyResults.map((kr) => {
    if (kr.target <= 0) return 0
    return Math.min(100, (kr.current / kr.target) * 100)
  })
  return Math.round(pcts.reduce((s, p) => s + p, 0) / pcts.length)
}

function toGoalDto(goal: IGoal): GoalDto {
  return {
    id: goal._id.toString(),
    employeeId: goal.employeeId.toString(),
    cycleId: goal.cycleId?.toString() ?? null,
    periodStart: goal.periodStart ? toDateString(goal.periodStart) : null,
    periodEnd: goal.periodEnd ? toDateString(goal.periodEnd) : null,
    title: goal.title,
    description: goal.description,
    status: goal.status,
    progressPct: goal.progressPct,
    keyResults: goal.keyResults.map((kr) => ({
      id: kr.id,
      title: kr.title,
      target: kr.target,
      current: kr.current,
      unit: kr.unit,
    })),
    managerConfirmed: goal.managerConfirmed,
    createdAt: goal.createdAt.toISOString(),
  }
}

type CyclePeriod = {
  _id: Types.ObjectId
  periodStart: Date
  periodEnd: Date
}

type SubmittedReviewLite = {
  cycleId?: Types.ObjectId | null
  periodStart?: Date | null
  finalAdjustedScore?: number | null
}

function computeCycleStats(
  rateable: number,
  cycle: CyclePeriod,
  reviews: SubmittedReviewLite[],
): { completionPct: number; dueCount: number; unscoredCount: number } {
  const cycleId = cycle._id.toString()
  let scored = 0
  for (const review of reviews) {
    if (review.cycleId?.toString() === cycleId) {
      scored += 1
      continue
    }
    if (
      review.periodStart != null &&
      review.finalAdjustedScore != null &&
      review.periodStart >= cycle.periodStart &&
      review.periodStart <= cycle.periodEnd
    ) {
      scored += 1
    }
  }
  const dueCount = Math.max(rateable - scored, 0)
  return {
    completionPct: rateable === 0 ? 0 : Math.round((scored / rateable) * 100),
    dueCount,
    unscoredCount: dueCount,
  }
}

async function countRateableEmployees(companyId: string): Promise<number> {
  return User.countDocuments({
    companyId,
    role: { $in: ['employee', 'manager'] },
    status: 'active',
  })
}

async function cycleCompletion(
  companyId: string,
  cycle: CyclePeriod,
): Promise<{ completionPct: number; dueCount: number; unscoredCount: number }> {
  const [rateable, reviews] = await Promise.all([
    countRateableEmployees(companyId),
    PerformanceReview.find({ companyId, status: 'submitted' })
      .select('cycleId periodStart finalAdjustedScore')
      .lean<SubmittedReviewLite[]>(),
  ])
  return computeCycleStats(rateable, cycle, reviews)
}

export async function listReviewCycles(acting: PerformanceActor): Promise<ReviewCycleDto[]> {
  const [cycles, rateable, reviews] = await Promise.all([
    ReviewCycle.find({ companyId: acting.companyId }).sort({ periodStart: -1 }),
    countRateableEmployees(acting.companyId),
    PerformanceReview.find({ companyId: acting.companyId, status: 'submitted' })
      .select('cycleId periodStart finalAdjustedScore')
      .lean<SubmittedReviewLite[]>(),
  ])

  return cycles.map((cycle) => ({
    id: cycle._id.toString(),
    name: cycle.name,
    type: cycle.type,
    periodStart: toDateString(cycle.periodStart),
    periodEnd: toDateString(cycle.periodEnd),
    status: cycle.status,
    ...computeCycleStats(rateable, cycle, reviews),
  }))
}

export async function createReviewCycle(
  acting: PerformanceActor,
  input: CreateReviewCycleInput,
): Promise<ReviewCycleDto> {
  if (acting.role !== 'admin' && acting.role !== 'hr') {
    throw new AppError('Only Admin/HR can create review cycles', 403, 'FORBIDDEN')
  }
  const cycle = await ReviewCycle.create({
    companyId: acting.companyId,
    name: input.name,
    type: input.type,
    periodStart: new Date(`${input.periodStart}T00:00:00.000Z`),
    periodEnd: new Date(`${input.periodEnd}T00:00:00.000Z`),
    status: input.status ?? 'draft',
  })
  const stats = await cycleCompletion(acting.companyId, cycle)
  return {
    id: cycle._id.toString(),
    name: cycle.name,
    type: cycle.type,
    periodStart: toDateString(cycle.periodStart),
    periodEnd: toDateString(cycle.periodEnd),
    status: cycle.status,
    ...stats,
  }
}

export async function updateReviewCycle(
  acting: PerformanceActor,
  cycleId: string,
  input: UpdateReviewCycleInput,
): Promise<ReviewCycleDto> {
  if (acting.role !== 'admin' && acting.role !== 'hr') {
    throw new AppError('Only Admin/HR can update review cycles', 403, 'FORBIDDEN')
  }
  const cycle = await ReviewCycle.findOne({ _id: cycleId, companyId: acting.companyId })
  if (!cycle) throw new AppError('Review cycle not found', 404, 'NOT_FOUND')

  if (input.name != null) cycle.name = input.name
  if (input.type != null) cycle.type = input.type
  if (input.status != null) cycle.status = input.status
  if (input.periodStart) cycle.periodStart = new Date(`${input.periodStart}T00:00:00.000Z`)
  if (input.periodEnd) cycle.periodEnd = new Date(`${input.periodEnd}T00:00:00.000Z`)
  await cycle.save()

  const stats = await cycleCompletion(acting.companyId, cycle)
  return {
    id: cycle._id.toString(),
    name: cycle.name,
    type: cycle.type,
    periodStart: toDateString(cycle.periodStart),
    periodEnd: toDateString(cycle.periodEnd),
    status: cycle.status,
    ...stats,
  }
}

export async function listGoals(
  acting: PerformanceActor,
  employeeId?: string,
): Promise<GoalDto[]> {
  const filter: Record<string, unknown> = { companyId: acting.companyId }
  if (employeeId) {
    filter.employeeId = employeeId
  } else if (acting.role === 'employee') {
    filter.employeeId = acting.id
  } else if (acting.role === 'manager') {
    const reports = await User.find({
      companyId: acting.companyId,
      managerId: acting.id,
    }).select('_id')
    filter.employeeId = { $in: [acting.id, ...reports.map((r) => r._id)] }
  }

  const goals = await Goal.find(filter).sort({ createdAt: -1 }).limit(200)
  return goals.map(toGoalDto)
}

export async function createGoal(
  acting: PerformanceActor,
  input: CreateGoalInput,
): Promise<GoalDto> {
  const isSelf = acting.id === input.employeeId
  const canManageOthers =
    acting.role === 'admin' || acting.role === 'hr' || acting.role === 'manager'
  if (!isSelf && !canManageOthers) {
    throw new AppError('Not allowed to create goals for this employee', 403, 'FORBIDDEN')
  }

  const goal = await Goal.create({
    companyId: acting.companyId,
    employeeId: input.employeeId,
    cycleId: input.cycleId,
    periodStart: input.periodStart ? new Date(`${input.periodStart}T00:00:00.000Z`) : undefined,
    periodEnd: input.periodEnd ? new Date(`${input.periodEnd}T00:00:00.000Z`) : undefined,
    title: input.title,
    description: input.description ?? '',
    keyResults: input.keyResults ?? [],
    progressPct: 0,
    status: 'open',
    managerConfirmed: false,
  })
  goal.progressPct = computeGoalProgress(goal)
  await goal.save()
  return toGoalDto(goal)
}

export async function updateGoal(
  acting: PerformanceActor,
  goalId: string,
  input: UpdateGoalInput,
): Promise<GoalDto> {
  const goal = await Goal.findOne({ _id: goalId, companyId: acting.companyId })
  if (!goal) throw new AppError('Goal not found', 404, 'NOT_FOUND')

  const isOwner = goal.employeeId.toString() === acting.id
  const canManage =
    acting.role === 'admin' ||
    acting.role === 'hr' ||
    acting.role === 'manager'

  if (!isOwner && !canManage) {
    throw new AppError('Not allowed to update this goal', 403, 'FORBIDDEN')
  }

  if (input.title != null) goal.title = input.title
  if (input.description != null) goal.description = input.description
  if (input.status != null) goal.status = input.status
  if (input.keyResults != null) {
    goal.keyResults = input.keyResults
    goal.progressPct = computeGoalProgress(goal)
  }
  if (input.managerConfirmed != null) {
    if (!canManage) {
      throw new AppError('Only managers/admin/HR can confirm goals', 403, 'FORBIDDEN')
    }
    goal.managerConfirmed = input.managerConfirmed
  }

  await goal.save()
  return toGoalDto(goal)
}

export async function listPerformanceAuditLog(
  acting: PerformanceActor,
  limit = 50,
): Promise<PerformanceAuditEntryDto[]> {
  if (acting.role !== 'admin' && acting.role !== 'hr') {
    throw new AppError('Only Admin/HR can view the org audit log', 403, 'FORBIDDEN')
  }

  const docs = await PerformanceAuditLog.find({ companyId: acting.companyId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()

  const userIds = [
    ...new Set(docs.flatMap((d) => [d.employeeId.toString(), d.actorId.toString()])),
  ]
  const users = await User.find({ _id: { $in: userIds } }).select('fullName')
  const nameMap = new Map(users.map((u) => [u._id.toString(), u.fullName]))

  return docs.map((doc) => ({
    id: doc._id.toString(),
    reviewId: doc.reviewId.toString(),
    employeeId: doc.employeeId.toString(),
    employeeName: nameMap.get(doc.employeeId.toString()),
    actorId: doc.actorId.toString(),
    actorName: nameMap.get(doc.actorId.toString()),
    type: doc.type,
    amount: doc.amount,
    note: doc.note,
    createdAt: doc.createdAt.toISOString(),
  }))
}

export async function listReviewAuditTrail(
  acting: PerformanceActor,
  reviewId: string,
): Promise<PerformanceAuditEntryDto[]> {
  const review = await PerformanceReview.findOne({
    _id: reviewId,
    companyId: acting.companyId,
  }).select('_id employeeId')
  if (!review) throw new AppError('Review not found', 404, 'NOT_FOUND')

  const docs = await PerformanceAuditLog.find({
    companyId: acting.companyId,
    reviewId,
  })
    .sort({ createdAt: -1 })
    .lean()

  const actorIds = [...new Set(docs.map((d) => d.actorId.toString()))]
  const users = await User.find({ _id: { $in: actorIds } }).select('fullName')
  const nameMap = new Map(users.map((u) => [u._id.toString(), u.fullName]))

  return docs.map((doc) => ({
    id: doc._id.toString(),
    reviewId: doc.reviewId.toString(),
    employeeId: doc.employeeId.toString(),
    actorId: doc.actorId.toString(),
    actorName: nameMap.get(doc.actorId.toString()),
    type: doc.type,
    amount: doc.amount,
    note: doc.note,
    createdAt: doc.createdAt.toISOString(),
  }))
}

export async function getCalibration(
  acting: PerformanceActor,
  periodStartInput?: string,
): Promise<CalibrationDto> {
  if (acting.role !== 'admin' && acting.role !== 'hr') {
    throw new AppError('Only Admin/HR can view calibration', 403, 'FORBIDDEN')
  }

  const filter: Record<string, unknown> = {
    companyId: acting.companyId,
    status: 'submitted',
    finalAdjustedScore: { $ne: null },
  }

  if (periodStartInput) {
    filter.periodStart = new Date(`${periodStartInput}T00:00:00.000Z`)
  }

  const reviews = await PerformanceReview.find(filter)
    .select('employeeId finalAdjustedScore performanceLevel reviewerId')
    .lean()

  const levels: PerformanceLevel[] = ['excellent', 'good', 'needs_improvement', 'poor']
  const counts = new Map<PerformanceLevel, number>(levels.map((l) => [l, 0]))
  let scoreSum = 0

  for (const review of reviews) {
    const level = (review.performanceLevel ?? 'poor') as PerformanceLevel
    counts.set(level, (counts.get(level) ?? 0) + 1)
    scoreSum += review.finalAdjustedScore ?? 0
  }

  const total = reviews.length
  const distribution = levels.map((level) => ({
    level,
    count: counts.get(level) ?? 0,
    pct: total === 0 ? 0 : Math.round(((counts.get(level) ?? 0) / total) * 100),
  }))

  const empIds = [...new Set(reviews.map((r) => r.employeeId.toString()))]
  const employees = await User.find({ _id: { $in: empIds } }).select(
    'fullName department managerId',
  )
  const empMap = new Map(employees.map((e) => [e._id.toString(), e]))

  const deptAgg = new Map<string, { sum: number; count: number; excellent: number }>()
  const mgrAgg = new Map<string, { sum: number; count: number; excellent: number }>()

  for (const review of reviews) {
    const emp = empMap.get(review.employeeId.toString())
    const dept = emp?.department ?? 'Unassigned'
    const d = deptAgg.get(dept) ?? { sum: 0, count: 0, excellent: 0 }
    d.sum += review.finalAdjustedScore ?? 0
    d.count += 1
    if (review.performanceLevel === 'excellent') d.excellent += 1
    deptAgg.set(dept, d)

    const managerId = emp?.managerId?.toString() ?? review.reviewerId.toString()
    const m = mgrAgg.get(managerId) ?? { sum: 0, count: 0, excellent: 0 }
    m.sum += review.finalAdjustedScore ?? 0
    m.count += 1
    if (review.performanceLevel === 'excellent') m.excellent += 1
    mgrAgg.set(managerId, m)
  }

  const managerIds = [...mgrAgg.keys()]
  const managers = await User.find({ _id: { $in: managerIds } }).select('fullName')
  const mgrNames = new Map(managers.map((m) => [m._id.toString(), m.fullName]))

  const byDepartment = Array.from(deptAgg.entries()).map(([department, data]) => ({
    department,
    avgScore: data.count === 0 ? 0 : Math.round((data.sum / data.count) * 10) / 10,
    excellentPct: data.count === 0 ? 0 : Math.round((data.excellent / data.count) * 100),
    count: data.count,
  }))

  const byManager = Array.from(mgrAgg.entries()).map(([managerId, data]) => ({
    managerId,
    managerName: mgrNames.get(managerId) ?? 'Unknown',
    avgScore: data.count === 0 ? 0 : Math.round((data.sum / data.count) * 10) / 10,
    excellentPct: data.count === 0 ? 0 : Math.round((data.excellent / data.count) * 100),
    count: data.count,
  }))

  const excellentPct = distribution.find((d) => d.level === 'excellent')?.pct ?? 0
  const warnings: string[] = []
  if (excellentPct > 40 && total >= 5) {
    warnings.push(`High Excellent share (${excellentPct}%). Consider calibration before cycle close.`)
  }
  for (const dept of byDepartment) {
    if (dept.excellentPct > 50 && dept.count >= 3) {
      warnings.push(`${dept.department}: ${dept.excellentPct}% Excellent — review distribution.`)
    }
  }

  return {
    totalReviews: total,
    avgScore: total === 0 ? 0 : Math.round((scoreSum / total) * 10) / 10,
    distribution,
    byDepartment,
    byManager,
    warnings,
  }
}

export function assertPermission(
  role: UserRole,
  permission: Permission,
  permissions: Permission[],
): void {
  if (!hasPermission(role, permission, permissions)) {
    throw new AppError(`Missing permission: ${permission}`, 403, 'FORBIDDEN')
  }
}
