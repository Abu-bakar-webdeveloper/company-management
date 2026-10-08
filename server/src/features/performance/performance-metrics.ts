import { Types } from 'mongoose'
import { Milestone } from '../projects/milestone.model.js'
import { Project } from '../projects/project.model.js'
import { Task } from '../tasks/task.model.js'
import { User } from '../auth/user.model.js'
import { getZonedParts } from '../attendance/attendance-calc.js'
import {
  ensureAttendanceSettings,
  getMonthlyAttendancePercent,
} from '../attendance/attendance.service.js'
import type { PerformanceBreakdownItem, PerformanceMetricsDto } from './performance.types.js'

async function attendanceYearMonth(
  companyId: string,
  periodStart: Date,
): Promise<{ year: number; month: number }> {
  const settings = await ensureAttendanceSettings(companyId)
  const parts = getZonedParts(periodStart, settings.timezone)
  return { year: parts.year, month: parts.month }
}

function clampPercent(value: number): number {
  return Math.round(Math.max(0, Math.min(100, value)))
}

/** Calendar-month helpers use UTC so "Aug 2026" is never shifted by server timezone. */
export function formatPeriodDate(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getMonthBounds(date: Date = new Date()): {
  periodStart: Date
  periodEnd: Date
  periodLabel: string
} {
  const periodStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
  const periodEnd = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999),
  )
  const periodLabel = periodStart.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
  return { periodStart, periodEnd, periodLabel }
}

export function parsePeriodStart(value: string | Date | undefined): Date {
  if (!value) return getMonthBounds().periodStart

  if (typeof value === 'string') {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
    if (match) {
      const year = Number(match[1])
      const month = Number(match[2]) - 1
      return new Date(Date.UTC(year, month, 1))
    }
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return getMonthBounds().periodStart
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
}

export function getPreviousMonthBounds(periodStart: Date): { periodStart: Date; periodEnd: Date } {
  const prev = new Date(Date.UTC(periodStart.getUTCFullYear(), periodStart.getUTCMonth() - 1, 1))
  const periodEnd = new Date(
    Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth() + 1, 0, 23, 59, 59, 999),
  )
  return { periodStart: prev, periodEnd }
}

export async function computeEmployeeMetrics(
  employeeId: string,
  companyId: string,
  periodStart: Date,
  periodEnd: Date,
): Promise<PerformanceMetricsDto> {
  const employeeObjectId = new Types.ObjectId(employeeId)
  const companyObjectId = new Types.ObjectId(companyId)

  const [completedTasks, pendingTasks, projectTasks, completedProjectTasks] = await Promise.all([
    Task.find({
      companyId: companyObjectId,
      assigneeId: employeeObjectId,
      status: 'done',
      updatedAt: { $gte: periodStart, $lte: periodEnd },
    }).select('dueDate updatedAt projectId'),
    Task.find({
      companyId: companyObjectId,
      assigneeId: employeeObjectId,
      status: { $in: ['todo', 'in_progress', 'hold'] },
      createdAt: { $lte: periodEnd },
    }).select('_id'),
    Task.countDocuments({
      companyId: companyObjectId,
      assigneeId: employeeObjectId,
      projectId: { $ne: null },
      createdAt: { $lte: periodEnd },
    }),
    Task.countDocuments({
      companyId: companyObjectId,
      assigneeId: employeeObjectId,
      projectId: { $ne: null },
      status: 'done',
      updatedAt: { $gte: periodStart, $lte: periodEnd },
    }),
  ])

  const tasksCompleted = completedTasks.length
  const tasksPending = pendingTasks.length

  const tasksWithDueDate = completedTasks.filter((task) => task.dueDate)
  const deadlinesMetCount = tasksWithDueDate.filter((task) => {
    if (!task.dueDate) return false
    return task.updatedAt <= task.dueDate
  }).length
  const deadlinesMet =
    tasksWithDueDate.length === 0
      ? 100
      : clampPercent((deadlinesMetCount / tasksWithDueDate.length) * 100)

  const { year: attYear, month: attMonth } = await attendanceYearMonth(companyId, periodStart)
  const attendance = await getMonthlyAttendancePercent(
    companyId,
    employeeId,
    attYear,
    attMonth,
  )

  const totalTasks = tasksCompleted + tasksPending
  const taskCompletionRate =
    totalTasks === 0 ? 100 : clampPercent((tasksCompleted / totalTasks) * 100)

  const projectContribution =
    projectTasks === 0 ? 100 : clampPercent((completedProjectTasks / projectTasks) * 100)

  // Collaboration proxy: share of completed tasks that had a due date met on time
  const teamCollaboration =
    tasksCompleted === 0
      ? 100
      : clampPercent(
          ((completedTasks.filter((t) => t.projectId).length / Math.max(tasksCompleted, 1)) * 50 +
            deadlinesMet * 0.5),
        )

  const efficiency = clampPercent(0.5 * taskCompletionRate + 0.5 * deadlinesMet)

  const breakdown: PerformanceBreakdownItem[] = [
    { key: 'taskCompletion', label: 'Task Completion', value: taskCompletionRate, color: '#7C3AED' },
    { key: 'deadlinesMet', label: 'Deadlines Met', value: deadlinesMet, color: '#1877F2' },
    {
      key: 'projectContribution',
      label: 'Project Contribution',
      value: projectContribution,
      color: '#FF9F43',
    },
    {
      key: 'teamCollaboration',
      label: 'Team Collaboration',
      value: teamCollaboration,
      color: '#00B67A',
    },
  ]

  return {
    metricType: 'employee',
    tasksCompleted,
    tasksPending,
    deadlinesMet,
    attendance,
    efficiency,
    taskCompletionRate,
    projectContribution,
    teamCollaboration,
    projectsTotal: 0,
    projectsCompleted: 0,
    avgProjectProgress: 0,
    milestoneCompletion: 0,
    breakdown,
  }
}

