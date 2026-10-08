/** Modules available for org report generation. */
export type GeneratableReportModule =
  | 'employees'
  | 'projects'
  | 'leaves'
  | 'performance'
  | 'expenses'

/** All modules that can appear in report lists / history. */
export type ReportModule = GeneratableReportModule

export type ReportStatus = 'ready' | 'processing' | 'failed'

export type RecordStatus = 'approved' | 'pending' | 'rejected' | 'active' | 'completed' | 'inactive'

export type ExportFormat = 'pdf' | 'excel' | 'csv'

export type ReportMetricFormat = 'currency' | 'number' | 'percent' | 'days' | 'rating' | 'none'

export type RecentReport = {
  id: string
  name: string
  module: ReportModule
  date: string
  status: ReportStatus
  exportFormat?: ExportFormat
}

export type ReportsOverviewStats = {
  employees: number
  projects: number
  leaves: number
  teams: number
}

export type ReportsOverviewFilters = {
  module: string
  department: string
  dateRange: string
}

export type GrowthPoint = {
  month: string
  value: number
}

export type TrendBar = {
  month: string
  value: number
}

export type LeaveBreakdownItem = {
  label: string
  count: number
  percent: number
  color: string
}

export type RatingSlice = {
  name: string
  value: number
  color: string
}

export type GenerateReportValues = {
  cycle: 'monthly' | 'weekly'
  reportType: GeneratableReportModule
  startDate: string
  endDate: string
  department: string
  employee: string
  status: string
  project: string
  rating: string
  exportFormat: ExportFormat
  includeCharts: boolean
  includeSummary: boolean
  groupBy: string
}

export type GenerateReportResult = {
  id: string
  status: ReportStatus
}

/** Module-agnostic row: category/metric semantics depend on `module`. */
export type ReportRecord = {
  id: string
  date: string
  category: string
  employeeName: string
  employeeAvatar?: string
  metric: number | null
  metricFormat: ReportMetricFormat
  status: RecordStatus
  detail: string
}

export type ReportDetailStats = {
  totalRecords: number
  secondaryLabel: string
  secondaryValue: number | null
  secondaryFormat: ReportMetricFormat
  avgLabel: string
  avgValue: number | null
  avgFormat: ReportMetricFormat
  status: string
}

export type CategoryBreakdownItem = {
  name: string
  percent: number
  color: string
}

export type ReportDetail = {
  id: string
  title: string
  period: string
  module: ReportModule
  status: ReportStatus
  exportFormat: ExportFormat
  stats: ReportDetailStats
  trend: TrendBar[]
  categories: CategoryBreakdownItem[]
  records: ReportRecord[]
}

export type ReportDataFilters = {
  search: string
  status: string
  category: string
}

export type ReportsOverviewCharts = {
  employeeGrowth: GrowthPoint[]
  employeeGrowthChange: number
  projectTrend: TrendBar[]
  leavesBreakdown: LeaveBreakdownItem[]
  performanceDistribution: RatingSlice[]
  performanceAvgRating: number
}

export type ReportOptionItem = {
  id: string
  label: string
}

export type ReportOptions = {
  departments: string[]
  employees: ReportOptionItem[]
  projects: ReportOptionItem[]
  statuses: string[]
  ratings: string[]
  groupBy: string[]
}
