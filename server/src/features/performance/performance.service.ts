import { Types } from 'mongoose'
import { AppError } from '../../utils/AppError.js'
import { buildPaginatedResult, parsePagination } from '../../utils/pagination.js'
import type { UserRole } from '../auth/auth.types.js'
import { User } from '../auth/user.model.js'
import { resolveActorFullName } from '../notifications/actor-name.js'
import { dispatchDomainEventSafe } from '../notifications/notification.service.js'
import { Project } from '../projects/project.model.js'
import { Task } from '../tasks/task.model.js'
import { KpiTemplate } from './kpi-template.model.js'
import { buildPerformanceActor, type PerformanceActor } from './performance-actor.js'
import {
  PerformanceReview,
  type IPerformanceReview,
  type PerformanceMetricsSnapshot,
} from './performance-review.model.js'
import {
  applyKpiFieldsToReview,
  buildRoiSnapshot,
  canViewRoi,
  resolveBusinessValueForEmployee,
  resolveEmployeeCost,
  writeBonusPenaltyAudit,
} from './performance-review-helpers.js'
import { resolvePerformanceStatus } from './performance-kpi.js'
import {
  comparableReviewMetrics,
  computeMetricsForRole,
  computeTrend,
  formatPeriodDate,
  getMonthBounds,
  getPreviousMonthBounds,
  parsePeriodStart,
  toMetricsSnapshot,
} from './performance-metrics.js'
import type {
  AnalyticsBundleDto,
  MyPerformanceDto,
  PerformanceDetailDto,
  PerformanceOptionsDto,
  PerformanceRecordDto,
  PerformanceReviewDto,
  PerformanceStatsDto,
  PerformanceStatus,
  PerformanceSummaryDto,
} from './performance.types.js'
import { DEPARTMENT_COLORS, RATING_DISTRIBUTION_COLORS } from './performance.types.js'
import type {
  CreatePerformanceReviewInput,
  ListPerformanceQuery,
  PerformanceAnalyticsQuery,
  UpdatePerformanceReviewInput,
} from './performance.validation.js'
import { listReviewAuditTrail } from './performance-extended.service.js'

export type { PerformanceActor }
export { buildPerformanceActor }

const RATEABLE_ROLES: UserRole[] = ['employee', 'manager']

function assertCompanyContext(acting: PerformanceActor): void {
  if (!acting.companyId) {
    throw new AppError('Company context required', 403, 'FORBIDDEN')
  }
}

async function getDirectReportIds(managerId: string, companyId: string): Promise<string[]> {
  const reports = await User.find({
    companyId,
    managerId: new Types.ObjectId(managerId),
  }).select('_id')
  return reports.map((user) => user._id.toString())
}

async function resolveScopedEmployeeIds(acting: PerformanceActor): Promise<string[] | 'all'> {
  if (acting.canManage || acting.role === 'admin' || acting.role === 'hr') {
    return 'all'
  }

  if (acting.role === 'manager') {
    const reportIds = await getDirectReportIds(acting.id, acting.companyId)
    return [acting.id, ...reportIds]
  }

  return [acting.id]
}

async function canAccessEmployee(acting: PerformanceActor, employeeId: string): Promise<boolean> {
  const subject = await User.findOne({ _id: employeeId, companyId: acting.companyId }).select('role')
  if (!subject) return false
  // Admins / HR / superadmins are never performance subjects
  if (subject.role === 'admin' || subject.role === 'superadmin' || subject.role === 'hr') {
    return false
  }
  const scoped = await resolveScopedEmployeeIds(acting)
  if (scoped === 'all') return true
  return scoped.includes(employeeId)
}

async function canReviewEmployee(acting: PerformanceActor, employeeId: string): Promise<boolean> {
  if (!acting.canWrite) return false
  if (employeeId === acting.id) return false

  const user = await User.findOne({ _id: employeeId, companyId: acting.companyId }).select(
    'role managerId',
  )
  if (!user) return false
  if (!RATEABLE_ROLES.includes(user.role as UserRole)) return false

  // Admin can review both managers and employees (and update existing ratings).
  if (acting.role === 'admin') {
    return user.role === 'manager' || user.role === 'employee'
  }

  // Managers review their direct-report employees only (never self / other managers).
  if (acting.role === 'manager') {
    return user.role === 'employee' && user.managerId?.toString() === acting.id
  }

  return false
}

export async function canActorReviewSubject(
  acting: PerformanceActor,
  employeeId: string,
): Promise<boolean> {
  return canReviewEmployee(acting, employeeId)
}

function formatRole(user: { role: string; customRoleId?: Types.ObjectId | null }): string {
  return user.role === 'employee' ? 'Employee' : user.role.charAt(0).toUpperCase() + user.role.slice(1)
}

async function toReviewDto(
  review: IPerformanceReview,
  reviewer?: { fullName: string; role: string; avatar?: string } | null,
  options?: { includeRoi?: boolean },
): Promise<PerformanceReviewDto> {
  let reviewerUser = reviewer
  if (!reviewerUser) {
    const user = await User.findById(review.reviewerId).select('fullName role avatar')
    reviewerUser = user
      ? { fullName: user.fullName, role: formatRole(user), avatar: user.avatar }
      : { fullName: 'Unknown', role: 'Reviewer' }
  }

  const snapshot = review.metricsSnapshot ?? {
    tasksCompleted: 0,
    tasksPending: 0,
    deadlinesMet: 0,
    attendance: 0,
    efficiency: 0,
  }

  let templateOutdated = Boolean(review.templateOutdated)
  if (review.kpiTemplateSnapshot?.role) {
    const active = await KpiTemplate.findOne({
      companyId: review.companyId,
      role: review.kpiTemplateSnapshot.role,
      isActive: true,
    }).select('_id')
    templateOutdated =
      !active || active._id.toString() !== (review.kpiTemplateId?.toString() ?? '')
  }

  return {
    id: review._id.toString(),
    employeeId: review.employeeId.toString(),
    reviewerId: review.reviewerId.toString(),
    reviewerName: reviewerUser.fullName,
    reviewerRole: reviewerUser.role,
    reviewerAvatar: reviewerUser.avatar,
    rating: review.rating,
    periodStart: formatPeriodDate(review.periodStart),
    periodEnd: formatPeriodDate(review.periodEnd),
    periodLabel: review.periodLabel,
    period: review.periodLabel,
    feedback: review.feedback,
    status: review.status,
    tasksCompleted: snapshot.tasksCompleted,
    tasksPending: snapshot.tasksPending,
    attendance: snapshot.attendance,
    efficiency: snapshot.efficiency,
    deadlinesMet: snapshot.deadlinesMet,
    createdAt: review.createdAt.toISOString(),
    cycleId: review.cycleId?.toString() ?? null,
    kpiTemplateId: review.kpiTemplateId?.toString() ?? null,
    kpiTemplateSnapshot: review.kpiTemplateSnapshot ?? null,
    kpiScores: (review.kpiScores ?? []).map((s) => ({
      subKpiId: s.subKpiId,
      marksObtained: s.marksObtained,
      remarks: s.remarks ?? '',
    })),
    categoryScores: (review.categoryScores ?? []).map((c) => ({
      name: c.name,
      maxMarks: c.maxMarks,
      obtained: c.obtained,
    })),
    totalScore: review.totalScore ?? null,
    bonus: review.bonus ?? 0,
    penalty: review.penalty ?? 0,
    bonusPenaltyNote: review.bonusPenaltyNote ?? '',
    finalAdjustedScore: review.finalAdjustedScore ?? null,
    performanceLevel: review.performanceLevel ?? null,
    roi: options?.includeRoi === false ? null : review.roi ?? null,
    templateOutdated,
  }
}

