import type {
  AttendanceDashboard,
  AttendanceDay,
  AttendanceEmployeeProfile,
  AttendanceListSummary,
  AttendancePunchType,
  AttendanceSettings,
  ListAttendanceParams,
  PunchClientLocation,
  TodaySession,
} from '@/features/attendance/model/types'
import { apiClient } from '@/shared/api/axios'

export const attendanceApi = {
  async punch(
    type: AttendancePunchType,
    location?: PunchClientLocation,
  ): Promise<TodaySession> {
    const { data } = await apiClient.post<{ session: TodaySession }>('/attendance/punch', {
      type,
      ...(location ? { location } : {}),
    })
    return data.session
  },

  async getToday(): Promise<TodaySession> {
    const { data } = await apiClient.get<{ session: TodaySession }>('/attendance/me/today')
    return data.session
  },

  async listMine(params?: ListAttendanceParams) {
    const { data } = await apiClient.get<{
      days: AttendanceDay[]
      pagination: { page: number; limit: number; total: number; totalPages: number }
      summary: AttendanceListSummary
    }>('/attendance/me', { params })
    return data
  },

  async listEmployee(employeeId: string, params?: ListAttendanceParams) {
    const { data } = await apiClient.get<{
      days: AttendanceDay[]
      pagination: { page: number; limit: number; total: number; totalPages: number }
      summary: AttendanceListSummary
      profile: AttendanceEmployeeProfile
    }>(`/attendance/employees/${employeeId}`, { params })
    return data
  },

  async getDashboard(params?: {
    date?: string
    scope?: 'mine' | 'team' | 'company'
    department?: string
    weekFrom?: string
  }): Promise<AttendanceDashboard> {
    const { data } = await apiClient.get<{ dashboard: AttendanceDashboard }>(
      '/attendance/dashboard',
      { params },
    )
    return data.dashboard
  },

  async getSettings(): Promise<AttendanceSettings> {
    const { data } = await apiClient.get<{ settings: AttendanceSettings }>('/attendance/settings')
    return data.settings
  },

  async updateSettings(
    payload: Partial<AttendanceSettings>,
  ): Promise<AttendanceSettings> {
    const { data } = await apiClient.put<{ settings: AttendanceSettings }>(
      '/attendance/settings',
      payload,
    )
    return data.settings
  },

  async updateDay(
    id: string,
    payload: {
      status?: string
      clockInAt?: string | null
      clockOutAt?: string | null
      notes?: string
      totalWorkMinutes?: number
    },
  ): Promise<AttendanceDay> {
    const { data } = await apiClient.patch<{ day: AttendanceDay }>(
      `/attendance/days/${id}`,
      payload,
    )
    return data.day
  },

  async exportCsv(params: { employeeId?: string; from: string; to: string }): Promise<Blob> {
    const { data, headers } = await apiClient.get<Blob>('/attendance/export', {
      params,
      responseType: 'blob',
    })
    const contentType = String(headers['content-type'] ?? '')
    if (contentType.includes('application/json')) {
      const text = await data.text()
      let message = 'Unable to export attendance'
      try {
        const parsed = JSON.parse(text) as { message?: string; error?: string }
        message = parsed.message ?? parsed.error ?? message
      } catch {
        /* keep default */
      }
      throw new Error(message)
    }
    return data
  },
}