export async function computeManagerMetrics(
  managerId: string,
  companyId: string,
  periodStart: Date,
  periodEnd: Date,
): Promise<PerformanceMetricsDto> {
  const managerObjectId = new Types.ObjectId(managerId)
  const companyObjectId = new Types.ObjectId(companyId)

  const projects = await Project.find({
    companyId: companyObjectId,
    managerId: managerObjectId,
  }).select('_id status progress')

  const projectIds = projects.map((p) => p._id)
  const projectsTotal = projects.length
  const projectsCompleted = projects.filter((p) => p.status === 'completed').length
  const avgProjectProgress =
    projectsTotal === 0
      ? 0
      : clampPercent(projects.reduce((sum, p) => sum + (p.progress ?? 0), 0) / projectsTotal)

  const projectCompletionRate =
    projectsTotal === 0 ? 100 : clampPercent((projectsCompleted / projectsTotal) * 100)

  let milestoneCompletion = 100
  if (projectIds.length > 0) {
    const milestones = await Milestone.find({
      companyId: companyObjectId,
      projectId: { $in: projectIds },
    }).select('status')
    const total = milestones.length
    const completed = milestones.filter((m) => m.status === 'completed').length
    milestoneCompletion = total === 0 ? 100 : clampPercent((completed / total) * 100)
  }

  const reportIds = await User.find({
    companyId: companyObjectId,
    managerId: managerObjectId,
    role: 'employee',
    status: 'active',
  }).select('_id')

  const reportObjectIds = reportIds.map((u) => u._id)
  let teamTaskCompletion = 100
  let tasksCompleted = 0
  let tasksPending = 0
  let deadlinesMet = 100

  if (reportObjectIds.length > 0) {
    const [done, pending] = await Promise.all([
      Task.find({
        companyId: companyObjectId,
        assigneeId: { $in: reportObjectIds },
        status: 'done',
        updatedAt: { $gte: periodStart, $lte: periodEnd },
      }).select('dueDate updatedAt'),
      Task.countDocuments({
        companyId: companyObjectId,
        assigneeId: { $in: reportObjectIds },
        status: { $in: ['todo', 'in_progress', 'hold'] },
        createdAt: { $lte: periodEnd },
      }),
    ])
    tasksCompleted = done.length
    tasksPending = pending
    const total = tasksCompleted + tasksPending
    teamTaskCompletion = total === 0 ? 100 : clampPercent((tasksCompleted / total) * 100)

    const withDue = done.filter((t) => t.dueDate)
    const met = withDue.filter((t) => t.dueDate && t.updatedAt <= t.dueDate).length
    deadlinesMet = withDue.length === 0 ? 100 : clampPercent((met / withDue.length) * 100)
  }

  // Manager attendance: average of direct reports' monthly present rate (leave excluded).
  let attendance = 100
  if (reportObjectIds.length > 0) {
    const { year, month } = await attendanceYearMonth(companyId, periodStart)
    const rates = await Promise.all(
      reportObjectIds.map((id) =>
        getMonthlyAttendancePercent(companyId, id.toString(), year, month),
      ),
    )
    attendance = Math.round(rates.reduce((sum, r) => sum + r, 0) / rates.length)
  }

  const efficiency = clampPercent(
    0.35 * avgProjectProgress + 0.35 * projectCompletionRate + 0.3 * milestoneCompletion,
  )

  const breakdown: PerformanceBreakdownItem[] = [
    {
      key: 'projectCompletion',
      label: 'Project Completion',
      value: projectCompletionRate,
      color: '#7C3AED',
    },
    {
      key: 'avgProgress',
      label: 'Avg Project Progress',
      value: avgProjectProgress,
      color: '#1877F2',
    },
    {
      key: 'milestones',
      label: 'Milestone Completion',
      value: milestoneCompletion,
      color: '#FF9F43',
    },
    {
      key: 'teamTasks',
      label: 'Team Task Completion',
      value: teamTaskCompletion,
      color: '#00B67A',
    },
  ]

  return {
    metricType: 'manager',
    tasksCompleted,
    tasksPending,
    deadlinesMet,
    attendance,
    efficiency,
    taskCompletionRate: teamTaskCompletion,
    projectContribution: avgProjectProgress,
    teamCollaboration: teamTaskCompletion,
    projectsTotal,
    projectsCompleted,
    avgProjectProgress,
    milestoneCompletion,
    breakdown,
  }
}

