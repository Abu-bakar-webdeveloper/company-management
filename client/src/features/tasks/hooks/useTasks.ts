import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/model/AuthContext'
import { userHasPermission } from '@/features/auth/model/permissions'
import {
  tasksApi,
  type CreateTaskPayload,
  type ListMyTasksParams,
  type UpdateTaskPayload,
} from '@/features/tasks/api/tasksApi'
import { queryKeys } from '@/shared/api/queryKeys'

export function useProjectBoard(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.tasks.board(projectId ?? ''),
    queryFn: () => tasksApi.getBoard(projectId!),
    enabled: Boolean(projectId),
  })
}

export function useMyTasks(params?: ListMyTasksParams) {
  return useQuery({
    queryKey: queryKeys.tasks.mine(params),
    queryFn: () => tasksApi.listMine(params),
  })
}

export function useTaskStats(
  scope: 'mine' | 'project' | 'company' = 'mine',
  projectId?: string,
) {
  const { user } = useAuth()
  const canRead = Boolean(user && userHasPermission(user, 'tasks:read'))

  return useQuery({
    queryKey: queryKeys.tasks.stats(scope, projectId),
    queryFn: () => tasksApi.getStats(scope, projectId),
    enabled: canRead,
  })
}

export function useTaskProgress(
  scope: 'mine' | 'project' | 'company' = 'mine',
  projectId?: string,
) {
  const { user } = useAuth()
  const canRead = Boolean(user && userHasPermission(user, 'tasks:read'))

  return useQuery({
    queryKey: queryKeys.tasks.progress(scope, projectId),
    queryFn: () => tasksApi.getProgress(scope, projectId),
    enabled: canRead,
  })
}

function invalidateBoard(queryClient: ReturnType<typeof useQueryClient>, projectId: string) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.tasks.board(projectId) })
  void queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
}

export function useCreateBoardColumn(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => tasksApi.createColumn(projectId, name),
    onSuccess: () => invalidateBoard(queryClient, projectId),
  })
}

export function useUpdateBoardColumn(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (args: { columnId: string; name?: string; wipLimit?: number | null }) =>
      tasksApi.updateColumn(projectId, args.columnId, {
        name: args.name,
        wipLimit: args.wipLimit,
      }),
    onSuccess: () => invalidateBoard(queryClient, projectId),
  })
}

export function useDeleteBoardColumn(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (args: { columnId: string; moveToColumnId?: string }) =>
      tasksApi.deleteColumn(projectId, args.columnId, args.moveToColumnId),
    onSuccess: () => invalidateBoard(queryClient, projectId),
  })
}

export function useCreateBoardTask(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => tasksApi.createTask(projectId, payload),
    onSuccess: () => invalidateBoard(queryClient, projectId),
  })
}

export function useQuickCreateBoardTask(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { title: string; columnId: string }) =>
      tasksApi.quickCreateTask(projectId, payload),
    onSuccess: () => invalidateBoard(queryClient, projectId),
  })
}

export function useUpdateBoardTask(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (args: { taskId: string; payload: UpdateTaskPayload }) =>
      tasksApi.updateTask(args.taskId, args.payload),
    onSuccess: () => invalidateBoard(queryClient, projectId),
  })
}

export function useDeleteBoardTask(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (taskId: string) => tasksApi.deleteTask(taskId),
    onSuccess: () => invalidateBoard(queryClient, projectId),
  })
}

export function useMoveBoardTask(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (args: { taskId: string; columnId: string; sortOrder?: number }) =>
      tasksApi.moveTask(args.taskId, {
        columnId: args.columnId,
        sortOrder: args.sortOrder,
      }),
    onSuccess: () => invalidateBoard(queryClient, projectId),
  })
}

export function useReorderBoardColumns(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderedIds: string[]) => tasksApi.reorderColumns(projectId, orderedIds),
    onSuccess: () => invalidateBoard(queryClient, projectId),
  })
}

export function useAddTaskAttachment(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (args: {
      taskId: string
      payload: {
        url: string
        publicId?: string | null
        fileName: string
        mimeType: string
        sizeBytes: number
      }
    }) => tasksApi.addAttachment(args.taskId, args.payload),
    onSuccess: () => invalidateBoard(queryClient, projectId),
  })
}

export function useDeleteTaskAttachment(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (args: { taskId: string; attachmentId: string }) =>
      tasksApi.deleteAttachment(args.taskId, args.attachmentId),
    onSuccess: () => invalidateBoard(queryClient, projectId),
  })
}
