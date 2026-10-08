export type PerformanceLevel = 'excellent' | 'good' | 'needs_improvement' | 'poor'
export type PerformanceStatus = PerformanceLevel | 'average' | 'critical'
export type PerformanceReviewStatus = 'draft' | 'submitted'

export type PerformanceBreakdownItem = {
  key: string
  label: string
  value: number
  color: string
}

export type PerformanceMetrics = {
  metricType?: 'employee' | 'manager'
  tasksCompleted: number
  tasksPending: number
  deadlinesMet: number
  attendance: number
  efficiency: number
  taskCompletionRate?: number
  projectContribution?: number
  teamCollaboration?: number
  projectsTotal?: number
  projectsCompleted?: number
  avgProjectProgress?: number
  milestoneCompletion?: number
  breakdown?: PerformanceBreakdownItem[]
}

export type KpiSubKpi = { id: string; label: string; maxMarks: number }
export type KpiCategory = {
  name: string
  weightPct: number
  maxMarks: number
  subKpis: KpiSubKpi[]
}

export type KpiTemplate = {
  id: string
  companyId: string
  role: 'employee' | 'manager'
  name: string
  isActive: boolean
  version: number
  categories: KpiCategory[]
  createdAt: string
  updatedAt: string
}

export type KpiScoreValue = {
  subKpiId: string
  marksObtained: number
  remarks: string
}

export type ReviewRoi = {
  outputValue: number
  effortInput: number
  roiIndex: number
  financialRoi: number | null
  cost?: number | null
  businessValue?: number | null
}

export type PerformanceAuditEntry = {
  id: string
  reviewId: string
  employeeId: string
  employeeName?: string
  actorId: string
  actorName?: string
  type: 'bonus' | 'penalty' | 'score_change'
  amount: number
  note: string
  createdAt: string
}

export type PerformanceRecord = {
  employeeId: string
  employeeName: string
  employeeEmail: string
  employeeAvatar?: string
  role: string
  department: string
  rating: number | null
  finalAdjustedScore?: number | null
  performanceLevel?: PerformanceLevel | null
  tasksCompleted: number
  tasksPending: number
  efficiency: number
  attendance: number
  deadlinesMet: number
  status: PerformanceStatus | null
  trend: number
  roiIndex?: number | null
  templateOutdated?: boolean
}

export type PerformanceReview = {
  id: string
  employeeId: string
  reviewerId: string
  reviewerName: string
  reviewerRole: string
  reviewerAvatar?: string
  rating: number
  periodStart: string
  periodEnd: string
  periodLabel: string
  period: string
  feedback: string
  status: PerformanceReviewStatus
  tasksCompleted: number
  tasksPending: number
  attendance: number
  efficiency: number
  deadlinesMet: number
  createdAt: string
  cycleId?: string | null
  kpiTemplateId?: string | null
  kpiTemplateSnapshot?: {
    name: string
    role: 'employee' | 'manager'
    version: number
    categories: KpiCategory[]
  } | null
  kpiScores?: KpiScoreValue[]
  categoryScores?: { name: string; maxMarks: number; obtained: number }[]
  totalScore?: number | null
  bonus?: number
  penalty?: number
  bonusPenaltyNote?: string
  finalAdjustedScore?: number | null
  performanceLevel?: PerformanceLevel | null
  roi?: ReviewRoi | null
  templateOutdated?: boolean
}

export type PerformanceDetail = PerformanceRecord & {
  managerReview: PerformanceReview | null
  recentReviews: PerformanceReview[]
  trendData: { month: string; current: number; goal: number }[]
  canReview?: boolean
  subjectRole?: string
  breakdown?: PerformanceBreakdownItem[]
  projectsCompleted?: number
  projectsTotal?: number
  avgProjectProgress?: number
  milestoneCompletion?: number
  categoryScores?: { name: string; maxMarks: number; obtained: number }[]
  roi?: ReviewRoi | null
  bonusPenaltyNote?: string
  auditTrail?: PerformanceAuditEntry[]
}

export type PerformanceStats = {
  avgRating: number
  avgScore?: number
  avgRatingChange: number
  avgRoiIndex?: number
  topPerformer: string
  reviewsDue: number
  lowPerformance: number
  monthlyTrendData: { month: string; rating: number; score?: number }[]
  departmentPerformance: { name: string; score: number; color: string }[]
  categoryBenchmarks?: { name: string; avgObtained: number; maxMarks: number }[]
}

export type AnalyticsStats = {
  overallEfficiency: number
  efficiencyChange: number
  reviewCompletion: number
  avgRating: number
  topDepartment: string
  topDepartmentEfficiency: number
}

