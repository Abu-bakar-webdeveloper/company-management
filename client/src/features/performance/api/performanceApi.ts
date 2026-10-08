import { apiClient } from '@/shared/api/axios'
import type {
  AnalyticsBundle,
  AnalyticsParams,
  AnalyticsStats,
  Calibration,
  CreateReviewPayload,
  EmployeeMetricsResponse,
  Goal,
  KpiTemplate,
  ListPerformanceParams,
  MyPerformance,
  PaginatedResult,
  PerformanceAuditEntry,
  PerformanceDetail,
  PerformanceOptions,
  PerformanceRecord,
  PerformanceReview,
  PerformanceStats,
  PerformanceSummary,
  ReviewCycle,
  UpdateReviewPayload,
} from '@/features/performance/model/contracts'

function buildQuery(params: Record<string, string | number | undefined>): Record<string, string | number> {
  const query: Record<string, string | number> = {}
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '' && value !== 'all') {
      query[key] = value
    }
  }
  return query
}

export const performanceApi = {
  async list(params?: ListPerformanceParams): Promise<PaginatedResult<PerformanceRecord>> {
    const { data } = await apiClient.get<PaginatedResult<PerformanceRecord>>('/performance', {
      params: buildQuery({
        page: params?.page,
        limit: params?.limit,
        search: params?.search,
        rating: params?.rating,
        status: params?.status,
        department: params?.department,
        managerId: params?.managerId,
        periodStart: params?.periodStart,
      }),
    })
    return data
  },

  async getStats(periodStart?: string): Promise<PerformanceStats> {
    const { data } = await apiClient.get<{ stats: PerformanceStats }>('/performance/stats', {
      params: periodStart ? { periodStart } : undefined,
    })
    return data.stats
  },

  async getAnalytics(params?: AnalyticsParams): Promise<AnalyticsBundle> {
    const { data } = await apiClient.get<{ analytics: AnalyticsBundle }>('/performance/analytics', {
      params: buildQuery({
        page: params?.page,
        limit: params?.limit,
        department: params?.department,
        managerId: params?.manager === 'All Managers' ? undefined : params?.manager,
        ratingRange: params?.ratingRange,
        periodStart: params?.periodStart,
      }),
    })
    return data.analytics
  },

  async getAnalyticsStats(params?: AnalyticsParams): Promise<AnalyticsStats> {
    const analytics = await this.getAnalytics(params)
    const {
      overallEfficiency,
      efficiencyChange,
      reviewCompletion,
      avgRating,
      topDepartment,
      topDepartmentEfficiency,
    } = analytics
    return {
      overallEfficiency,
      efficiencyChange,
      reviewCompletion,
      avgRating,
      topDepartment,
      topDepartmentEfficiency,
    }
  },

  async getOptions(): Promise<PerformanceOptions> {
    const { data } = await apiClient.get<{ options: PerformanceOptions }>('/performance/options')
    return data.options
  },

  async getMe(periodStart?: string): Promise<MyPerformance> {
    const { data } = await apiClient.get<{ performance: MyPerformance }>('/performance/me', {
      params: periodStart ? { periodStart } : undefined,
    })
    return data.performance
  },

  async getById(employeeId: string, periodStart?: string): Promise<PerformanceDetail | undefined> {
    try {
      const { data } = await apiClient.get<{ detail: PerformanceDetail }>(
        `/performance/employees/${employeeId}`,
        { params: periodStart ? { periodStart } : undefined },
      )
      return data.detail
    } catch {
      return undefined
    }
  },

  async getMetrics(employeeId: string, periodStart?: string): Promise<EmployeeMetricsResponse> {
    const { data } = await apiClient.get<{ metrics: EmployeeMetricsResponse }>(
      `/performance/employees/${employeeId}/metrics`,
      { params: periodStart ? { periodStart } : undefined },
    )
    return data.metrics
  },

  async getReview(reviewId: string): Promise<PerformanceReview | undefined> {
    try {
      const { data } = await apiClient.get<{ review: PerformanceReview }>(
        `/performance/reviews/${reviewId}`,
      )
      return data.review
    } catch {
      return undefined
    }
  },

  async listReviews(employeeId: string, limit = 24): Promise<PerformanceReview[]> {
    const { data } = await apiClient.get<PaginatedResult<PerformanceReview>>(
      `/performance/employees/${employeeId}/reviews`,
      { params: { page: 1, limit } },
    )
    return data.items
  },

  async createReview(employeeId: string, values: CreateReviewPayload): Promise<PerformanceReview> {
    const { data } = await apiClient.post<{ review: PerformanceReview }>(
      `/performance/employees/${employeeId}/reviews`,
      values,
    )
    return data.review
  },

  async updateReview(reviewId: string, values: UpdateReviewPayload): Promise<PerformanceReview> {
    const { data } = await apiClient.patch<{ review: PerformanceReview }>(
      `/performance/reviews/${reviewId}`,
      values,
    )
    return data.review
  },

  async getSummary(employeeId: string, periodStart?: string): Promise<PerformanceSummary> {
    const { data } = await apiClient.get<{ summary: PerformanceSummary }>(
      `/performance/employees/${employeeId}/summary`,
      { params: periodStart ? { periodStart } : undefined },
    )
    return data.summary
  },

  async getActiveKpiTemplate(role: 'employee' | 'manager'): Promise<KpiTemplate> {
    const { data } = await apiClient.get<{ template: KpiTemplate }>(
      '/performance/kpi-templates/active',
      { params: { role } },
    )
    return data.template
  },

  async listKpiTemplates(role?: 'employee' | 'manager'): Promise<KpiTemplate[]> {
    const { data } = await apiClient.get<{ templates: KpiTemplate[] }>(
      '/performance/kpi-templates',
      { params: role ? { role } : undefined },
    )
    return data.templates
  },

  async createKpiTemplate(payload: {
    role: 'employee' | 'manager'
    name: string
    categories: KpiTemplate['categories']
    isActive?: boolean
  }): Promise<KpiTemplate> {
    const { data } = await apiClient.post<{ template: KpiTemplate }>(
      '/performance/kpi-templates',
      payload,
    )
    return data.template
  },

  async updateKpiTemplate(
    id: string,
    payload: Partial<{ name: string; categories: KpiTemplate['categories']; isActive: boolean }>,
  ): Promise<KpiTemplate> {
    const { data } = await apiClient.patch<{ template: KpiTemplate }>(
      `/performance/kpi-templates/${id}`,
      payload,
    )
    return data.template
  },

  async activateKpiTemplate(id: string): Promise<KpiTemplate> {
    const { data } = await apiClient.post<{ template: KpiTemplate }>(
      `/performance/kpi-templates/${id}/activate`,
    )
    return data.template
  },

  async listAuditLog(limit = 50): Promise<PerformanceAuditEntry[]> {
    const { data } = await apiClient.get<{ entries: PerformanceAuditEntry[] }>(
      '/performance/audit-log',
      { params: { limit } },
    )
    return data.entries
  },

  async listCycles(): Promise<ReviewCycle[]> {
    const { data } = await apiClient.get<{ cycles: ReviewCycle[] }>('/performance/cycles')
    return data.cycles
  },

  async createCycle(payload: {
    name: string
    type: ReviewCycle['type']
    periodStart: string
    periodEnd: string
    status?: ReviewCycle['status']
  }): Promise<ReviewCycle> {
    const { data } = await apiClient.post<{ cycle: ReviewCycle }>('/performance/cycles', payload)
    return data.cycle
  },

  async updateCycle(
    id: string,
    payload: Partial<{
      name: string
      type: ReviewCycle['type']
      periodStart: string
      periodEnd: string
      status: ReviewCycle['status']
    }>,
  ): Promise<ReviewCycle> {
    const { data } = await apiClient.patch<{ cycle: ReviewCycle }>(
      `/performance/cycles/${id}`,
      payload,
    )
    return data.cycle
  },

  async listGoals(employeeId?: string): Promise<Goal[]> {
    const { data } = await apiClient.get<{ goals: Goal[] }>('/performance/goals', {
      params: employeeId ? { employeeId } : undefined,
    })
    return data.goals
  },

  async createGoal(payload: {
    employeeId: string
    title: string
    description?: string
    cycleId?: string
    keyResults?: Goal['keyResults']
  }): Promise<Goal> {
    const { data } = await apiClient.post<{ goal: Goal }>('/performance/goals', payload)
    return data.goal
  },

  async updateGoal(
    id: string,
    payload: Partial<{
      title: string
      description: string
      status: Goal['status']
      keyResults: Goal['keyResults']
      managerConfirmed: boolean
    }>,
  ): Promise<Goal> {
    const { data } = await apiClient.patch<{ goal: Goal }>(`/performance/goals/${id}`, payload)
    return data.goal
  },

  async getCalibration(periodStart?: string): Promise<Calibration> {
    const { data } = await apiClient.get<{ calibration: Calibration }>(
      '/performance/calibration',
      { params: periodStart ? { periodStart } : undefined },
    )
    return data.calibration
  },
}
