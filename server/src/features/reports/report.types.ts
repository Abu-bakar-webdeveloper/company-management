import type {
  CategoryBreakdownSnapshot,
  ExportFormat,
  GeneratableReportModule,
  ReportDetailStatsSnapshot,
  ReportModule,
  ReportRecordSnapshot,
  ReportStatus,
  TrendBarSnapshot,
} from './report.model.js'
import type { UserRole } from '../auth/auth.types.js'
import type { Permission } from '../auth/permissions.js'

export type ReportActor = {
  id: string
  companyId: string
  role: UserRole
  permissions: Permission[]
  /** Admin / HR — full company scope */
  canManage: boolean
}

export type ReportsOverviewStatsDto = {
  employees: number
  projects: number
  leaves: number
  teams: number
}

export type RecentReportDto = {
  id: string
  name: string
  module: ReportModule
  date: string
  status: ReportStatus
  exportFormat?: ExportFormat
}

export type ReportDetailDto = {
  id: string
  title: string
  period: string
  module: ReportModule
  status: ReportStatus
  exportFormat: ExportFormat
  stats: ReportDetailStatsSnapshot
  trend: TrendBarSnapshot[]
  categories: CategoryBreakdownSnapshot[]
  records: ReportRecordSnapshot[]
}

export type GenerateReportResultDto = {
  id: string
  status: ReportStatus
}

export type ReportPayload = {
  stats: ReportDetailStatsSnapshot
  trend: TrendBarSnapshot[]
  categories: CategoryBreakdownSnapshot[]
  records: ReportRecordSnapshot[]
}

export type ModuleBuilderInput = {
  companyId: string
  startDate: Date
  endDate: Date
  department: string
  employee: string
  status: string
  project: string
  rating: string
  /** When set, builders must only include these employee ids (manager team scope). */
  scopedEmployeeIds: string[] | 'all'
}

export type GrowthPointDto = {
  month: string
  value: number
}

export type LeaveBreakdownItemDto = {
  label: string
  count: number
  percent: number
  color: string
}

export type RatingSliceDto = {
  name: string
  value: number
  color: string
}

export type ReportsOverviewChartsDto = {
  employeeGrowth: GrowthPointDto[]
  employeeGrowthChange: number
  projectTrend: TrendBarSnapshot[]
  leavesBreakdown: LeaveBreakdownItemDto[]
  performanceDistribution: RatingSliceDto[]
  performanceAvgRating: number
}

export type ReportOptionItem = {
  id: string
  label: string
}

export type ReportOptionsDto = {
  departments: string[]
  employees: ReportOptionItem[]
  projects: ReportOptionItem[]
  statuses: string[]
  ratings: string[]
  groupBy: string[]
}

export type GeneratableModule = GeneratableReportModule