function monthPeriodMatchers(periodStart: Date): Date[] {
  const utcStart = parsePeriodStart(periodStart)
  const legacyLocalStart = new Date(utcStart.getUTCFullYear(), utcStart.getUTCMonth(), 1)
  if (legacyLocalStart.getTime() === utcStart.getTime()) return [utcStart]
  return [utcStart, legacyLocalStart]
}

async function getSubmittedReview(
  companyId: string,
  employeeId: string,
  periodStart: Date,
): Promise<IPerformanceReview | null> {
  return PerformanceReview.findOne({
    companyId,
    employeeId,
    periodStart: { $in: monthPeriodMatchers(periodStart) },
    status: 'submitted',
  })
}

async function getReviewForPeriod(
  companyId: string,
  employeeId: string,
  periodStart: Date,
  acting: PerformanceActor,
): Promise<IPerformanceReview | null> {
  const filter: Record<string, unknown> = {
    companyId,
    employeeId,
    periodStart: { $in: monthPeriodMatchers(periodStart) },
  }
  if (!acting.canManage && acting.role !== 'admin') {
    filter.$or = [{ status: 'submitted' }, { reviewerId: acting.id }]
  } else if (acting.role === 'employee') {
    filter.status = 'submitted'
  }
  return PerformanceReview.findOne(filter).sort({ updatedAt: -1 })
}

async function countPreviousPeriodOutput(
  companyObjectId: Types.ObjectId,
  userObjectId: Types.ObjectId,
  role: UserRole,
  periodStart: Date,
  periodEnd: Date,
): Promise<number> {
  // Managers' header shows project totals (not period-scoped); use team task volume for MoM.
  if (role === 'manager') {
    const reports = await User.find({
      companyId: companyObjectId,
      managerId: userObjectId,
      role: 'employee',
      status: 'active',
    }).select('_id')
    const reportIds = reports.map((r) => r._id)
    if (reportIds.length === 0) return 0
    return Task.countDocuments({
      companyId: companyObjectId,
      assigneeId: { $in: reportIds },
      status: 'done',
      updatedAt: { $gte: periodStart, $lte: periodEnd },
    })
  }

  return Task.countDocuments({
    companyId: companyObjectId,
    assigneeId: userObjectId,
    status: 'done',
    updatedAt: { $gte: periodStart, $lte: periodEnd },
  })
}

type ScopedPerformanceUser = {
  _id: Types.ObjectId
  fullName: string
  email: string
  avatar?: string
  role: UserRole
  department?: string
  managerId?: Types.ObjectId | null
}