export type AnalyticsBundle = AnalyticsStats & {
  analyticsTrendData: { month: string; value: number }[]
  departmentRatings: { name: string; rating: number; color: string }[]
  ratingDistribution: { name: string; value: number; color: string }[]
  productivityData: { week: string; efficiency: number; attendance: number }[]
  topDepartmentPerformers: {
    id: string
    department: string
    head: string
    rating: number
    efficiency: number
    status: PerformanceStatus
  }[]
  totalReviews: number
  categoryBenchmarks?: { name: string; avgObtained: number; maxMarks: number }[]
  valueLeaderboard?: {
    employeeId: string
    employeeName: string
    department: string
    roiIndex: number
    finalAdjustedScore: number | null
  }[]
  outdatedTemplateCount?: number
}

export type PerformanceOptions = {
  departments: string[]
  managers: { id: string; name: string }[]
  periods: { periodStart: string; periodEnd: string; periodLabel: string }[]
}

export type PerformanceSummary = {
  overallRating: number | null
  finalAdjustedScore?: number | null
  reviewPeriod: string
  reviewTitle: string
  reviewText: string
  reviewStatus: 'approved' | 'pending' | 'none'
  tasksCompleted: number
  tasksPending: number
  efficiency: number
  attendance: number
  status: PerformanceStatus | null
  projects: number
}

export type MyPerformance = {
  subjectRole: 'employee' | 'manager'
  employeeId: string
  employeeName: string
  employeeAvatar?: string
  department: string
  avgRating: number | null
  avgScore?: number | null
  avgRatingChange: number
  currentMonthRating: number | null
  currentMonthScore?: number | null
  tasksCompleted: number
  projectsCompleted: number
  projectsTotal: number
  efficiency: number
  status: PerformanceStatus | null
  periodStart: string
  periodEnd: string
  periodLabel: string
  metrics: PerformanceMetrics
  breakdown: PerformanceBreakdownItem[]
  monthlyTrendData: { month: string; rating: number; score?: number }[]
  recentReviews: PerformanceReview[]
  categoryScores?: { name: string; maxMarks: number; obtained: number }[]
  bonus?: number
  penalty?: number
  bonusPenaltyNote?: string
}

export type ReviewCycle = {
  id: string
  name: string
  type: 'quarterly' | 'annual' | 'custom'
  periodStart: string
  periodEnd: string
  status: 'draft' | 'active' | 'closed'
  completionPct: number
  dueCount: number
  unscoredCount: number
}

export type Goal = {
  id: string
  employeeId: string
  cycleId?: string | null
  periodStart?: string | null
  periodEnd?: string | null
  title: string
  description: string
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  progressPct: number
  keyResults: { id: string; title: string; target: number; current: number; unit: string }[]
  managerConfirmed: boolean
  createdAt: string
}

export type Calibration = {
  totalReviews: number
  avgScore: number
  distribution: { level: PerformanceLevel; count: number; pct: number }[]
  byDepartment: { department: string; avgScore: number; excellentPct: number; count: number }[]
  byManager: {
    managerId: string
    managerName: string
    avgScore: number
    excellentPct: number
    count: number
  }[]
  warnings: string[]
}

export type PerformanceListFilters = {
  search?: string
  rating?: 'all' | '4+' | '3-4' | 'below3'
  status?: PerformanceStatus | 'all'
  department?: string
  managerId?: string
  periodStart?: string
}

export type AnalyticsFilters = {
  department?: string
  manager?: string
  ratingRange?: string
  periodStart?: string
}

export type ReviewFormValues = {
  employeeId: string
  periodStart: string
  periodLabel: string
  rating: number
  feedback: string
  status: 'draft' | 'submitted'
  kpiScores: KpiScoreValue[]
  bonus: number
  penalty: number
  bonusPenaltyNote: string
}

export type CreateReviewPayload = {
  periodStart: string
  rating?: number
  feedback?: string
  status: 'draft' | 'submitted'
  kpiScores?: KpiScoreValue[]
  bonus?: number
  penalty?: number
  bonusPenaltyNote?: string
  cycleId?: string
}

export type UpdateReviewPayload = Partial<CreateReviewPayload>

export type PaginatedResult<T> = {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type ListPerformanceParams = PerformanceListFilters & {
  page?: number
  limit?: number
}

export type AnalyticsParams = AnalyticsFilters & {
  page?: number
  limit?: number
}

export type EmployeeMetricsResponse = PerformanceMetrics & {
  periodStart: string
  periodEnd: string
  periodLabel: string
}
