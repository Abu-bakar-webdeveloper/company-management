import { Types } from 'mongoose'
import { AppError } from '../../utils/AppError.js'
import { hasPermission, type Permission } from '../auth/permissions.js'
import type { UserRole } from '../auth/auth.types.js'
import { Salary } from '../salaries/salary.model.js'
import { Project } from '../projects/project.model.js'
import { getActiveKpiTemplate } from './kpi-template.service.js'
import type { KpiTemplateRole } from './kpi-template.model.js'
import { PerformanceAuditLog } from './performance-audit-log.model.js'
import {
  buildTemplateSnapshot,
  computeFinancialRoi,
  computeKpiScores,
  validateBonusPenaltyLimits,
  computeValueIndex,
  validateKpiScoresAgainstTemplate,
  type KpiScoreInput,
} from './performance-kpi.js'
import type {
  IPerformanceReview,
  ReviewRoiSnapshot,
} from './performance-review.model.js'
import type { PerformanceMetricsDto } from './performance.types.js'

function countWeekdays(periodStart: Date, periodEnd: Date): number {
  let count = 0
  const cursor = new Date(periodStart)
  while (cursor <= periodEnd) {
    const day = cursor.getDay()
    if (day !== 0 && day !== 6) count += 1
    cursor.setDate(cursor.getDate() + 1)
  }
  return Math.max(count, 1)
}

export async function resolveBusinessValueForEmployee(
  companyId: string,
  employeeId: string,
  periodStart: Date,
  periodEnd: Date,
): Promise<number | null> {
  const projects = await Project.find({
    companyId,
    teamMemberIds: employeeId,
    contractValue: { $gt: 0 },
    startDate: { $lte: periodEnd },
    endDate: { $gte: periodStart },
  })
    .select('contractValue teamMemberIds')
    .lean()

  if (projects.length === 0) return null

  let total = 0
  let attributed = false
  for (const project of projects) {
    const value = project.contractValue ?? 0
    if (value <= 0) continue
    const members = Math.max(project.teamMemberIds?.length ?? 1, 1)
    total += value / members
    attributed = true
  }
  return attributed ? Math.round(total * 100) / 100 : null
}

export async function resolveEmployeeCost(
  companyId: string,
  employeeId: string,
  periodStart: Date,
): Promise<number | null> {
  const month = periodStart.getUTCMonth() + 1
  const year = periodStart.getUTCFullYear()
  const salary = await Salary.findOne({
    companyId,
    employeeId,
    payPeriodMonth: month,
    payPeriodYear: year,
  })
    .select('totalEarnings')
    .lean()

  if (!salary) return null
  return salary.totalEarnings
}

export function buildRoiSnapshot(input: {
  finalAdjustedScore: number
  metrics: PerformanceMetricsDto
  periodStart: Date
  periodEnd: Date
  cost: number | null
  businessValue: number | null
}): ReviewRoiSnapshot {
  const outputValue = input.metrics.tasksCompleted + (input.metrics.projectsCompleted ?? 0)
  const weekdays = countWeekdays(input.periodStart, input.periodEnd)
  // Use full period weekdays; attendance/leave no longer reduces effort input.
  const effortInput = Math.max(1, weekdays)
  const roiIndex = computeValueIndex({
    finalAdjustedScore: input.finalAdjustedScore,
    outputValue,
    effortInput,
  })
  const financialRoi =
    input.cost != null && input.businessValue != null
      ? computeFinancialRoi(input.businessValue, input.cost)
      : null

  return {
    outputValue,
    effortInput,
    roiIndex,
    financialRoi,
    cost: input.cost,
    businessValue: input.businessValue,
  }
}

export function canViewRoi(role: UserRole, permissions: Permission[]): boolean {
  return hasPermission(role, 'performance:roi:view', permissions)
}

export async function applyKpiFieldsToReview(input: {
  review: IPerformanceReview
  companyId: string
  subjectRole: string
  kpiScores?: KpiScoreInput[]
  bonus?: number
  penalty?: number
  bonusPenaltyNote?: string
  requireScores: boolean
}): Promise<void> {
  const templateRole: KpiTemplateRole = input.subjectRole === 'manager' ? 'manager' : 'employee'
  const template = await getActiveKpiTemplate(input.companyId, templateRole)

  const scores = input.kpiScores ?? input.review.kpiScores ?? []
  if (input.requireScores && scores.length === 0) {
    throw new AppError('KPI scores are required to submit a review', 400, 'VALIDATION_ERROR')
  }

  if (scores.length > 0) {
    const validationError = validateKpiScoresAgainstTemplate(template.categories, scores)
    if (validationError) {
      throw new AppError(validationError, 400, 'VALIDATION_ERROR')
    }
  }

  const bonus = input.bonus ?? input.review.bonus ?? 0
  const penalty = input.penalty ?? input.review.penalty ?? 0
  const note = input.bonusPenaltyNote ?? input.review.bonusPenaltyNote ?? ''

  if ((bonus !== 0 || penalty !== 0) && !note.trim()) {
    throw new AppError(
      'Bonus/penalty note is required when bonus or penalty is non-zero',
      400,
      'VALIDATION_ERROR',
    )
  }

  const preview = computeKpiScores(template.categories, scores, 0, 0)
  const limitError = validateBonusPenaltyLimits(preview.totalScore, bonus, penalty)
  if (limitError) {
    throw new AppError(limitError, 400, 'VALIDATION_ERROR')
  }

  const computed = computeKpiScores(template.categories, scores, bonus, penalty)

  input.review.kpiTemplateId = template._id as Types.ObjectId
  input.review.kpiTemplateSnapshot = buildTemplateSnapshot(template.categories, {
    name: template.name,
    role: template.role,
    version: template.version,
  })
  input.review.kpiScores = scores.map((s) => ({
    subKpiId: s.subKpiId,
    marksObtained: s.marksObtained,
    remarks: s.remarks ?? '',
  }))
  input.review.categoryScores = computed.categoryScores
  input.review.totalScore = computed.totalScore
  input.review.bonus = computed.bonus
  input.review.penalty = computed.penalty
  input.review.bonusPenaltyNote = note
  input.review.finalAdjustedScore = computed.finalAdjustedScore
  input.review.performanceLevel = computed.performanceLevel
  input.review.templateOutdated = false
}

export async function writeBonusPenaltyAudit(input: {
  companyId: string
  reviewId: string
  employeeId: string
  actorId: string
  prevBonus: number
  prevPenalty: number
  nextBonus: number
  nextPenalty: number
  note: string
  prevScore?: number | null
  nextScore?: number | null
}): Promise<void> {
  const entries: Array<{ type: 'bonus' | 'penalty' | 'score_change'; amount: number }> = []

  if (input.nextBonus !== input.prevBonus) {
    entries.push({ type: 'bonus', amount: input.nextBonus - input.prevBonus })
  }
  if (input.nextPenalty !== input.prevPenalty) {
    entries.push({ type: 'penalty', amount: input.nextPenalty - input.prevPenalty })
  }
  if (
    input.prevScore != null &&
    input.nextScore != null &&
    input.prevScore !== input.nextScore
  ) {
    entries.push({ type: 'score_change', amount: input.nextScore - input.prevScore })
  }

  if (entries.length === 0) return

  await PerformanceAuditLog.insertMany(
    entries.map((entry) => ({
      companyId: input.companyId,
      reviewId: input.reviewId,
      employeeId: input.employeeId,
      actorId: input.actorId,
      type: entry.type,
      amount: entry.amount,
      note: input.note,
    })),
  )
}
