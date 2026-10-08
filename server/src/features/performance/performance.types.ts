import type {
  PerformanceLevel,
  PerformanceReviewStatus,
  ReviewRoiSnapshot,
} from './performance-review.model.js'
import type { KpiTemplateSnapshot } from './kpi-template.model.js'

export type { PerformanceLevel }

/** Includes legacy star-derived average/critical for pre-KPI reviews. */
export type PerformanceStatus = PerformanceLevel | 'average' | 'critical'

export type PerformanceBreakdownItem = {
  key: string
  label: string
  value: number
  color: string
}

export type PerformanceMetricsDto = {
  metricType: 'employee' | 'manager'
  tasksCompleted: number
  tasksPending: number
  deadlinesMet: number
  attendance: number
  efficiency: number
  taskCompletionRate: number
  projectContribution: number
  teamCollaboration: number
  projectsTotal: number
  projectsCompleted: number
  avgProjectProgress: number
  milestoneCompletion: number
  breakdown: PerformanceBreakdownItem[]
}

export type PerformanceRecordDto = {
  employeeId: string
  employeeName: string
  employeeEmail: string
  employeeAvatar?: string
  role: string
  department: string
  rating: number | null
  finalAdjustedScore: number | null
  performanceLevel: PerformanceLevel | null
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

export type PerformanceReviewDto = {
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
  kpiTemplateSnapshot?: KpiTemplateSnapshot | null
  kpiScores: { subKpiId: string; marksObtained: number; remarks: string }[]
  categoryScores: { name: string; maxMarks: number; obtained: number }[]
  totalScore: number | null
  bonus: number
  penalty: number
  bonusPenaltyNote: string
  finalAdjustedScore: number | null
  performanceLevel: PerformanceLevel | null
  roi?: ReviewRoiSnapshot | null
  templateOutdated?: boolean
}

export type PerformanceDetailDto = PerformanceRecordDto & {
  managerReview: PerformanceReviewDto | null
  recentReviews: PerformanceReviewDto[]
  trendData: { month: string; current: number; goal: number }[]
  canReview: boolean
  subjectRole: 'employee' | 'manager' | string
  breakdown: PerformanceBreakdownItem[]
  projectsCompleted: number
  projectsTotal: number
  avgProjectProgress: number
  milestoneCompletion: number
  categoryScores: { name: string; maxMarks: number; obtained: number }[]
  roi?: ReviewRoiSnapshot | null
  bonusPenaltyNote?: string
  auditTrail?: PerformanceAuditEntryDto[]
}

export type PerformanceStatsDto = {
  avgRating: number
  avgScore: number
  avgRatingChange: number
  avgRoiIndex: number
  topPerformer: string
  reviewsDue: number
  lowPerformance: number
  monthlyTrendData: { month: string; rating: number; score: number }[]
  departmentPerformance: { name: string; score: number; color: string }[]
  categoryBenchmarks: { name: string; avgObtained: number; maxMarks: number }[]
}

export type AnalyticsStatsDto = {
  overallEfficiency: number
  efficiencyChange: number
  reviewCompletion: number
  avgRating: number
  topDepartment: string
  topDepartmentEfficiency: number
}

export type AnalyticsBundleDto = AnalyticsStatsDto & {
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
  categoryBenchmarks: { name: string; avgObtained: number; maxMarks: number; department?: string }[]
  valueLeaderboard: {
    employeeId: string
    employeeName: string
    department: string
    roiIndex: number
    finalAdjustedScore: number | null
  }[]
  outdatedTemplateCount: number
}

export type PerformanceOptionsDto = {
  departments: string[]
  managers: { id: string; name: string }[]
  periods: { periodStart: string; periodEnd: string; periodLabel: string }[]
}

export type PerformanceSummaryDto = {
  overallRating: number | null
  finalAdjustedScore: number | null
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

export type MyPerformanceDto = {
  subjectRole: 'employee' | 'manager'
  employeeId: string
  employeeName: string
  employeeAvatar?: string
  department: string
  avgRating: number | null
  avgScore: number | null
  avgRatingChange: number
  currentMonthRating: number | null
  currentMonthScore: number | null
  tasksCompleted: number
  projectsCompleted: number
  projectsTotal: number
  efficiency: number
  status: PerformanceStatus | null
  periodStart: string
  periodEnd: string
  periodLabel: string
  metrics: PerformanceMetricsDto
  breakdown: PerformanceBreakdownItem[]
  monthlyTrendData: { month: string; rating: number; score: number }[]
  recentReviews: PerformanceReviewDto[]
  categoryScores: { name: string; maxMarks: number; obtained: number }[]
  bonus: number
  penalty: number
  bonusPenaltyNote: string
}

export type PerformanceAuditEntryDto = {
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

export type KpiTemplateDto = {
  id: string
  companyId: string
  role: 'employee' | 'manager'
  name: string
  isActive: boolean
  version: number
  categories: {
    name: string
    weightPct: number
    maxMarks: number
    subKpis: { id: string; label: string; maxMarks: number }[]
  }[]
  createdAt: string
  updatedAt: string
}

export type ReviewCycleDto = {
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

export type GoalDto = {
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

export type CalibrationBucketDto = {
  level: PerformanceLevel
  count: number
  pct: number
}

export type CalibrationDto = {
  totalReviews: number
  avgScore: number
  distribution: CalibrationBucketDto[]
  byDepartment: { department: string; avgScore: number; excellentPct: number; count: number }[]
  byManager: { managerId: string; managerName: string; avgScore: number; excellentPct: number; count: number }[]
  warnings: string[]
}

export const DEPARTMENT_COLORS = ['#7C3AED', '#1877F2', '#FF9F43', '#00B67A', '#DC2626', '#64748B']

export const RATING_DISTRIBUTION_COLORS = ['#1877F2', '#7C3AED', '#FF9F43']
