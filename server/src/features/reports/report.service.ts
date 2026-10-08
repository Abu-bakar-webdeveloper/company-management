import { Types } from 'mongoose'
import { AppError } from '../../utils/AppError.js'
import type { UserRole } from '../auth/auth.types.js'
import type { Permission } from '../auth/permissions.js'
import { User } from '../auth/user.model.js'
import { LeaveRequest } from '../leave/leave-request.model.js'
import { PerformanceReview } from '../performance/performance-review.model.js'
import { Project } from '../projects/project.model.js'
import {
  getCompanyEnabledHubs,
  REPORT_TYPE_HUB,
} from '../companies/company-hubs.js'
import {
  buildEmployeesPayload,
  buildExpensesPayload,
  buildLeavesPayload,
  buildPerformancePayload,
  buildProjectsPayload,
} from './report-builders.js'
import {
  Report,
  type ExportFormat,
  type GeneratableReportModule,
  type IReport,
  type ReportModule,
} from './report.model.js'
import type {
  GenerateReportResultDto,
  RecentReportDto,
  ReportActor,
  ReportDetailDto,
  ReportOptionsDto,
  ReportsOverviewChartsDto,
  ReportsOverviewStatsDto,
} from './report.types.js'
import type { GenerateReportInput, ListReportsQuery } from './report.validation.js'
import { buildReportCsv } from './exporters/csv.js'
import { buildReportExcel } from './exporters/excel.js'
import { buildReportPdf } from './exporters/pdf.js'

const MODULE_LABELS: Record<ReportModule, string> = {
  employees: 'Employees',
  projects: 'Projects',
  leaves: 'Leaves',
  expenses: 'Expenses',
  performance: 'Performance',
}