function utcMonthKey(date: Date): string {
  const d = parsePeriodStart(date)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

function periodMatchersForRange(fromMonth: Date, toMonth: Date): Date[] {
  const matchers: Date[] = []
  const cursor = new Date(Date.UTC(fromMonth.getUTCFullYear(), fromMonth.getUTCMonth(), 1))
  const end = new Date(Date.UTC(toMonth.getUTCFullYear(), toMonth.getUTCMonth(), 1))
  while (cursor.getTime() <= end.getTime()) {
    matchers.push(...monthPeriodMatchers(cursor))
    cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  }
  return matchers
}

function pickLatestReviewByEmployeeMonth(
  reviews: Array<Pick<
    IPerformanceReview,
    | 'employeeId'
    | 'periodStart'
    | 'updatedAt'
    | 'rating'
    | 'finalAdjustedScore'
    | 'performanceLevel'
    | 'roi'
    | 'templateOutdated'
    | 'categoryScores'
  >>,
): Map<string, (typeof reviews)[number]> {
  const map = new Map<string, (typeof reviews)[number]>()
  for (const review of reviews) {
    const key = `${review.employeeId.toString()}:${utcMonthKey(review.periodStart)}`
    const existing = map.get(key)
    if (!existing || existing.updatedAt < review.updatedAt) {
      map.set(key, review)
    }
  }
  return map
}

function lightweightPerformanceRecord(
  user: ScopedPerformanceUser,
  review?: {
    rating?: number | null
    finalAdjustedScore?: number | null
    performanceLevel?: string | null
    roi?: { roiIndex?: number | null } | null
    templateOutdated?: boolean
  } | null,
): PerformanceRecordDto {
  const rating = review?.rating ?? null
  const finalAdjustedScore = review?.finalAdjustedScore ?? null
  return {
    employeeId: user._id.toString(),
    employeeName: user.fullName,
    employeeEmail: user.email,
    employeeAvatar: user.avatar,
    role: formatRole(user),
    department: user.department ?? 'Unassigned',
    rating,
    finalAdjustedScore,
    performanceLevel: (review?.performanceLevel as PerformanceRecordDto['performanceLevel']) ?? null,
    tasksCompleted: 0,
    tasksPending: 0,
    efficiency: 0,
    attendance: 0,
    deadlinesMet: 0,
    status: resolvePerformanceStatus({ finalAdjustedScore, rating }),
    trend: 0,
    roiIndex: review?.roi?.roiIndex ?? null,
    templateOutdated: Boolean(review?.templateOutdated),
  }
}

async function enrichPerformanceRecord(
  record: PerformanceRecordDto,
  user: ScopedPerformanceUser,
  companyId: string,
  periodStart: Date,
  periodEnd: Date,
): Promise<PerformanceRecordDto> {
  const companyObjectId = new Types.ObjectId(companyId)
  const prevBounds = getPreviousMonthBounds(periodStart)
  const [metrics, previousOutput] = await Promise.all([
    computeMetricsForRole(user._id.toString(), companyId, user.role, periodStart, periodEnd),
    countPreviousPeriodOutput(
      companyObjectId,
      user._id,
      user.role,
      prevBounds.periodStart,
      prevBounds.periodEnd,
    ),
  ])

  return {
    ...record,
    tasksCompleted: metrics.tasksCompleted,
    tasksPending: metrics.tasksPending,
    efficiency: metrics.efficiency,
    attendance: metrics.attendance,
    deadlinesMet: metrics.deadlinesMet,
    trend: computeTrend(metrics.tasksCompleted, previousOutput),
  }
}

async function buildPerformanceRecord(
  user: ScopedPerformanceUser,
  companyId: string,
  periodStart: Date,
  periodEnd: Date,
): Promise<PerformanceRecordDto> {
  const currentReview = await getSubmittedReview(companyId, user._id.toString(), periodStart)
  const light = lightweightPerformanceRecord(user, currentReview)
  return enrichPerformanceRecord(light, user, companyId, periodStart, periodEnd)
}

function applyRatingFilter(records: PerformanceRecordDto[], rating?: string): PerformanceRecordDto[] {
  if (!rating || rating === 'all' || rating === 'Any Rating') return records
  return records.filter((record) => {
    if (record.rating == null) return false
    if (rating === '4+') return record.rating >= 4
    if (rating === '3-4') return record.rating >= 3 && record.rating < 4
    if (rating === 'below3') return record.rating < 3
    return true
  })
}

function applyStatusFilter(records: PerformanceRecordDto[], status?: string): PerformanceRecordDto[] {
  if (!status || status === 'all') return records
  return records.filter((record) => record.status === status)
}

function applySearchFilter(records: PerformanceRecordDto[], search?: string): PerformanceRecordDto[] {
  if (!search?.trim()) return records
  const term = search.trim().toLowerCase()
  return records.filter((record) => {
    const haystack = `${record.employeeName} ${record.employeeEmail} ${record.role} ${record.department}`.toLowerCase()
    return haystack.includes(term)
  })
}

async function getScopedUsers(
  acting: PerformanceActor,
  filters: { department?: string; managerId?: string },
): Promise<ScopedPerformanceUser[]> {
  const query: Record<string, unknown> = {
    companyId: acting.companyId,
    role: { $in: RATEABLE_ROLES },
    status: 'active',
  }

  // Managers manage a team list of direct-report employees only (not themselves).
  if (acting.role === 'manager') {
    const reportIds = await getDirectReportIds(acting.id, acting.companyId)
    query._id = { $in: reportIds.map((id) => new Types.ObjectId(id)) }
    query.role = 'employee'
  } else if (acting.role === 'employee') {
    query._id = new Types.ObjectId(acting.id)
  } else {
    // Admin / HR: company-wide employees + managers (never admin/hr subjects)
    const scoped = await resolveScopedEmployeeIds(acting)
    if (scoped !== 'all') {
      query._id = { $in: scoped.map((id) => new Types.ObjectId(id)) }
    }
  }

  if (filters.department && filters.department !== 'All Departments') {
    query.department = filters.department
  }

  if (filters.managerId && filters.managerId !== 'all') {
    query.managerId = new Types.ObjectId(filters.managerId)
  }

  return User.find(query)
    .select('fullName email avatar role department managerId')
    .sort({ fullName: 1 })
    .lean()
}

export async function listPerformanceRecords(acting: PerformanceActor, query: ListPerformanceQuery) {
  assertCompanyContext(acting)
  const { page, limit, skip } = parsePagination(query)
  const periodStart = parsePeriodStart(query.periodStart)
  const { periodEnd } = getMonthBounds(periodStart)
  const currentMonthKey = utcMonthKey(periodStart)

  const users = await getScopedUsers(acting, {
    department: query.department,
    managerId: query.managerId,
  })

  const reviews =
    users.length === 0
      ? []
      : await PerformanceReview.find({
          companyId: acting.companyId,
          status: 'submitted',
          employeeId: { $in: users.map((u) => u._id) },
          periodStart: { $in: monthPeriodMatchers(periodStart) },
        })
          .select(
            'employeeId periodStart updatedAt rating finalAdjustedScore performanceLevel roi templateOutdated',
          )
          .lean()

  const reviewByEmployeeMonth = pickLatestReviewByEmployeeMonth(reviews)
  const userById = new Map(users.map((u) => [u._id.toString(), u]))

  let records = users.map((user) => {
    const review = reviewByEmployeeMonth.get(`${user._id.toString()}:${currentMonthKey}`)
    return lightweightPerformanceRecord(user, review)
  })

  records = applySearchFilter(records, query.search)
  records = applyRatingFilter(records, query.rating)
  records = applyStatusFilter(records, query.status)
  records.sort(
    (a, b) =>
      (b.finalAdjustedScore ?? (b.rating ?? 0) * 20) - (a.finalAdjustedScore ?? (a.rating ?? 0) * 20),
  )

  const total = records.length
  const pageItems = records.slice(skip, skip + limit)
  const enriched = await Promise.all(
    pageItems.map(async (record) => {
      const user = userById.get(record.employeeId)
      if (!user) return record
      return enrichPerformanceRecord(record, user, acting.companyId, periodStart, periodEnd)
    }),
  )

  return buildPaginatedResult(enriched, total, page, limit)
}

export async function getPerformanceStats(
  acting: PerformanceActor,
  periodStartInput?: string,
): Promise<PerformanceStatsDto> {
  assertCompanyContext(acting)
  const periodStart = parsePeriodStart(periodStartInput)
  const prevBounds = getPreviousMonthBounds(periodStart)
  const trendStart = new Date(Date.UTC(periodStart.getUTCFullYear(), periodStart.getUTCMonth() - 5, 1))
  const currentMonthKey = utcMonthKey(periodStart)
  const prevMonthKey = utcMonthKey(prevBounds.periodStart)

  const users = await getScopedUsers(acting, {})
  const employeeIds = users.map((u) => u._id)

  const reviews =
    employeeIds.length === 0
      ? []
      : await PerformanceReview.find({
          companyId: acting.companyId,
          status: 'submitted',
          employeeId: { $in: employeeIds },
          periodStart: { $in: periodMatchersForRange(trendStart, periodStart) },
        })
          .select(
            'employeeId periodStart updatedAt rating finalAdjustedScore performanceLevel roi templateOutdated categoryScores',
          )
          .lean()

  const reviewByEmployeeMonth = pickLatestReviewByEmployeeMonth(reviews)

  const records = users.map((user) => {
    const review = reviewByEmployeeMonth.get(`${user._id.toString()}:${currentMonthKey}`)
    return lightweightPerformanceRecord(user, review)
  })

  const ratedRecords = records.filter((r) => r.rating != null || r.finalAdjustedScore != null)
  const avgRating =
    ratedRecords.length === 0
      ? 0
      : Math.round(
          (ratedRecords.reduce((sum, r) => sum + (r.rating ?? 0), 0) /
            Math.max(ratedRecords.filter((r) => r.rating != null).length, 1)) *
            10,
        ) / 10

  const scoredRecords = records.filter((r) => r.finalAdjustedScore != null)
  const avgScore =
    scoredRecords.length === 0
      ? 0
      : Math.round(
          (scoredRecords.reduce((sum, r) => sum + (r.finalAdjustedScore ?? 0), 0) /
            scoredRecords.length) *
            10,
        ) / 10

  const roiRecords = records.filter((r) => r.roiIndex != null)
  const avgRoiIndex =
    roiRecords.length === 0
      ? 0
      : Math.round(
          (roiRecords.reduce((sum, r) => sum + (r.roiIndex ?? 0), 0) / roiRecords.length) * 10,
        ) / 10

  const prevPrimaryValues: number[] = []
  for (const user of users) {
    const review = reviewByEmployeeMonth.get(`${user._id.toString()}:${prevMonthKey}`)
    if (!review) continue
    if (review.finalAdjustedScore != null) prevPrimaryValues.push(review.finalAdjustedScore)
    else if (review.rating != null) prevPrimaryValues.push(review.rating * 20)
  }
  const prevAvg =
    prevPrimaryValues.length === 0
      ? 0
      : prevPrimaryValues.reduce((sum, v) => sum + v, 0) / prevPrimaryValues.length
  const currentPrimary = scoredRecords.length > 0 ? avgScore : avgRating * 20
  const avgRatingChange =
    prevAvg === 0 ? 0 : Math.round(((currentPrimary - prevAvg) / prevAvg) * 1000) / 10

  const topPerformer =
    [...records]
      .sort(
        (a, b) =>
          (b.finalAdjustedScore ?? (b.rating ?? 0) * 20) -
          (a.finalAdjustedScore ?? (a.rating ?? 0) * 20),
      )[0]?.employeeName ?? '—'

  const reviewsDue = records.filter((r) => r.rating == null && r.finalAdjustedScore == null).length
  const lowPerformance = records.filter(
    (r) =>
      r.status === 'critical' ||
      r.status === 'average' ||
      r.status === 'needs_improvement' ||
      r.status === 'poor',
  ).length

  const monthlyTrendData: PerformanceStatsDto['monthlyTrendData'] = []
  for (let i = 5; i >= 0; i -= 1) {
    const monthDate = new Date(Date.UTC(periodStart.getUTCFullYear(), periodStart.getUTCMonth() - i, 1))
    const bounds = getMonthBounds(monthDate)
    const monthKey = utcMonthKey(bounds.periodStart)
    let ratingSum = 0
    let ratingCount = 0
    let scoreSum = 0
    let scoreCount = 0
    for (const user of users) {
      const review = reviewByEmployeeMonth.get(`${user._id.toString()}:${monthKey}`)
      if (!review) continue
      if (review.rating != null) {
        ratingSum += review.rating
        ratingCount += 1
      }
      if (review.finalAdjustedScore != null) {
        scoreSum += review.finalAdjustedScore
        scoreCount += 1
      }
    }
    monthlyTrendData.push({
      month: bounds.periodLabel.split(' ')[0] ?? bounds.periodLabel,
      rating: ratingCount === 0 ? 0 : Math.round((ratingSum / ratingCount) * 10) / 10,
      score: scoreCount === 0 ? 0 : Math.round((scoreSum / scoreCount) * 10) / 10,
    })
  }

  const deptMap = new Map<string, { totalScore: number; scoreCount: number }>()
  for (const record of records) {
    const dept = record.department
    const entry = deptMap.get(dept) ?? { totalScore: 0, scoreCount: 0 }
    if (record.finalAdjustedScore != null) {
      entry.totalScore += record.finalAdjustedScore
      entry.scoreCount += 1
    } else if (record.rating != null) {
      entry.totalScore += record.rating * 20
      entry.scoreCount += 1
    }
    deptMap.set(dept, entry)
  }

  const departmentPerformance = Array.from(deptMap.entries())
    .map(([name, data], index) => ({
      name,
      score: data.scoreCount === 0 ? 0 : Math.round(data.totalScore / data.scoreCount),
      color: DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length] ?? '#64748B',
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)

  const categoryAcc = new Map<string, { obtained: number; maxMarks: number; count: number }>()
  for (const user of users) {
    const review = reviewByEmployeeMonth.get(`${user._id.toString()}:${currentMonthKey}`)
    if (!review) continue
    for (const cat of review.categoryScores ?? []) {
      const entry = categoryAcc.get(cat.name) ?? { obtained: 0, maxMarks: cat.maxMarks, count: 0 }
      entry.obtained += cat.obtained
      entry.maxMarks = cat.maxMarks
      entry.count += 1
      categoryAcc.set(cat.name, entry)
    }
  }

  const categoryBenchmarks = Array.from(categoryAcc.entries()).map(([name, data]) => ({
    name,
    avgObtained: data.count === 0 ? 0 : Math.round((data.obtained / data.count) * 10) / 10,
    maxMarks: data.maxMarks,
  }))

  return {
    avgRating,
    avgScore,
    avgRatingChange,
    avgRoiIndex,
    topPerformer,
    reviewsDue,
    lowPerformance,
    monthlyTrendData,
    departmentPerformance,
    categoryBenchmarks,
  }
}

export async function getPerformanceAnalytics(
  acting: PerformanceActor,
  query: PerformanceAnalyticsQuery,
): Promise<AnalyticsBundleDto> {
  assertCompanyContext(acting)
  const periodStart = parsePeriodStart(query.periodStart)
  const { periodEnd } = getMonthBounds(periodStart)
  const prevBounds = getPreviousMonthBounds(periodStart)

  const users = await getScopedUsers(acting, {
    department: query.department,
    managerId: query.managerId,
  })

  let records = await Promise.all(
    users.map((user) => buildPerformanceRecord(user, acting.companyId, periodStart, periodEnd)),
  )

  records = applyRatingFilter(records, query.ratingRange)
  records = applySearchFilter(records, query.search)

  const ratedRecords = records.filter((r) => r.rating != null)
  const avgRating =
    ratedRecords.length === 0
      ? 0
      : Math.round((ratedRecords.reduce((sum, r) => sum + (r.rating ?? 0), 0) / ratedRecords.length) * 10) / 10

  const overallEfficiency =
    records.length === 0
      ? 0
      : Math.round(records.reduce((sum, r) => sum + r.efficiency, 0) / records.length * 10) / 10

  const prevRecords = await Promise.all(
    users.map((user) =>
      buildPerformanceRecord(user, acting.companyId, prevBounds.periodStart, prevBounds.periodEnd),
    ),
  )
  const prevEfficiency =
    prevRecords.length === 0
      ? 0
      : prevRecords.reduce((sum, r) => sum + r.efficiency, 0) / prevRecords.length
  const efficiencyChange =
    prevEfficiency === 0 ? 0 : Math.round(((overallEfficiency - prevEfficiency) / prevEfficiency) * 1000) / 10

  const submittedCount = ratedRecords.length
  const reviewCompletion =
    records.length === 0 ? 0 : Math.round((submittedCount / records.length) * 100)

  const deptEfficiency = new Map<string, { total: number; count: number; totalRating: number; rated: number }>()
  for (const record of records) {
    const entry = deptEfficiency.get(record.department) ?? { total: 0, count: 0, totalRating: 0, rated: 0 }
    entry.total += record.efficiency
    entry.count += 1
    if (record.rating != null) {
      entry.totalRating += record.rating
      entry.rated += 1
    }
    deptEfficiency.set(record.department, entry)
  }

  const departmentRatings = Array.from(deptEfficiency.entries())
    .map(([name, data], index) => ({
      name,
      rating:
        data.rated === 0 ? 0 : Math.round((data.totalRating / data.rated) * 10) / 10,
      color: DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length] ?? '#64748B',
    }))
    .sort((a, b) => b.rating - a.rating)

  const topDept = departmentRatings[0]
  const topDepartment = topDept?.name ?? '—'
  const topDepartmentEfficiency = topDept
    ? Math.round((deptEfficiency.get(topDept.name)?.total ?? 0) / Math.max(deptEfficiency.get(topDept.name)?.count ?? 1, 1))
    : 0

  const analyticsTrendData: AnalyticsBundleDto['analyticsTrendData'] = []
  for (let i = 5; i >= 0; i -= 1) {
    const monthDate = new Date(Date.UTC(periodStart.getUTCFullYear(), periodStart.getUTCMonth() - i, 1))
    const bounds = getMonthBounds(monthDate)
    const monthRecords = await Promise.all(
      users.map((user) =>
        buildPerformanceRecord(user, acting.companyId, bounds.periodStart, bounds.periodEnd),
      ),
    )
    const avg =
      monthRecords.length === 0
        ? 0
        : monthRecords.reduce((sum, r) => sum + r.efficiency, 0) / monthRecords.length
    analyticsTrendData.push({
      month: bounds.periodLabel.split(' ')[0] ?? bounds.periodLabel,
      value: Math.round(avg * 10) / 10,
    })
  }

  const fiveStar = ratedRecords.filter((r) => (r.rating ?? 0) >= 4.5).length
  const fourStar = ratedRecords.filter((r) => (r.rating ?? 0) >= 4 && (r.rating ?? 0) < 4.5).length
  const belowFour = ratedRecords.filter((r) => (r.rating ?? 0) < 4).length
  const totalRated = ratedRecords.length || 1
  const ratingDistribution = [
    { name: '5 Stars', value: Math.round((fiveStar / totalRated) * 100), color: RATING_DISTRIBUTION_COLORS[0]! },
    { name: '4 Stars', value: Math.round((fourStar / totalRated) * 100), color: RATING_DISTRIBUTION_COLORS[1]! },
    { name: '3 Stars or less', value: Math.round((belowFour / totalRated) * 100), color: RATING_DISTRIBUTION_COLORS[2]! },
  ]

  const weeksInMonth = 4
  const productivityData = Array.from({ length: weeksInMonth }, (_, index) => {
    const weekRecords = records.slice(
      Math.floor((index / weeksInMonth) * records.length),
      Math.floor(((index + 1) / weeksInMonth) * records.length),
    )
    const avgEff =
      weekRecords.length === 0
        ? 0
        : weekRecords.reduce((sum, r) => sum + r.efficiency, 0) / weekRecords.length
    const avgAtt =
      weekRecords.length === 0
        ? 0
        : weekRecords.reduce((sum, r) => sum + r.attendance, 0) / weekRecords.length
    return {
      week: `WK ${index + 1}`,
      efficiency: Math.round(avgEff),
      attendance: Math.round(avgAtt),
    }
  })

  const topDepartmentPerformers = departmentRatings.slice(0, 3).map((dept, index) => {
    const deptUsers = users.filter((u) => u.department === dept.name)
    const head = deptUsers[0]?.fullName ?? '—'
    const deptRecords = records.filter((r) => r.department === dept.name)
    const avgEff =
      deptRecords.length === 0
        ? 0
        : deptRecords.reduce((sum, r) => sum + r.efficiency, 0) / deptRecords.length
    const status: PerformanceStatus =
      dept.rating >= 4.5 ? 'excellent' : dept.rating >= 4 ? 'good' : 'average'
    return {
      id: String(index + 1),
      department: dept.name,
      head,
      rating: dept.rating,
      efficiency: Math.round(avgEff),
      status,
    }
  })

  const totalReviews = await PerformanceReview.countDocuments({
    companyId: acting.companyId,
    status: 'submitted',
    periodStart,
  })

  const includeRoi = canViewRoi(acting.role, acting.permissions)
  const submittedReviews = await PerformanceReview.find({
    companyId: acting.companyId,
    status: 'submitted',
    periodStart,
    employeeId: { $in: users.map((u) => u._id) },
  }).select('categoryScores roi finalAdjustedScore employeeId kpiTemplateId templateOutdated')

  const categoryAcc = new Map<string, { obtained: number; maxMarks: number; count: number }>()
  for (const review of submittedReviews) {
    for (const cat of review.categoryScores ?? []) {
      const entry = categoryAcc.get(cat.name) ?? { obtained: 0, maxMarks: cat.maxMarks, count: 0 }
      entry.obtained += cat.obtained
      entry.maxMarks = cat.maxMarks
      entry.count += 1
      categoryAcc.set(cat.name, entry)
    }
  }
  const categoryBenchmarks = Array.from(categoryAcc.entries()).map(([name, data]) => ({
    name,
    avgObtained: data.count === 0 ? 0 : Math.round((data.obtained / data.count) * 10) / 10,
    maxMarks: data.maxMarks,
  }))

  const nameById = new Map(users.map((u) => [u._id.toString(), u]))
  const valueLeaderboard = includeRoi
    ? submittedReviews
        .filter((r) => r.roi?.roiIndex != null)
        .map((r) => {
          const emp = nameById.get(r.employeeId.toString())
          return {
            employeeId: r.employeeId.toString(),
            employeeName: emp?.fullName ?? 'Unknown',
            department: emp?.department ?? 'Unassigned',
            roiIndex: r.roi?.roiIndex ?? 0,
            finalAdjustedScore: r.finalAdjustedScore ?? null,
          }
        })
        .sort((a, b) => b.roiIndex - a.roiIndex)
        .slice(0, 10)
    : []

  const outdatedTemplateCount = submittedReviews.filter((r) => r.templateOutdated).length

  return {
    overallEfficiency,
    efficiencyChange,
    reviewCompletion,
    avgRating,
    topDepartment,
    topDepartmentEfficiency,
    analyticsTrendData,
    departmentRatings,
    ratingDistribution,
    productivityData,
    topDepartmentPerformers,
    totalReviews,
    categoryBenchmarks,
    valueLeaderboard,
    outdatedTemplateCount,
  }
}

export async function getPerformanceOptions(acting: PerformanceActor): Promise<PerformanceOptionsDto> {
  assertCompanyContext(acting)
  const users = await getScopedUsers(acting, {})

  const departments = [
    'All Departments',
    ...Array.from(new Set(users.map((u) => u.department).filter(Boolean) as string[])).sort(),
  ]

  const managerIds = new Set(users.map((u) => u.managerId?.toString()).filter(Boolean) as string[])
  const managers = await User.find({
    _id: { $in: Array.from(managerIds).map((id) => new Types.ObjectId(id)) },
    companyId: acting.companyId,
  }).select('fullName')

  const periods: PerformanceOptionsDto['periods'] = []
  const now = new Date()
  for (let i = 0; i < 12; i += 1) {
    // Build from UTC calendar month so labels never shift with server local TZ.
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
    const bounds = getMonthBounds(date)
    periods.push({
      periodStart: formatPeriodDate(bounds.periodStart),
      periodEnd: formatPeriodDate(bounds.periodEnd),
      periodLabel: bounds.periodLabel,
    })
  }

  return {
    departments,
    managers: [{ id: 'all', name: 'All Managers' }, ...managers.map((m) => ({ id: m._id.toString(), name: m.fullName }))],
    periods,
  }
}

export async function getEmployeePerformanceDetail(
  acting: PerformanceActor,
  employeeId: string,
  periodStartInput?: string,
): Promise<PerformanceDetailDto> {
  assertCompanyContext(acting)
  if (!(await canAccessEmployee(acting, employeeId))) {
    throw new AppError('You do not have access to this employee', 403, 'FORBIDDEN')
  }

  const user = await User.findOne({ _id: employeeId, companyId: acting.companyId })
  if (!user) throw new AppError('Employee not found', 404, 'NOT_FOUND')

  const periodStart = parsePeriodStart(periodStartInput)
  const { periodEnd } = getMonthBounds(periodStart)
  const record = await buildPerformanceRecord(user, acting.companyId, periodStart, periodEnd)
  const metrics = await computeMetricsForRole(
    employeeId,
    acting.companyId,
    user.role,
    periodStart,
    periodEnd,
  )

  const includeRoi = canViewRoi(acting.role, acting.permissions)
  const latestReviewDoc = await getReviewForPeriod(acting.companyId, employeeId, periodStart, acting)
  const managerReview = latestReviewDoc
    ? await toReviewDto(latestReviewDoc, null, { includeRoi })
    : null

  const recentReviewDocs = await PerformanceReview.find({
    companyId: acting.companyId,
    employeeId,
    status: 'submitted',
  })
    .sort({ periodStart: -1 })
    .limit(5)

  const recentReviews = await Promise.all(
    recentReviewDocs.map((doc) => toReviewDto(doc, null, { includeRoi })),
  )

  const trendData: PerformanceDetailDto['trendData'] = []
  for (let i = 6; i >= 0; i -= 1) {
    const monthDate = new Date(Date.UTC(periodStart.getUTCFullYear(), periodStart.getUTCMonth() - i, 1))
    const bounds = getMonthBounds(monthDate)
    const review = await getSubmittedReview(acting.companyId, employeeId, bounds.periodStart)
    trendData.push({
      month: bounds.periodLabel.split(' ')[0] ?? bounds.periodLabel,
      current: review?.finalAdjustedScore ?? (review?.rating != null ? review.rating * 20 : 0),
      goal: 75,
    })
  }

  const auditTrail =
    latestReviewDoc && (acting.role === 'admin' || acting.role === 'hr' || acting.role === 'manager')
      ? await listReviewAuditTrail(acting, latestReviewDoc._id.toString())
      : []

  return {
    ...record,
    managerReview,
    recentReviews: recentReviews.filter((r) => r.id !== managerReview?.id),
    trendData,
    canReview: await canReviewEmployee(acting, employeeId),
    subjectRole: user.role,
    breakdown: metrics.breakdown,
    projectsCompleted: metrics.projectsCompleted,
    projectsTotal: metrics.projectsTotal,
    categoryScores: managerReview?.categoryScores ?? [],
    roi: includeRoi ? managerReview?.roi ?? null : null,
    bonusPenaltyNote: managerReview?.bonusPenaltyNote ?? '',
    auditTrail,
    avgProjectProgress: metrics.avgProjectProgress,
    milestoneCompletion: metrics.milestoneCompletion,
  }
}

export async function getEmployeeMetrics(
  acting: PerformanceActor,
  employeeId: string,
  periodStartInput?: string,
) {
  assertCompanyContext(acting)
  if (!(await canAccessEmployee(acting, employeeId))) {
    throw new AppError('You do not have access to this employee', 403, 'FORBIDDEN')
  }

  const periodStart = parsePeriodStart(periodStartInput)
  const { periodEnd, periodLabel } = getMonthBounds(periodStart)
  const subject = await User.findOne({ _id: employeeId, companyId: acting.companyId }).select('role')
  if (!subject) throw new AppError('Employee not found', 404, 'NOT_FOUND')

  const metrics = await computeMetricsForRole(
    employeeId,
    acting.companyId,
    subject.role,
    periodStart,
    periodEnd,
  )

  return {
    ...metrics,
    periodStart: formatPeriodDate(periodStart),
    periodEnd: formatPeriodDate(periodEnd),
    periodLabel,
  }
}

export async function listEmployeeReviews(
  acting: PerformanceActor,
  employeeId: string,
  page = 1,
  limit = 20,
) {
  assertCompanyContext(acting)
  if (!(await canAccessEmployee(acting, employeeId))) {
    throw new AppError('You do not have access to this employee', 403, 'FORBIDDEN')
  }

  const skip = (page - 1) * limit
  const filter: Record<string, unknown> = {
    companyId: acting.companyId,
    employeeId,
  }
  if (acting.role === 'employee') {
    filter.status = 'submitted'
  } else if (!acting.canManage && acting.role !== 'admin') {
    filter.$or = [{ status: 'submitted' }, { reviewerId: acting.id }]
  }

  const [docs, total] = await Promise.all([
    PerformanceReview.find(filter).sort({ periodStart: -1 }).skip(skip).limit(limit),
    PerformanceReview.countDocuments(filter),
  ])

  const reviews = await Promise.all(docs.map((doc) => toReviewDto(doc)))
  return buildPaginatedResult(reviews, total, page, limit)
}

export async function getReviewById(acting: PerformanceActor, reviewId: string): Promise<PerformanceReviewDto> {
  assertCompanyContext(acting)
  const review = await PerformanceReview.findOne({ _id: reviewId, companyId: acting.companyId })
  if (!review) throw new AppError('Review not found', 404, 'NOT_FOUND')

  if (!(await canAccessEmployee(acting, review.employeeId.toString()))) {
    throw new AppError('You do not have access to this review', 403, 'FORBIDDEN')
  }

  if (review.status === 'draft' && review.reviewerId.toString() !== acting.id && acting.role !== 'admin') {
    throw new AppError('You do not have access to this draft review', 403, 'FORBIDDEN')
  }

  if (acting.role === 'employee' && review.status !== 'submitted') {
    throw new AppError('You do not have access to this review', 403, 'FORBIDDEN')
  }

  return toReviewDto(review, null, {
    includeRoi: canViewRoi(acting.role, acting.permissions) && acting.role !== 'employee',
  })
}

export async function createPerformanceReview(
  acting: PerformanceActor,
  employeeId: string,
  input: CreatePerformanceReviewInput,
): Promise<PerformanceReviewDto> {
  assertCompanyContext(acting)
  if (!(await canReviewEmployee(acting, employeeId))) {
    throw new AppError('You are not allowed to review this employee', 403, 'FORBIDDEN')
  }

  const employee = await User.findOne({ _id: employeeId, companyId: acting.companyId })
  if (!employee) throw new AppError('Employee not found', 404, 'NOT_FOUND')

  const periodStart = parsePeriodStart(input.periodStart)
  const { periodEnd, periodLabel } = getMonthBounds(periodStart)

  // Upsert by calendar month (also matches legacy local-timezone month starts).
  const existing = await PerformanceReview.findOne({
    companyId: acting.companyId,
    employeeId,
    periodStart: { $in: monthPeriodMatchers(periodStart) },
  })

  if (existing) {
    // Normalize any legacy local-timezone period key to UTC calendar month.
    existing.periodStart = periodStart
    existing.periodEnd = periodEnd
    existing.periodLabel = periodLabel
    await existing.save()
    return updatePerformanceReview(acting, existing._id.toString(), {
      rating: input.rating,
      feedback: input.feedback,
      status: input.status,
      cycleId: input.cycleId,
      kpiScores: input.kpiScores,
      bonus: input.bonus,
      penalty: input.penalty,
      bonusPenaltyNote: input.bonusPenaltyNote,
    })
  }

  let metricsSnapshot: PerformanceMetricsSnapshot = {
    tasksCompleted: 0,
    tasksPending: 0,
    deadlinesMet: 0,
    attendance: 0,
    efficiency: 0,
  }
  let metrics = null

  if (input.status === 'submitted') {
    metrics = await computeMetricsForRole(
      employeeId,
      acting.companyId,
      employee.role,
      periodStart,
      periodEnd,
    )
    metricsSnapshot = toMetricsSnapshot(metrics)
  }

  if (input.status === 'submitted' && (input.rating == null || !input.feedback?.trim())) {
    throw new AppError('Rating and feedback are required to submit a review', 400, 'VALIDATION_ERROR')
  }

  const review = new PerformanceReview({
    companyId: acting.companyId,
    employeeId,
    reviewerId: acting.id,
    periodStart,
    periodEnd,
    periodLabel,
    cycleId: input.cycleId,
    rating: input.rating ?? 1,
    feedback: input.feedback ?? '',
    status: input.status,
    metricsSnapshot,
    bonus: input.bonus ?? 0,
    penalty: input.penalty ?? 0,
    bonusPenaltyNote: input.bonusPenaltyNote ?? '',
  })

  if (input.kpiScores?.length || input.status === 'submitted') {
    await applyKpiFieldsToReview({
      review,
      companyId: acting.companyId,
      subjectRole: employee.role,
      kpiScores: input.kpiScores,
      bonus: input.bonus,
      penalty: input.penalty,
      bonusPenaltyNote: input.bonusPenaltyNote,
      requireScores: input.status === 'submitted',
    })
  }

  if (input.status === 'submitted' && review.finalAdjustedScore != null && metrics) {
    const [cost, businessValue] = await Promise.all([
      resolveEmployeeCost(acting.companyId, employeeId, periodStart),
      resolveBusinessValueForEmployee(acting.companyId, employeeId, periodStart, periodEnd),
    ])
    review.roi = buildRoiSnapshot({
      finalAdjustedScore: review.finalAdjustedScore,
      metrics,
      periodStart,
      periodEnd,
      cost,
      businessValue,
    })
  }

  await review.save()

  if ((review.bonus !== 0 || review.penalty !== 0) && review.bonusPenaltyNote) {
    await writeBonusPenaltyAudit({
      companyId: acting.companyId,
      reviewId: review._id.toString(),
      employeeId,
      actorId: acting.id,
      prevBonus: 0,
      prevPenalty: 0,
      nextBonus: review.bonus,
      nextPenalty: review.penalty,
      note: review.bonusPenaltyNote,
      prevScore: null,
      nextScore: review.finalAdjustedScore,
    })
  }

  await dispatchDomainEventSafe({
    type: 'performance.review_created',
    actor: {
      id: acting.id,
      fullName: await resolveActorFullName(acting.id),
      companyId: acting.companyId,
    },
    entityId: employeeId,
    subjectUserId: employeeId,
    context: {
      subjectName: employee.fullName,
      entityLabel: periodLabel,
      statusLabel: input.status,
    },
  })

  return toReviewDto(review, null, { includeRoi: canViewRoi(acting.role, acting.permissions) })
}

export async function updatePerformanceReview(
  acting: PerformanceActor,
  reviewId: string,
  input: UpdatePerformanceReviewInput,
): Promise<PerformanceReviewDto> {
  assertCompanyContext(acting)
  const review = await PerformanceReview.findOne({ _id: reviewId, companyId: acting.companyId })
  if (!review) throw new AppError('Review not found', 404, 'NOT_FOUND')

  const employeeId = review.employeeId.toString()
  // Admin/manager who can review this employee may update any of their monthly reviews.
  if (!(await canReviewEmployee(acting, employeeId))) {
    throw new AppError('You are not allowed to edit this review', 403, 'FORBIDDEN')
  }

  const prevBonus = review.bonus ?? 0
  const prevPenalty = review.penalty ?? 0
  const prevScore = review.finalAdjustedScore ?? null

  if (input.periodStart) {
    const periodStart = parsePeriodStart(input.periodStart)
    const { periodEnd, periodLabel } = getMonthBounds(periodStart)
    review.periodStart = periodStart
    review.periodEnd = periodEnd
    review.periodLabel = periodLabel
  }

  if (input.rating != null) review.rating = input.rating
  if (input.feedback != null) review.feedback = input.feedback
  if (input.status) review.status = input.status
  if (input.cycleId !== undefined) {
    review.cycleId = input.cycleId ? new Types.ObjectId(input.cycleId) : undefined
  }

  const nextStatus = input.status ?? review.status
  const subject = await User.findById(employeeId).select('role fullName')
  let metrics = null

  if (nextStatus === 'submitted') {
    if (!review.feedback.trim()) {
      throw new AppError('Feedback is required to submit a review', 400, 'VALIDATION_ERROR')
    }
    metrics = await computeMetricsForRole(
      employeeId,
      acting.companyId,
      subject?.role ?? 'employee',
      review.periodStart,
      review.periodEnd,
    )
    review.metricsSnapshot = toMetricsSnapshot(metrics)
  }

  if (
    input.kpiScores != null ||
    input.bonus != null ||
    input.penalty != null ||
    input.bonusPenaltyNote != null ||
    nextStatus === 'submitted'
  ) {
    await applyKpiFieldsToReview({
      review,
      companyId: acting.companyId,
      subjectRole: subject?.role ?? 'employee',
      kpiScores: input.kpiScores,
      bonus: input.bonus,
      penalty: input.penalty,
      bonusPenaltyNote: input.bonusPenaltyNote,
      requireScores: nextStatus === 'submitted',
    })
  }

  if (nextStatus === 'submitted' && review.finalAdjustedScore != null) {
    if (!metrics) {
      metrics = await computeMetricsForRole(
        employeeId,
        acting.companyId,
        subject?.role ?? 'employee',
        review.periodStart,
        review.periodEnd,
      )
    }
    const [cost, businessValue] = await Promise.all([
      resolveEmployeeCost(acting.companyId, employeeId, review.periodStart),
      resolveBusinessValueForEmployee(
        acting.companyId,
        employeeId,
        review.periodStart,
        review.periodEnd,
      ),
    ])
    review.roi = buildRoiSnapshot({
      finalAdjustedScore: review.finalAdjustedScore,
      metrics,
      periodStart: review.periodStart,
      periodEnd: review.periodEnd,
      cost,
      businessValue,
    })
  }

  await review.save()

  await writeBonusPenaltyAudit({
    companyId: acting.companyId,
    reviewId: review._id.toString(),
    employeeId,
    actorId: acting.id,
    prevBonus,
    prevPenalty,
    nextBonus: review.bonus ?? 0,
    nextPenalty: review.penalty ?? 0,
    note: review.bonusPenaltyNote ?? '',
    prevScore,
    nextScore: review.finalAdjustedScore,
  })

  await dispatchDomainEventSafe({
    type: 'performance.review_updated',
    actor: {
      id: acting.id,
      fullName: await resolveActorFullName(acting.id),
      companyId: acting.companyId,
    },
    entityId: employeeId,
    subjectUserId: employeeId,
    context: {
      subjectName: subject?.fullName,
      entityLabel: review.periodLabel,
      statusLabel: review.status,
    },
  })

  return toReviewDto(review, null, { includeRoi: canViewRoi(acting.role, acting.permissions) })
}

export async function getEmployeePerformanceSummary(
  acting: PerformanceActor,
  employeeId: string,
  periodStartInput?: string,
): Promise<PerformanceSummaryDto> {
  assertCompanyContext(acting)
  if (!(await canAccessEmployee(acting, employeeId))) {
    throw new AppError('You do not have access to this employee', 403, 'FORBIDDEN')
  }

  const periodStart = parsePeriodStart(periodStartInput)
  const { periodEnd } = getMonthBounds(periodStart)
  const subject = await User.findOne({ _id: employeeId, companyId: acting.companyId })
  if (!subject) throw new AppError('Employee not found', 404, 'NOT_FOUND')

  const [metrics, review, projectCount] = await Promise.all([
    computeMetricsForRole(employeeId, acting.companyId, subject.role, periodStart, periodEnd),
    getSubmittedReview(acting.companyId, employeeId, periodStart),
    subject.role === 'manager'
      ? Project.countDocuments({ companyId: acting.companyId, managerId: subject._id })
      : Project.countDocuments({
          companyId: acting.companyId,
          teamMemberIds: subject._id,
        }),
  ])

  const overallRating = review?.rating ?? null
  const finalAdjustedScore = review?.finalAdjustedScore ?? null
  const reviewPeriod = review?.periodLabel ?? getMonthBounds(periodStart).periodLabel

  return {
    overallRating,
    finalAdjustedScore,
    reviewPeriod,
    reviewTitle: review ? `${review.periodLabel} Performance Review` : 'No review yet',
    reviewText: review?.feedback ?? 'No review submitted for this period.',
    reviewStatus: review ? 'approved' : 'none',
    tasksCompleted: metrics.tasksCompleted,
    tasksPending: metrics.tasksPending,
    efficiency: metrics.efficiency,
    attendance: metrics.attendance,
    status: resolvePerformanceStatus({ finalAdjustedScore, rating: overallRating }),
    projects: projectCount,
  }
}

export async function getMyPerformance(
  acting: PerformanceActor,
  periodStartInput?: string,
): Promise<MyPerformanceDto> {
  assertCompanyContext(acting)

  if (acting.role === 'admin' || acting.role === 'superadmin' || acting.role === 'hr') {
    throw new AppError(
      'Personal performance is only available for employees and managers',
      403,
      'FORBIDDEN',
    )
  }

  if (acting.role !== 'employee' && acting.role !== 'manager') {
    throw new AppError('Personal performance is not available for your role', 403, 'FORBIDDEN')
  }

  const user = await User.findOne({ _id: acting.id, companyId: acting.companyId })
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND')

  const periodStart = parsePeriodStart(periodStartInput)
  const { periodEnd, periodLabel } = getMonthBounds(periodStart)
  const subjectRole = acting.role === 'manager' ? 'manager' : 'employee'

  const metrics = await computeMetricsForRole(
    acting.id,
    acting.companyId,
    subjectRole,
    periodStart,
    periodEnd,
  )

  const submittedFilter = {
    companyId: acting.companyId,
    employeeId: acting.id,
    status: 'submitted' as const,
  }

  const [currentReview, allSubmitted, recentReviewDocs] = await Promise.all([
    getSubmittedReview(acting.companyId, acting.id, periodStart),
    PerformanceReview.find(submittedFilter).select('rating finalAdjustedScore periodStart'),
    PerformanceReview.find(submittedFilter).sort({ periodStart: -1 }).limit(8),
  ])

  const ratings = allSubmitted.map((r) => r.rating).filter((r) => typeof r === 'number')
  const avgRating =
    ratings.length === 0
      ? null
      : Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) / 10

  const scores = allSubmitted
    .map((r) => r.finalAdjustedScore)
    .filter((s): s is number => typeof s === 'number')
  const avgScore =
    scores.length === 0
      ? null
      : Math.round((scores.reduce((sum, s) => sum + s, 0) / scores.length) * 10) / 10

  const prevBounds = getPreviousMonthBounds(periodStart)
  const [previousReview, currentMonthReview] = await Promise.all([
    getSubmittedReview(acting.companyId, acting.id, prevBounds.periodStart),
    getSubmittedReview(acting.companyId, acting.id, periodStart),
  ])
  const { current: comparableCurrent, previous: comparablePrevious } = comparableReviewMetrics(
    currentMonthReview,
    previousReview,
  )
  const avgRatingChange = computeTrend(comparableCurrent, comparablePrevious)

  const monthlyTrendData: MyPerformanceDto['monthlyTrendData'] = []
  for (let i = 5; i >= 0; i -= 1) {
    const monthDate = new Date(Date.UTC(periodStart.getUTCFullYear(), periodStart.getUTCMonth() - i, 1))
    const bounds = getMonthBounds(monthDate)
    const review = await getSubmittedReview(acting.companyId, acting.id, bounds.periodStart)
    monthlyTrendData.push({
      month: bounds.periodLabel.split(' ')[0] ?? bounds.periodLabel,
      rating: review?.rating ?? 0,
      score: review?.finalAdjustedScore ?? 0,
    })
  }

  const recentReviews = await Promise.all(
    recentReviewDocs.map((doc) => toReviewDto(doc, null, { includeRoi: false })),
  )
  const currentMonthRating = currentReview?.rating ?? null
  const currentMonthScore = currentReview?.finalAdjustedScore ?? null

  return {
    subjectRole,
    employeeId: acting.id,
    employeeName: user.fullName,
    employeeAvatar: user.avatar,
    department: user.department ?? 'Unassigned',
    avgRating,
    avgScore,
    avgRatingChange,
    currentMonthRating,
    currentMonthScore,
    tasksCompleted: metrics.tasksCompleted,
    projectsCompleted: metrics.projectsCompleted,
    projectsTotal: metrics.projectsTotal,
    efficiency: metrics.efficiency,
    status:
      resolvePerformanceStatus({
        finalAdjustedScore: currentMonthScore,
        rating: currentMonthRating,
      }) ??
      (metrics.efficiency >= 85
        ? 'excellent'
        : metrics.efficiency >= 70
          ? 'good'
          : metrics.efficiency >= 55
            ? 'average'
            : 'critical'),
    periodStart: formatPeriodDate(periodStart),
    periodEnd: formatPeriodDate(periodEnd),
    periodLabel,
    metrics,
    breakdown: metrics.breakdown,
    monthlyTrendData,
    recentReviews,
    categoryScores: (currentReview?.categoryScores ?? []).map((c) => ({
      name: c.name,
      maxMarks: c.maxMarks,
      obtained: c.obtained,
    })),
    bonus: currentReview?.bonus ?? 0,
    penalty: currentReview?.penalty ?? 0,
    bonusPenaltyNote: currentReview?.bonusPenaltyNote ?? '',
  }
}
