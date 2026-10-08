import type { AuthUser } from '@/features/auth/model/types'
import type { ProjectFormValues } from '@/features/projects/model/schemas'
import type { Project, ProjectStats } from '@/features/projects/model/types'
import { apiClient } from '@/shared/api/axios'

export type ListProjectsParams = {
  page?: number
  limit?: number
  status?: 'in_progress' | 'completed' | 'delayed'
  search?: string
  memberId?: string
  clientId?: string
}

export type ListProjectsResult = {
  projects: Project[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type ProjectOverviewPoint = {
  month: string
  active: number
  completed: number
  activeCount: number
  completedCount: number
}

export type ProjectMilestone = {
  id: string
  projectId: string
  title: string
  dueDate?: string
  status: 'pending' | 'completed'
  sortOrder: number
  weightPercent: number
}

export type MilestoneHubItem = {
  id: string
  title: string
  projectId: string
  projectName: string
  dueDate: string
}

export type MilestoneStats = {
  total: number
  pending: number
  completed: number
  overdue: number
  dueSoon: number
  overdueItems: MilestoneHubItem[]
}

export type CreateMilestonePayload = {
  title: string
  dueDate?: string
}

export type UpdateMilestonePayload = {
  title?: string
  dueDate?: string | null
  status?: 'pending' | 'completed'
}

export type ProjectFileItem = {
  id: string
  projectId: string
  kind: 'file' | 'link'
  title: string
  url: string
  publicId?: string | null
  fileName?: string
  mimeType?: string
  sizeBytes?: number
  createdById: string
  sortOrder: number
  createdAt: string
}

export type CreateProjectFilePayload =
  | {
      kind: 'file'
      title?: string
      url: string
      publicId?: string | null
      fileName: string
      mimeType: string
      sizeBytes: number
    }
  | {
      kind: 'link'
      title: string
      url: string
    }

function parseContractValue(value: string | number | undefined): number | undefined {
  if (value === undefined || value === '') return undefined
  const num = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(num) ? num : undefined
}

function toProjectApiPayload(values: ProjectFormValues, isUpdate = false) {
  const contractValue = parseContractValue(values.contractValue)
  const source = values.source || undefined
  const sourceNote = values.sourceNote?.trim() || undefined

  const base = {
    name: values.name,
    description: values.description,
    managerId: values.managerId,
    teamMemberIds: values.teamMemberIds,
    startDate: values.startDate,
    endDate: values.endDate,
    priority: values.priority,
    status: values.status,
    ...(source ? { source } : isUpdate ? { source: null } : {}),
    ...(sourceNote ? { sourceNote } : isUpdate ? { sourceNote: null } : {}),
    ...(contractValue != null
      ? { contractValue }
      : isUpdate
        ? { contractValue: null }
        : {}),
  }

  if (isUpdate) {
    return {
      ...base,
      clientId:
        values.clientMode === 'company' || !values.clientId?.trim()
          ? null
          : values.clientId,
    }
  }

  if (values.clientMode === 'new') {
    return {
      ...base,
      clientMode: 'new' as const,
      newClient: {
        name: values.newClientName!.trim(),
        ...(values.newClientEmail?.trim()
          ? { email: values.newClientEmail.trim() }
          : {}),
        ...(values.newClientPhone?.trim()
          ? { phone: values.newClientPhone.trim() }
          : {}),
      },
    }
  }

  if (values.clientMode === 'company') {
    return {
      ...base,
      clientMode: 'company' as const,
    }
  }

  return {
    ...base,
    clientMode: 'existing' as const,
    ...(values.clientId?.trim() ? { clientId: values.clientId } : {}),
  }
}

export const projectsApi = {
  async list(params?: ListProjectsParams): Promise<Project[]> {
    const { data } = await apiClient.get<ListProjectsResult>('/projects', {
      params: { limit: 100, ...params },
    })
    return data.projects
  },

  async listPaginated(params?: ListProjectsParams): Promise<ListProjectsResult> {
    const { data } = await apiClient.get<ListProjectsResult>('/projects', { params })
    return data
  },

  async getStats(): Promise<ProjectStats> {
    const { data } = await apiClient.get<{ stats: ProjectStats }>('/projects/stats')
    return data.stats
  },

  async getMilestoneStats(limit = 5): Promise<MilestoneStats> {
    const { data } = await apiClient.get<{ stats: MilestoneStats }>('/projects/milestones/stats', {
      params: { limit },
    })
    return data.stats
  },

  async getOverview(months = 6): Promise<ProjectOverviewPoint[]> {
    const { data } = await apiClient.get<{ overview: ProjectOverviewPoint[] }>(
      '/projects/stats/overview',
      { params: { months } },
    )
    return data.overview
  },

  async getById(id: string): Promise<Project | null> {
    try {
      const { data } = await apiClient.get<{ project: Project }>(`/projects/${id}`)
      return data.project
    } catch {
      return null
    }
  },

  async create(values: ProjectFormValues): Promise<Project> {
    const payload = toProjectApiPayload(values)
    const { data } = await apiClient.post<{ project: Project }>('/projects', payload)
    return data.project
  },

  async update(id: string, values: ProjectFormValues): Promise<Project> {
    const payload = toProjectApiPayload(values, true)
    const { data } = await apiClient.patch<{ project: Project }>(`/projects/${id}`, payload)
    return data.project
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`)
  },

  async listManagerOptions(): Promise<AuthUser[]> {
    const { data } = await apiClient.get<{ managers: AuthUser[] }>('/projects/manager-options')
    return data.managers
  },

  async listMemberOptions(): Promise<AuthUser[]> {
    const { data } = await apiClient.get<{ members: AuthUser[] }>('/projects/member-options')
    return data.members
  },

  async listForMember(userId: string): Promise<Project[]> {
    const { data } = await apiClient.get<{ projects: Project[] }>(
      `/projects/by-member/${userId}`,
    )
    return data.projects
  },

  async listMilestones(
    projectId: string,
  ): Promise<{ milestones: ProjectMilestone[]; progress: number }> {
    const { data } = await apiClient.get<{ milestones: ProjectMilestone[]; progress: number }>(
      `/projects/${projectId}/milestones`,
    )
    return data
  },

  async createMilestone(
    projectId: string,
    payload: CreateMilestonePayload,
  ): Promise<{ milestone: ProjectMilestone; progress: number }> {
    const { data } = await apiClient.post<{ milestone: ProjectMilestone; progress: number }>(
      `/projects/${projectId}/milestones`,
      payload,
    )
    return data
  },

  async updateMilestone(
    projectId: string,
    milestoneId: string,
    payload: UpdateMilestonePayload,
  ): Promise<{ milestone: ProjectMilestone; progress: number }> {
    const { data } = await apiClient.patch<{ milestone: ProjectMilestone; progress: number }>(
      `/projects/${projectId}/milestones/${milestoneId}`,
      payload,
    )
    return data
  },

  async deleteMilestone(
    projectId: string,
    milestoneId: string,
  ): Promise<{ progress: number }> {
    const { data } = await apiClient.delete<{ progress: number }>(
      `/projects/${projectId}/milestones/${milestoneId}`,
    )
    return data
  },

  async listFiles(projectId: string): Promise<{ files: ProjectFileItem[] }> {
    const { data } = await apiClient.get<{ files: ProjectFileItem[] }>(
      `/projects/${projectId}/files`,
    )
    return data
  },

  async createFile(
    projectId: string,
    payload: CreateProjectFilePayload,
  ): Promise<{ file: ProjectFileItem }> {
    const { data } = await apiClient.post<{ file: ProjectFileItem }>(
      `/projects/${projectId}/files`,
      payload,
    )
    return data
  },

  async deleteFile(projectId: string, fileId: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}/files/${fileId}`)
  },
}