const MODULE_REPORT_NAMES: Record<GeneratableReportModule, string> = {
  employees: 'Employee Audit',
  projects: 'Project Status',
  leaves: 'Leave Report',
  performance: 'Perf Report',
  expenses: 'Expense Report',
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const LEAVE_STATUS_COLORS: Record<string, string> = {
  approved: '#00B67A',
  pending: '#1877F2',
  rejected: '#DC2626',
}

const RATING_COLORS = {
  Excellent: '#00B67A',
  Good: '#1877F2',
  Others: '#CBD5E1',
}

export function buildReportActor(
  userId: string,
  companyId: string,
  role: UserRole,
  permissions: Permission[],
): ReportActor {
  return {
    id: userId,
    companyId,
    role,
    permissions,
    canManage: role === 'admin' || role === 'hr',
  }
}

function assertCompanyContext(acting: ReportActor): void {
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

/** Company-wide for admin/hr; manager + direct reports for managers; self otherwise. */
export async function resolveScopedEmployeeIds(acting: ReportActor): Promise<string[] | 'all'> {
  if (acting.canManage || acting.role === 'admin' || acting.role === 'hr') {
    return 'all'
  }

  if (acting.role === 'manager') {
    const reportIds = await getDirectReportIds(acting.id, acting.companyId)
    return [acting.id, ...reportIds]
  }

  return [acting.id]
}

function parseDateOnly(value: string): Date {
  const date = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) {
    throw new AppError('Invalid date', 400, 'VALIDATION_ERROR')
  }
  return date
}

function formatListDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function formatPeriodLabel(startDate: string, endDate: string): string {
  const start = parseDateOnly(startDate)
  const end = parseDateOnly(endDate)
  const startLabel = start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const endLabel = end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  return `${startLabel} – ${endLabel}`
}

function toRecentDto(report: IReport): RecentReportDto {
  return {
    id: report._id.toString(),
    name: report.name,
    module: report.module,
    date: formatListDate(report.createdAt),
    status: report.status,
    exportFormat: report.exportFormat,
  }
}

function toDetailDto(report: IReport): ReportDetailDto {
  return {
    id: report._id.toString(),
    title: `${report.name} (${report.periodLabel})`,
    period: report.periodLabel,
    module: report.module,
    status: report.status,
    exportFormat: report.exportFormat,
    stats: report.stats,
    trend: report.trend,
    categories: report.categories,
    records: report.records,
  }
}

function resolveModuleFilter(moduleFilter?: string): ReportModule | null {
  if (!moduleFilter || moduleFilter === 'All Modules') return null
  const entry = Object.entries(MODULE_LABELS).find(
    ([key, label]) => label === moduleFilter || key === moduleFilter.toLowerCase(),
  )
  return (entry?.[0] as ReportModule | undefined) ?? null
}

function dateRangeBounds(dateRange?: string): { from?: Date; to?: Date } {
  if (!dateRange) return {}
  if (dateRange === 'This Month') {
    const now = new Date()
    return { from: new Date(now.getFullYear(), now.getMonth(), 1) }
  }
  if (dateRange === 'Last Month') {
    const now = new Date()
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
    return { from, to }
  }
  if (dateRange === 'This Quarter' || dateRange === 'This Quarter') {
    const now = new Date()
    const quarter = Math.floor(now.getMonth() / 3)
    return { from: new Date(now.getFullYear(), quarter * 3, 1) }
  }
  if (dateRange === 'This Year') {
    const now = new Date()
    return { from: new Date(now.getFullYear(), 0, 1) }
  }
  return {}
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function isAllDepartment(department?: string): boolean {
  return !department || department === 'All Departments'
}

function withDateBounds(
  field: string,
  bounds: { from?: Date; to?: Date },
  fallbackFrom?: Date,
): Record<string, unknown> {
  const from = bounds.from ?? fallbackFrom
  if (!from && !bounds.to) return {}
  return {
    [field]: {
      ...(from ? { $gte: from } : {}),
      ...(bounds.to ? { $lte: bounds.to } : {}),
    },
  }
}

function applyEmployeeScope(
  filter: Record<string, unknown>,
  employeeIds: Types.ObjectId[] | 'all',
  field = 'employeeId',
): void {
  if (employeeIds !== 'all') {
    filter[field] = { $in: employeeIds }
  }
}

function applyProjectScope(
  filter: Record<string, unknown>,
  employeeIds: Types.ObjectId[] | 'all',
): void {
  if (employeeIds !== 'all') {
    filter.$or = [{ managerId: { $in: employeeIds } }, { teamMemberIds: { $in: employeeIds } }]
  }
}

async function resolveOverviewScope(acting: ReportActor, query?: ListReportsQuery) {
  const scoped = await resolveScopedEmployeeIds(acting)
  const companyId = new Types.ObjectId(acting.companyId)
  const userFilter = companyUserFilter(acting, scoped)
  const bounds = dateRangeBounds(query?.dateRange)

  if (!isAllDepartment(query?.department)) {
    userFilter.department = new RegExp(`^${escapeRegex(query!.department!)}$`, 'i')
  }

  let employeeIds: Types.ObjectId[] | 'all' =
    scoped === 'all' ? 'all' : scoped.map((id) => new Types.ObjectId(id))

  if (!isAllDepartment(query?.department)) {
    const users = await User.find(userFilter).select('_id').lean()
    employeeIds = users.map((user) => user._id as Types.ObjectId)
  }

  return { companyId, userFilter, employeeIds, bounds }
}

function chartMonthAnchor(dateRange?: string): { monthsBack: number; end: Date } {
  const now = new Date()
  const bounds = dateRangeBounds(dateRange)
  const end = bounds.to ?? now

  if (dateRange === 'This Year') {
    return { monthsBack: end.getMonth(), end }
  }

  if (dateRange === 'This Quarter' || dateRange === 'This Quarter') {
    const start = bounds.from ?? new Date(end.getFullYear(), Math.floor(end.getMonth() / 3) * 3, 1)
    const monthsBack =
      (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
    return { monthsBack, end }
  }

  return { monthsBack: 5, end }
}

function companyUserFilter(acting: ReportActor, scoped: string[] | 'all') {
  const filter: Record<string, unknown> = {
    companyId: new Types.ObjectId(acting.companyId),
    role: { $ne: 'superadmin' },
  }
  if (scoped !== 'all') {
    filter._id = { $in: scoped.map((id) => new Types.ObjectId(id)) }
  }
  return filter
}

export async function getOverviewStats(
  acting: ReportActor,
  query?: ListReportsQuery,
): Promise<ReportsOverviewStatsDto> {
  assertCompanyContext(acting)
  const { companyId, userFilter, employeeIds, bounds } = await resolveOverviewScope(acting, query)
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const leaveFilter: Record<string, unknown> = {
    companyId,
    ...withDateBounds('appliedAt', bounds, monthStart),
  }
  applyEmployeeScope(leaveFilter, employeeIds)

  const projectFilter: Record<string, unknown> = { companyId }
  applyProjectScope(projectFilter, employeeIds)

  const [employees, projects, leaves, departments] = await Promise.all([
    User.countDocuments(userFilter),
    Project.countDocuments(projectFilter),
    LeaveRequest.countDocuments(leaveFilter),
    User.distinct('department', {
      ...userFilter,
      department: { $exists: true, $nin: [null, ''] },
    }),
  ])

  return {
    employees,
    projects,
    leaves,
    teams: departments.length,
  }
}

export async function getOverviewCharts(
  acting: ReportActor,
  query?: ListReportsQuery,
): Promise<ReportsOverviewChartsDto> {
  assertCompanyContext(acting)
  const { companyId, userFilter, employeeIds, bounds } = await resolveOverviewScope(acting, query)
  const { monthsBack, end } = chartMonthAnchor(query?.dateRange)
  const rangeStart = new Date(end.getFullYear(), end.getMonth() - monthsBack, 1)

  // Employee growth: cumulative headcount by join month over the selected window
  const users = await User.find(userFilter).select('joinDate createdAt').lean()
  const growthBuckets: { month: string; value: number }[] = []
  for (let i = monthsBack; i >= 0; i--) {
    const cursor = new Date(end.getFullYear(), end.getMonth() - i, 1)
    const cutoff = new Date(end.getFullYear(), end.getMonth() - i + 1, 0, 23, 59, 59, 999)
    const count = users.filter((u) => {
      const joined =
        u.joinDate ??
        ((u as { createdAt?: Date }).createdAt ?? null)
      return joined != null && joined <= cutoff
    }).length
    growthBuckets.push({ month: MONTH_LABELS[cursor.getMonth()], value: count })
  }

  const last = growthBuckets[growthBuckets.length - 1]?.value ?? 0
  const prev = growthBuckets[growthBuckets.length - 2]?.value ?? 0
  const employeeGrowthChange =
    prev > 0 ? Math.round(((last - prev) / prev) * 1000) / 10 : last > 0 ? 100 : 0

  // Project trend: projects started per month
  const projectFilter: Record<string, unknown> = {
    companyId,
    startDate: { $gte: rangeStart, ...(bounds.to ? { $lte: bounds.to } : {}) },
  }
  applyProjectScope(projectFilter, employeeIds)
  const projects = await Project.find(projectFilter).select('startDate').lean()
  const projectTrend = growthBuckets.map(({ month }, index) => {
    const cursor = new Date(end.getFullYear(), end.getMonth() - (monthsBack - index), 1)
    const next = new Date(end.getFullYear(), end.getMonth() - (monthsBack - index) + 1, 1)
    const value = projects.filter((p) => p.startDate >= cursor && p.startDate < next).length
    return { month, value }
  })

  // Leaves breakdown for the selected range (defaults to this month)
  const monthStart = new Date(end.getFullYear(), end.getMonth(), 1)
  const leaveFilter: Record<string, unknown> = {
    companyId,
    ...withDateBounds('appliedAt', bounds, monthStart),
  }
  applyEmployeeScope(leaveFilter, employeeIds)
  const leaves = await LeaveRequest.find(leaveFilter).select('status').lean()
  const leaveCounts = { approved: 0, pending: 0, rejected: 0 }
  for (const leave of leaves) {
    leaveCounts[leave.status] += 1
  }
  const leaveTotal = leaves.length || 1
  const leavesBreakdown = (['approved', 'pending', 'rejected'] as const).map((status) => ({
    label: status.charAt(0).toUpperCase() + status.slice(1),
    count: leaveCounts[status],
    percent: Math.round((leaveCounts[status] / leaveTotal) * 100),
    color: LEAVE_STATUS_COLORS[status],
  }))

  // Performance distribution (submitted reviews in range, default this year)
  const yearStart = new Date(end.getFullYear(), 0, 1)
  const reviewFilter: Record<string, unknown> = {
    companyId,
    status: 'submitted',
    ...withDateBounds('periodStart', bounds, yearStart),
  }
  applyEmployeeScope(reviewFilter, employeeIds)
  const reviews = await PerformanceReview.find(reviewFilter).select('rating').lean()
  let excellent = 0
  let good = 0
  let others = 0
  let ratingSum = 0
  for (const review of reviews) {
    ratingSum += review.rating
    if (review.rating >= 4.5) excellent += 1
    else if (review.rating >= 3.5) good += 1
    else others += 1
  }
  const reviewTotal = reviews.length || 1
  const performanceDistribution = [
    {
      name: 'Excellent',
      value: Math.round((excellent / reviewTotal) * 100),
      color: RATING_COLORS.Excellent,
    },
    {
      name: 'Good',
      value: Math.round((good / reviewTotal) * 100),
      color: RATING_COLORS.Good,
    },
    {
      name: 'Others',
      value: Math.round((others / reviewTotal) * 100),
      color: RATING_COLORS.Others,
    },
  ]
  const performanceAvgRating =
    reviews.length > 0 ? Math.round((ratingSum / reviews.length) * 10) / 10 : 0

  return {
    employeeGrowth: growthBuckets,
    employeeGrowthChange,
    projectTrend,
    leavesBreakdown,
    performanceDistribution,
    performanceAvgRating,
  }
}

export async function getReportOptions(acting: ReportActor): Promise<ReportOptionsDto> {
  assertCompanyContext(acting)
  const scoped = await resolveScopedEmployeeIds(acting)
  const userFilter = companyUserFilter(acting, scoped)

  const projectFilter: Record<string, unknown> = {
    companyId: new Types.ObjectId(acting.companyId),
  }
  if (scoped !== 'all') {
    const oids = scoped.map((id) => new Types.ObjectId(id))
    projectFilter.$or = [{ managerId: { $in: oids } }, { teamMemberIds: { $in: oids } }]
  }

  const [departments, employees, projects] = await Promise.all([
    User.distinct('department', {
      ...userFilter,
      department: { $exists: true, $nin: [null, ''] },
    }),
    User.find(userFilter).select('_id fullName').sort({ fullName: 1 }).limit(200).lean(),
    Project.find(projectFilter).select('_id name').sort({ name: 1 }).limit(200).lean(),
  ])

  return {
    departments: ['All Departments', ...(departments as string[]).filter(Boolean).sort()],
    employees: [
      { id: 'all', label: 'All Employee' },
      ...employees.map((e) => ({ id: e._id.toString(), label: e.fullName })),
    ],
    projects: [
      { id: 'all', label: 'All Projects' },
      ...projects.map((p) => ({ id: p._id.toString(), label: p.name })),
    ],
    statuses: ['All Status', 'Approved', 'Pending', 'Rejected', 'Active', 'Completed'],
    ratings: ['All Ratings', '4+ Stars', '3-4 Stars', 'Below 3'],
    groupBy: ['Department', 'Employee', 'Project', 'Month'],
  }
}

export async function listReports(
  acting: ReportActor,
  query: ListReportsQuery,
): Promise<RecentReportDto[]> {
  assertCompanyContext(acting)

  const filter: Record<string, unknown> = {
    companyId: new Types.ObjectId(acting.companyId),
  }

  // Managers only see reports they generated
  if (!acting.canManage) {
    filter.createdBy = new Types.ObjectId(acting.id)
  }

  const module = resolveModuleFilter(query.module)
  if (module) filter.module = module

  if (query.department && query.department !== 'All Departments') {
    filter['filters.department'] = query.department
  }

  const bounds = dateRangeBounds(query.dateRange)
  if (bounds.from || bounds.to) {
    filter.createdAt = {
      ...(bounds.from ? { $gte: bounds.from } : {}),
      ...(bounds.to ? { $lte: bounds.to } : {}),
    }
  }

  const reports = await Report.find(filter).sort({ createdAt: -1 }).limit(50)
  return reports.map(toRecentDto)
}

export async function getReportById(acting: ReportActor, reportId: string): Promise<ReportDetailDto> {
  assertCompanyContext(acting)

  if (!Types.ObjectId.isValid(reportId)) {
    throw new AppError('Report not found', 404, 'NOT_FOUND')
  }

  const filter: Record<string, unknown> = {
    _id: reportId,
    companyId: acting.companyId,
  }

  if (!acting.canManage) {
    filter.createdBy = acting.id
  }

  const report = await Report.findOne(filter)

  if (!report) {
    throw new AppError('Report not found', 404, 'NOT_FOUND')
  }

  return toDetailDto(report)
}

async function buildPayload(
  module: GeneratableReportModule,
  input: GenerateReportInput,
  companyId: string,
  scopedEmployeeIds: string[] | 'all',
) {
  const builderInput = {
    companyId,
    startDate: parseDateOnly(input.startDate),
    endDate: parseDateOnly(input.endDate),
    department: input.department,
    employee: input.employee,
    status: input.status,
    project: input.project,
    rating: input.rating,
    scopedEmployeeIds,
  }

  switch (module) {
    case 'leaves':
      return buildLeavesPayload(builderInput)
    case 'performance':
      return buildPerformancePayload(builderInput)
    case 'projects':
      return buildProjectsPayload(builderInput)
    case 'employees':
      return buildEmployeesPayload(builderInput)
    case 'expenses':
      return buildExpensesPayload(builderInput)
    default:
      throw new AppError('Unsupported report type', 400, 'VALIDATION_ERROR')
  }
}

export async function generateReport(
  acting: ReportActor,
  input: GenerateReportInput,
): Promise<GenerateReportResultDto> {
  assertCompanyContext(acting)

  const hubs = await getCompanyEnabledHubs(acting.companyId)
  const requiredHub = REPORT_TYPE_HUB[input.reportType]
  if (!hubs.includes(requiredHub)) {
    throw new AppError(
      'This report type is not available for your company',
      403,
      'HUB_DISABLED',
    )
  }

  if (parseDateOnly(input.startDate) > parseDateOnly(input.endDate)) {
    throw new AppError('Start date must be before end date', 400, 'VALIDATION_ERROR')
  }

  const scopedEmployeeIds = await resolveScopedEmployeeIds(acting)
  const periodLabel = formatPeriodLabel(input.startDate, input.endDate)
  const name = MODULE_REPORT_NAMES[input.reportType]

  const report = await Report.create({
    companyId: acting.companyId,
    createdBy: acting.id,
    name,
    module: input.reportType,
    status: 'processing',
    exportFormat: input.exportFormat,
    periodLabel,
    filters: {
      cycle: input.cycle,
      startDate: input.startDate,
      endDate: input.endDate,
      department: input.department,
      employee: input.employee,
      status: input.status,
      project: input.project,
      rating: input.rating,
      includeCharts: input.includeCharts,
      includeSummary: input.includeSummary,
      groupBy: input.groupBy,
    },
    stats: {
      totalRecords: 0,
      secondaryLabel: '—',
      secondaryValue: null,
      secondaryFormat: 'none',
      avgLabel: '—',
      avgValue: null,
      avgFormat: 'none',
      status: 'Processing',
    },
    trend: [],
    categories: [],
    records: [],
  })

  try {
    const payload = await buildPayload(
      input.reportType,
      input,
      acting.companyId,
      scopedEmployeeIds,
    )
    report.stats = { ...payload.stats, status: 'Completed' }
    report.trend = payload.trend
    report.categories = payload.categories
    report.records = payload.records
    report.status = 'ready'
    report.readyAt = new Date()
    report.error = undefined
    await report.save()
  } catch (err) {
    report.status = 'failed'
    report.stats = {
      ...report.stats,
      status: 'Failed',
    }
    report.error = err instanceof Error ? err.message : 'Report generation failed'
    await report.save()
  }

  return {
    id: report._id.toString(),
    status: report.status,
  }
}

export async function downloadReport(
  acting: ReportActor,
  reportId: string,
  format: ExportFormat,
): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
  assertCompanyContext(acting)

  if (!Types.ObjectId.isValid(reportId)) {
    throw new AppError('Report not found', 404, 'NOT_FOUND')
  }

  const filter: Record<string, unknown> = {
    _id: reportId,
    companyId: acting.companyId,
  }
  if (!acting.canManage) {
    filter.createdBy = acting.id
  }

  const report = await Report.findOne(filter)
  if (!report) {
    throw new AppError('Report not found', 404, 'NOT_FOUND')
  }
  if (report.status !== 'ready') {
    throw new AppError('Report is not ready for download', 409, 'REPORT_NOT_READY')
  }

  const base = `report-${report._id.toString()}`

  if (format === 'excel') {
    return {
      buffer: await buildReportExcel(report),
      filename: `${base}.xlsx`,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }
  }

  if (format === 'pdf') {
    return {
      buffer: await buildReportPdf(report),
      filename: `${base}.pdf`,
      contentType: 'application/pdf',
    }
  }

  return {
    buffer: buildReportCsv(report),
    filename: `${base}.csv`,
    contentType: 'text/csv; charset=utf-8',
  }
}