export async function computeMetricsForRole(
  userId: string,
  companyId: string,
  role: string,
  periodStart: Date,
  periodEnd: Date,
): Promise<PerformanceMetricsDto> {
  if (role === 'manager') {
    return computeManagerMetrics(userId, companyId, periodStart, periodEnd)
  }
  return computeEmployeeMetrics(userId, companyId, periodStart, periodEnd)
}

export function ratingToStatus(rating: number): 'excellent' | 'good' | 'average' | 'critical' {
  if (rating >= 4.5) return 'excellent'
  if (rating >= 4.0) return 'good'
  if (rating >= 3.5) return 'average'
  return 'critical'
}

/** Percent change MoM. Returns 0 when either side is missing. From-zero growth caps at +100. */
export function computeTrend(current: number | null, previous: number | null): number {
  if (current == null || previous == null) return 0
  if (previous === 0) return current === 0 ? 0 : 100
  return Math.round(((current - previous) / previous) * 1000) / 10
}

/** Prefer KPI↔KPI or rating↔rating; never mix 0–100 scores with 1–5 stars. */
export function comparableReviewMetrics(
  current: { finalAdjustedScore?: number | null; rating?: number | null } | null | undefined,
  previous: { finalAdjustedScore?: number | null; rating?: number | null } | null | undefined,
): { current: number | null; previous: number | null } {
  if (!current || !previous) return { current: null, previous: null }
  if (current.finalAdjustedScore != null && previous.finalAdjustedScore != null) {
    return { current: current.finalAdjustedScore, previous: previous.finalAdjustedScore }
  }
  if (current.rating != null && previous.rating != null) {
    return { current: current.rating, previous: previous.rating }
  }
  return { current: null, previous: null }
}

export function toMetricsSnapshot(metrics: PerformanceMetricsDto) {
  return {
    tasksCompleted: metrics.tasksCompleted,
    tasksPending: metrics.tasksPending,
    deadlinesMet: metrics.deadlinesMet,
    attendance: metrics.attendance,
    efficiency: metrics.efficiency,
  }
}
