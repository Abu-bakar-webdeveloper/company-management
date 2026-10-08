import { Types } from 'mongoose'
import type {
  CategoryBreakdownSnapshot,
  ReportDetailStatsSnapshot,
  ReportRecordSnapshot,
  TrendBarSnapshot,
} from './report.model.js'
import type { ModuleBuilderInput, ReportPayload } from './report.types.js'
import { LeaveRequest } from '../leave/leave-request.model.js'
import { LeaveType } from '../leave/leave-type.model.js'
import { PerformanceReview } from '../performance/performance-review.model.js'
import { Project } from '../projects/project.model.js'
import { Expense } from '../expenses/expense.model.js'
import { User } from '../auth/user.model.js'

const CATEGORY_COLORS = ['#7C3AED', '#1877F2', '#EA580C', '#00B67A', '#DC2626', '#CBD5E1']

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function isAll(value: string, prefix: string): boolean {
  const normalized = value.trim().toLowerCase()
  return !normalized || normalized === `all ${prefix}`.toLowerCase() || normalized.startsWith('all ')
}

function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function percentBreakdown(
  counts: Map<string, number>,
  total: number,
): CategoryBreakdownSnapshot[] {
  if (total === 0) return []
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, count], index) => ({
      name,
      percent: Math.round((count / total) * 100),
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }))
}

