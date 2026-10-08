import type { AuthUser } from '@/features/auth/model/types'
import { apiClient } from '@/shared/api/axios'

export type TeamWorkloadMember = {
  userId: string
  fullName: string
  openTasks: number
  completedTasks: number
  totalTasks: number
}

export const teamApi = {
  async listMembers(): Promise<{
    members: AuthUser[]
    attendanceById: Record<string, number>
  }> {
    const { data } = await apiClient.get<{
      members: AuthUser[]
      attendanceById: Record<string, number>
    }>('/team/members')
    return {
      members: data.members,
      attendanceById: data.attendanceById ?? {},
    }
  },

  async getMember(id: string): Promise<AuthUser> {
    const { data } = await apiClient.get<{ member: AuthUser }>(`/team/members/${id}`)
    return data.member
  },

  async getWorkload(): Promise<TeamWorkloadMember[]> {
    const { data } = await apiClient.get<{ members: TeamWorkloadMember[] }>('/team/workload')
    return data.members
  },
}
