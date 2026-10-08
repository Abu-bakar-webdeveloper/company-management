import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/model/AuthContext'
import { userHasPermission } from '@/features/auth/model/permissions'
import { projectsApi, type ListProjectsParams } from '@/features/projects/api/projectsApi'
import type { ProjectFormValues } from '@/features/projects/model/schemas'
import { queryKeys } from '@/shared/api/queryKeys'

export function useProjectsList(params?: ListProjectsParams) {
  return useQuery({
    queryKey: queryKeys.projects.list(params),
    queryFn: () => projectsApi.list(params),
  })
}

export function useProjectStats() {
  const { user } = useAuth()
  const canRead = Boolean(user && userHasPermission(user, 'projects:read'))

  return useQuery({
    queryKey: queryKeys.projects.stats(),
    queryFn: () => projectsApi.getStats(),
    enabled: canRead,
  })
}

export function useProjectOverview(months = 6) {
  return useQuery({
    queryKey: queryKeys.projects.overview(months),
    queryFn: () => projectsApi.getOverview(months),
  })
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id ?? ''),
    queryFn: () => projectsApi.getById(id!),
    enabled: Boolean(id),
  })
}

export function useProjectManagerOptions(enabled = true) {
  return useQuery({
    queryKey: queryKeys.projects.managerOptions(),
    queryFn: () => projectsApi.listManagerOptions(),
    enabled,
  })
}

export function useProjectMemberOptions(enabled = true) {
  return useQuery({
    queryKey: queryKeys.projects.memberOptions(),
    queryFn: () => projectsApi.listMemberOptions(),
    enabled,
  })
}

export function useMemberProjects(userId: string | undefined) {
  const { user } = useAuth()
  const canRead = Boolean(user && userHasPermission(user, 'projects:read'))

  return useQuery({
    queryKey: queryKeys.projects.byMember(userId ?? ''),
    queryFn: () => projectsApi.listForMember(userId!),
    enabled: Boolean(userId) && canRead,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: ProjectFormValues) => projectsApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all })
    },
  })
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: ProjectFormValues) => projectsApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (projectId: string) => projectsApi.remove(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
    },
  })
}

export function useProjectMilestones(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.milestones(projectId ?? ''),
    queryFn: () => projectsApi.listMilestones(projectId!),
    enabled: Boolean(projectId),
  })
}

export function useCreateMilestone(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { title: string; dueDate?: string }) =>
      projectsApi.createMilestone(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.milestones(projectId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.stats() })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
    },
  })
}

export function useUpdateMilestone(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      milestoneId,
      payload,
    }: {
      milestoneId: string
      payload: { title?: string; dueDate?: string | null; status?: 'pending' | 'completed' }
    }) => projectsApi.updateMilestone(projectId, milestoneId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.milestones(projectId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.stats() })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
    },
  })
}

export function useDeleteMilestone(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (milestoneId: string) => projectsApi.deleteMilestone(projectId, milestoneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.milestones(projectId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.stats() })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
    },
  })
}

export function useProjectFiles(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.files(projectId ?? ''),
    queryFn: () => projectsApi.listFiles(projectId!),
    enabled: Boolean(projectId),
  })
}

export function useCreateProjectFile(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Parameters<typeof projectsApi.createFile>[1]) =>
      projectsApi.createFile(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.files(projectId) })
    },
  })
}

export function useDeleteProjectFile(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (fileId: string) => projectsApi.deleteFile(projectId, fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.files(projectId) })
    },
  })
}