function monthTrend(dates: Date[], start: Date, end: Date): TrendBarSnapshot[] {
  const buckets = new Map<string, number>()
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1)
  const last = new Date(end.getFullYear(), end.getMonth(), 1)

  while (cursor <= last) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth()}`
    buckets.set(key, 0)
    cursor.setMonth(cursor.getMonth() + 1)
  }

  for (const date of dates) {
    const key = `${date.getFullYear()}-${date.getMonth()}`
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1)
    }
  }

  return Array.from(buckets.entries()).map(([key, value]) => {
    const monthIndex = Number(key.split('-')[1])
    return { month: MONTH_LABELS[monthIndex], value }
  })
}

function mapAccountStatus(status: string): ReportRecordSnapshot['status'] {
  if (status === 'active') return 'active'
  if (status === 'pending') return 'pending'
  return 'inactive'
}

function mapProjectStatus(status: string): ReportRecordSnapshot['status'] {
  if (status === 'completed') return 'completed'
  if (status === 'in_progress') return 'active'
  return 'inactive'
}

/**
 * Resolve employee ObjectIds from filters, intersected with actor scope.
 * Returns [] when scope/filter yield nobody (callers should return empty payload).
 * Returns null only when scope is company-wide and no employee/department filter — meaning no employeeId constraint.
 */
async function resolveEmployeeIds(input: ModuleBuilderInput): Promise<Types.ObjectId[] | null> {
  const filter: Record<string, unknown> = {
    companyId: new Types.ObjectId(input.companyId),
    role: { $ne: 'superadmin' },
  }

  if (input.scopedEmployeeIds !== 'all') {
    if (input.scopedEmployeeIds.length === 0) return []
    filter._id = { $in: input.scopedEmployeeIds.map((id) => new Types.ObjectId(id)) }
  }

  if (!isAll(input.department, 'departments')) {
    filter.department = new RegExp(`^${escapeRegex(input.department)}$`, 'i')
  }

  if (!isAll(input.employee, 'employee')) {
    if (Types.ObjectId.isValid(input.employee) && input.employee.length === 24) {
      const requested = new Types.ObjectId(input.employee)
      if (filter._id && typeof filter._id === 'object' && '$in' in (filter._id as object)) {
        const allowed = (filter._id as { $in: Types.ObjectId[] }).$in.map((id) => id.toString())
        if (!allowed.includes(requested.toString())) return []
      }
      filter._id = requested
    } else {
      filter.fullName = new RegExp(escapeRegex(input.employee), 'i')
    }
  }

  const needsQuery =
    input.scopedEmployeeIds !== 'all' ||
    !isAll(input.department, 'departments') ||
    !isAll(input.employee, 'employee')

  if (!needsQuery) return null

  const users = await User.find(filter).select('_id').lean()
  return users.map((u) => u._id as Types.ObjectId)
}

function emptyStats(
  secondaryLabel: string,
  secondaryFormat: ReportDetailStatsSnapshot['secondaryFormat'],
  avgLabel: string,
  avgFormat: ReportDetailStatsSnapshot['avgFormat'],
): ReportDetailStatsSnapshot {
  return {
    totalRecords: 0,
    secondaryLabel,
    secondaryValue: 0,
    secondaryFormat,
    avgLabel,
    avgValue: 0,
    avgFormat,
    status: 'Completed',
  }
}

export async function buildLeavesPayload(input: ModuleBuilderInput): Promise<ReportPayload> {
  const employeeIds = await resolveEmployeeIds(input)
  if (employeeIds && employeeIds.length === 0) {
    return {
      stats: emptyStats('Total Days', 'days', 'Avg Days', 'days'),
      trend: monthTrend([], input.startDate, input.endDate),
      categories: [],
      records: [],
    }
  }

  const filter: Record<string, unknown> = {
    companyId: new Types.ObjectId(input.companyId),
    startDate: { $gte: input.startDate, $lte: endOfDay(input.endDate) },
  }

  if (employeeIds) {
    filter.employeeId = { $in: employeeIds }
  }

  if (!isAll(input.status, 'status')) {
    filter.status = input.status.trim().toLowerCase()
  }

  const requests = await LeaveRequest.find(filter).sort({ startDate: -1 }).limit(500).lean()

  const typeIds = [...new Set(requests.map((r) => r.leaveTypeId.toString()))]
  const employeeIdList = [...new Set(requests.map((r) => r.employeeId.toString()))]

  const [types, employees] = await Promise.all([
    LeaveType.find({ _id: { $in: typeIds } }).lean(),
    User.find({ _id: { $in: employeeIdList } }).lean(),
  ])

  const typeMap = new Map(types.map((t) => [t._id.toString(), t.name]))
  const employeeMap = new Map(
    employees.map((e) => [
      e._id.toString(),
      { name: e.fullName, avatar: e.avatar, department: e.department ?? '—' },
    ]),
  )

  const categoryCounts = new Map<string, number>()
  let totalDays = 0

  const records: ReportRecordSnapshot[] = requests.map((req) => {
    const typeName = typeMap.get(req.leaveTypeId.toString()) ?? 'Leave'
    const emp = employeeMap.get(req.employeeId.toString())
    categoryCounts.set(typeName, (categoryCounts.get(typeName) ?? 0) + 1)
    totalDays += req.durationDays

    return {
      id: req._id.toString(),
      date: formatShortDate(req.startDate),
      category: typeName,
      employeeName: emp?.name ?? 'Unknown',
      employeeAvatar: emp?.avatar,
      metric: req.durationDays,
      metricFormat: 'days',
      status: req.status,
      detail: req.reason,
    }
  })

  const total = records.length
  return {
    stats: {
      totalRecords: total,
      secondaryLabel: 'Total Days',
      secondaryValue: totalDays,
      secondaryFormat: 'days',
      avgLabel: 'Avg Days',
      avgValue: total > 0 ? round1(totalDays / total) : 0,
      avgFormat: 'days',
      status: 'Completed',
    },
    trend: monthTrend(
      requests.map((r) => r.startDate),
      input.startDate,
      input.endDate,
    ),
    categories: percentBreakdown(categoryCounts, total),
    records,
  }
}

export async function buildPerformancePayload(input: ModuleBuilderInput): Promise<ReportPayload> {
  const employeeIds = await resolveEmployeeIds(input)
  if (employeeIds && employeeIds.length === 0) {
    return {
      stats: emptyStats('Avg Rating', 'rating', 'Efficiency', 'percent'),
      trend: monthTrend([], input.startDate, input.endDate),
      categories: [],
      records: [],
    }
  }

  const filter: Record<string, unknown> = {
    companyId: new Types.ObjectId(input.companyId),
    status: 'submitted',
    periodStart: { $gte: input.startDate, $lte: endOfDay(input.endDate) },
  }

  if (employeeIds) {
    filter.employeeId = { $in: employeeIds }
  }

  if (!isAll(input.rating, 'ratings')) {
    if (input.rating.includes('4+')) {
      filter.rating = { $gte: 4 }
    } else if (input.rating.includes('3-4')) {
      filter.rating = { $gte: 3, $lt: 4 }
    } else if (input.rating.toLowerCase().includes('below')) {
      filter.rating = { $lt: 3 }
    }
  }

  const reviews = await PerformanceReview.find(filter).sort({ periodStart: -1 }).limit(500).lean()
  const empIds = [...new Set(reviews.map((r) => r.employeeId.toString()))]
  const employees = await User.find({ _id: { $in: empIds } }).lean()
  const employeeMap = new Map(
    employees.map((e) => [
      e._id.toString(),
      { name: e.fullName, avatar: e.avatar, department: e.department ?? '—' },
    ]),
  )

  const bucketCounts = new Map<string, number>([
    ['Excellent', 0],
    ['Good', 0],
    ['Others', 0],
  ])

  let ratingSum = 0
  let efficiencySum = 0

  const records: ReportRecordSnapshot[] = reviews.map((review) => {
    const emp = employeeMap.get(review.employeeId.toString())
    ratingSum += review.finalAdjustedScore != null ? review.finalAdjustedScore / 20 : review.rating
    efficiencySum += review.metricsSnapshot?.efficiency ?? 0

    const level = review.performanceLevel
    if (level === 'excellent' || (level == null && review.rating >= 4.5)) {
      bucketCounts.set('Excellent', (bucketCounts.get('Excellent') ?? 0) + 1)
    } else if (level === 'good' || (level == null && review.rating >= 3.5)) {
      bucketCounts.set('Good', (bucketCounts.get('Good') ?? 0) + 1)
    } else {
      bucketCounts.set('Others', (bucketCounts.get('Others') ?? 0) + 1)
    }

    return {
      id: review._id.toString(),
      date: formatShortDate(review.periodStart),
      category: emp?.department ?? '—',
      employeeName: emp?.name ?? 'Unknown',
      employeeAvatar: emp?.avatar,
      metric: review.finalAdjustedScore ?? review.rating,
      metricFormat: review.finalAdjustedScore != null ? 'number' : 'rating',
      status: 'completed',
      detail:
        review.finalAdjustedScore != null
          ? `KPI ${review.finalAdjustedScore} · ${review.feedback || review.periodLabel}`
          : review.feedback || review.periodLabel,
    }
  })

  const total = records.length
  return {
    stats: {
      totalRecords: total,
      secondaryLabel: 'Avg Rating',
      secondaryValue: total > 0 ? round1(ratingSum / total) : 0,
      secondaryFormat: 'rating',
      avgLabel: 'Efficiency',
      avgValue: total > 0 ? Math.round(efficiencySum / total) : 0,
      avgFormat: 'percent',
      status: 'Completed',
    },
    trend: monthTrend(
      reviews.map((r) => r.periodStart),
      input.startDate,
      input.endDate,
    ),
    categories: percentBreakdown(bucketCounts, total).filter((c) => c.percent > 0),
    records,
  }
}

export async function buildProjectsPayload(input: ModuleBuilderInput): Promise<ReportPayload> {
  const filter: Record<string, unknown> = {
    companyId: new Types.ObjectId(input.companyId),
    startDate: { $lte: endOfDay(input.endDate) },
    endDate: { $gte: input.startDate },
  }

  if (!isAll(input.project, 'projects')) {
    if (Types.ObjectId.isValid(input.project) && input.project.length === 24) {
      filter._id = new Types.ObjectId(input.project)
    } else {
      filter.name = new RegExp(escapeRegex(input.project), 'i')
    }
  }

  if (!isAll(input.status, 'status')) {
    const status = input.status.trim().toLowerCase()
    if (status === 'active' || status === 'in progress') filter.status = 'in_progress'
    else if (status === 'completed') filter.status = 'completed'
    else if (status === 'delayed' || status === 'inactive') filter.status = 'delayed'
  }

  // Managers: only projects they manage or belong to
  if (input.scopedEmployeeIds !== 'all') {
    if (input.scopedEmployeeIds.length === 0) {
      return {
        stats: emptyStats('Avg Progress', 'percent', 'Active Projects', 'number'),
        trend: monthTrend([], input.startDate, input.endDate),
        categories: [],
        records: [],
      }
    }
    const oids = input.scopedEmployeeIds.map((id) => new Types.ObjectId(id))
    filter.$or = [{ managerId: { $in: oids } }, { teamMemberIds: { $in: oids } }]
  }

  let projects = await Project.find(filter).sort({ updatedAt: -1 }).limit(500).lean()

  if (!isAll(input.department, 'departments') || !isAll(input.employee, 'employee')) {
    const employeeIds = await resolveEmployeeIds(input)
    if (employeeIds) {
      if (employeeIds.length === 0) {
        projects = []
      } else {
        const idSet = new Set(employeeIds.map((id) => id.toString()))
        projects = projects.filter(
          (p) =>
            idSet.has(p.managerId.toString()) ||
            p.teamMemberIds.some((id) => idSet.has(id.toString())),
        )
      }
    }
  }

  const managerIds = [...new Set(projects.map((p) => p.managerId.toString()))]
  const managers = await User.find({ _id: { $in: managerIds } }).lean()
  const managerMap = new Map(
    managers.map((m) => [m._id.toString(), { name: m.fullName, avatar: m.avatar }]),
  )

  const statusCounts = new Map<string, number>()
  let progressSum = 0
  let activeCount = 0

  const records: ReportRecordSnapshot[] = projects.map((project) => {
    const manager = managerMap.get(project.managerId.toString())
    const statusLabel =
      project.status === 'in_progress'
        ? 'Active'
        : project.status === 'completed'
          ? 'Completed'
          : 'On Hold'
    statusCounts.set(statusLabel, (statusCounts.get(statusLabel) ?? 0) + 1)
    progressSum += project.progress
    if (project.status === 'in_progress') activeCount += 1

    return {
      id: project._id.toString(),
      date: formatShortDate(project.updatedAt),
      category: project.name,
      employeeName: manager?.name ?? 'Unknown',
      employeeAvatar: manager?.avatar,
      metric: project.progress,
      metricFormat: 'percent',
      status: mapProjectStatus(project.status),
      detail: project.description?.slice(0, 120) || project.projectCode,
    }
  })

  const total = records.length
  return {
    stats: {
      totalRecords: total,
      secondaryLabel: 'Avg Progress',
      secondaryValue: total > 0 ? Math.round(progressSum / total) : 0,
      secondaryFormat: 'percent',
      avgLabel: 'Active Projects',
      avgValue: activeCount,
      avgFormat: 'number',
      status: 'Completed',
    },
    trend: monthTrend(
      projects.map((p) => p.startDate),
      input.startDate,
      input.endDate,
    ),
    categories: percentBreakdown(statusCounts, total),
    records,
  }
}

export async function buildEmployeesPayload(input: ModuleBuilderInput): Promise<ReportPayload> {
  const employeeIds = await resolveEmployeeIds(input)
  if (employeeIds && employeeIds.length === 0) {
    return {
      stats: emptyStats('Active', 'number', 'Departments', 'number'),
      trend: monthTrend([], input.startDate, input.endDate),
      categories: [],
      records: [],
    }
  }

  const filter: Record<string, unknown> = {
    companyId: new Types.ObjectId(input.companyId),
    role: { $ne: 'superadmin' },
  }

  if (employeeIds) {
    filter._id = { $in: employeeIds }
  } else if (input.scopedEmployeeIds !== 'all') {
    filter._id = { $in: input.scopedEmployeeIds.map((id) => new Types.ObjectId(id)) }
  }

  if (!isAll(input.department, 'departments') && !employeeIds) {
    filter.department = new RegExp(`^${escapeRegex(input.department)}$`, 'i')
  }

  if (!isAll(input.status, 'status')) {
    const status = input.status.trim().toLowerCase()
    if (status === 'active') filter.status = 'active'
    else if (status === 'pending') filter.status = 'pending'
    else if (status === 'inactive' || status === 'suspended') filter.status = 'suspended'
  }

  const users = await User.find(filter).sort({ fullName: 1 }).limit(500).lean()

  const deptCounts = new Map<string, number>()
  let activeCount = 0

  const records: ReportRecordSnapshot[] = users.map((user) => {
    const dept = user.department?.trim() || 'Unassigned'
    deptCounts.set(dept, (deptCounts.get(dept) ?? 0) + 1)
    if (user.status === 'active') activeCount += 1

    return {
      id: user._id.toString(),
      date: user.joinDate ? formatShortDate(user.joinDate) : '—',
      category: dept,
      employeeName: user.fullName,
      employeeAvatar: user.avatar,
      metric: null,
      metricFormat: 'none',
      status: mapAccountStatus(user.status),
      detail: user.jobTitle || user.role,
    }
  })

  const total = records.length
  const joinDates = users.map((u) => u.joinDate).filter((d): d is Date => d instanceof Date)

  return {
    stats: {
      totalRecords: total,
      secondaryLabel: 'Active',
      secondaryValue: activeCount,
      secondaryFormat: 'number',
      avgLabel: 'Departments',
      avgValue: deptCounts.size,
      avgFormat: 'number',
      status: 'Completed',
    },
    trend: monthTrend(joinDates, input.startDate, input.endDate),
    categories: percentBreakdown(deptCounts, total),
    records,
  }
}

const EXPENSE_TYPE_LABELS: Record<string, string> = {
  monthly: 'Monthly Expense',
  event: 'Event Management',
  employee: 'Employee Expense',
  other: 'Other',
}

const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  equipment: 'Equipment',
  travel: 'Travel',
  food: 'Food',
  software: 'Software',
  office: 'Office',
  other: 'Other',
}

export async function buildExpensesPayload(input: ModuleBuilderInput): Promise<ReportPayload> {
  const employeeIds = await resolveEmployeeIds(input)
  if (employeeIds && employeeIds.length === 0) {
    return {
      stats: emptyStats('Total Amount', 'currency', 'Avg Amount', 'currency'),
      trend: monthTrend([], input.startDate, input.endDate),
      categories: [],
      records: [],
    }
  }

  const filter: Record<string, unknown> = {
    companyId: new Types.ObjectId(input.companyId),
    date: { $gte: input.startDate, $lte: endOfDay(input.endDate) },
  }

  if (employeeIds) {
    filter.employeeId = { $in: employeeIds }
  }

  if (input.scopedEmployeeIds !== 'all') {
    if (input.scopedEmployeeIds.length === 0) {
      return {
        stats: emptyStats('Total Amount', 'currency', 'Avg Amount', 'currency'),
        trend: monthTrend([], input.startDate, input.endDate),
        categories: [],
        records: [],
      }
    }
    const scoped = input.scopedEmployeeIds.map((id) => new Types.ObjectId(id))
    if (filter.employeeId) {
      const existing = (filter.employeeId as { $in: Types.ObjectId[] }).$in
      const scopedSet = new Set(scoped.map((id) => id.toString()))
      filter.employeeId = {
        $in: existing.filter((id) => scopedSet.has(id.toString())),
      }
    } else {
      filter.employeeId = { $in: scoped }
    }
  }

  if (!isAll(input.status, 'status')) {
    filter.status = input.status.trim().toLowerCase()
  }

  if (!isAll(input.project, 'projects')) {
    if (Types.ObjectId.isValid(input.project) && input.project.length === 24) {
      filter.projectId = new Types.ObjectId(input.project)
    } else {
      filter.projectName = new RegExp(escapeRegex(input.project), 'i')
    }
  }

  const expenses = await Expense.find(filter).sort({ date: -1 }).limit(500).lean()

  const typeCounts = new Map<string, number>()
  let totalAmount = 0

  const records: ReportRecordSnapshot[] = expenses.map((expense) => {
    const typeName = EXPENSE_TYPE_LABELS[expense.expenseType ?? 'employee'] ?? 'Other'
    const categoryName = EXPENSE_CATEGORY_LABELS[expense.category] ?? expense.category
    typeCounts.set(typeName, (typeCounts.get(typeName) ?? 0) + 1)
    totalAmount += expense.amount

    return {
      id: expense._id.toString(),
      date: formatShortDate(expense.date),
      category: typeName,
      employeeName: expense.employeeName ?? expense.eventName ?? '—',
      employeeAvatar: expense.employeeAvatar,
      metric: expense.amount,
      metricFormat: 'currency',
      status: expense.status,
      detail: `${expense.title} · ${categoryName}`,
    }
  })

  const total = records.length
  return {
    stats: {
      totalRecords: total,
      secondaryLabel: 'Total Amount',
      secondaryValue: Math.round(totalAmount * 100) / 100,
      secondaryFormat: 'currency',
      avgLabel: 'Avg Amount',
      avgValue: total > 0 ? Math.round((totalAmount / total) * 100) / 100 : 0,
      avgFormat: 'currency',
      status: 'Completed',
    },
    trend: monthTrend(
      expenses.map((e) => e.date),
      input.startDate,
      input.endDate,
    ),
    categories: percentBreakdown(typeCounts, total),
    records,
  }
}
