import type {
  BoardAttachment,
  BoardColumn,
  BoardFilters,
  BoardMember,
  BoardMilestone,
  BoardSubtask,
  BoardTask,
  BoardTaskPriority,
  Task,
  TaskStatus,
} from '@/features/tasks/model/types'
import { apiClient } from '@/shared/api/axios'

export type BoardDto = {
  projectId: string
  projectName: string
  columns: BoardColumnDto[]
  tasks: BoardTaskDto[]
  members: BoardMember[]
  milestones: BoardMilestone[]
  canManageBoard: boolean
}

export type BoardColumnDto = {
  id: string
  projectId: string
  name: string
  order: number
  wipLimit: number | null
  columnKind: 'todo' | 'in_progress' | 'done' | 'custom'
}

export type BoardAttachmentDto = BoardAttachment

export type BoardTaskDto = {
  id: string
  projectId: string
  title: string
  description: string
  assigneeId: string | null
  priority: BoardTaskPriority
  status: 'todo' | 'in_progress' | 'done' | 'hold'
  dueDate: string
  milestoneId: string | null
  subtasks: BoardSubtask[]
  comments: number
  attachments: number
  attachmentItems: BoardAttachmentDto[]
  columnId: string
  image: string | null
  sortOrder: number
}

export type TaskHubItem = {
  id: string
  title: string
  projectId: string
  projectName: string
  dueDate: string
}

export type TaskStatsDto = {
  total: number
  inProgress: number
  completed: number
  overdue: number
  overdueItems?: TaskHubItem[]
}

export type TaskProgressPoint = {
  month: string
  completed: number
}

export type TaskStatsScope = 'mine' | 'project' | 'company'

export type ListMyTasksParams = {
  page?: number
  limit?: number
  search?: string
  status?: string
  progress?: string
}

export type CreateTaskPayload = {
  title: string
  description?: string
  columnId: string
  assigneeId?: string | null
  milestoneId?: string | null
  priority?: BoardTaskPriority
  dueDate?: string | null
  subtasks?: Array<{ text: string; done?: boolean }>
}

export type UpdateTaskPayload = {
  title?: string
  description?: string
  assigneeId?: string | null
  milestoneId?: string | null
  priority?: BoardTaskPriority
  dueDate?: string | null
  status?: 'todo' | 'in_progress' | 'done' | 'hold'
  subtasks?: Array<{ id?: string; text: string; done: boolean }>
  image?: string | null
}

export type CreateAttachmentPayload = {
  url: string
  publicId?: string | null
  fileName: string
  mimeType: string
  sizeBytes: number
}

export function toBoardColumn(dto: BoardColumnDto): BoardColumn {
  return {
    id: dto.id,
    name: dto.name,
    order: dto.order,
    wipLimit: dto.wipLimit,
  }
}

export function toBoardTask(dto: BoardTaskDto): BoardTask {
  return {
    id: dto.id,
    projectId: dto.projectId,
    title: dto.title,
    description: dto.description,
    assigneeId: dto.assigneeId,
    priority: dto.priority,
    dueDate: dto.dueDate,
    milestoneId: dto.milestoneId,
    subtasks: dto.subtasks,
    comments: dto.comments,
    attachments: dto.attachments,
    attachmentItems: dto.attachmentItems ?? [],
    columnId: dto.columnId,
    image: dto.image,
    sortOrder: dto.sortOrder,
  }
}

export const tasksApi = {
  async getBoard(projectId: string): Promise<BoardDto> {
    const { data } = await apiClient.get<{ board: BoardDto }>(`/projects/${projectId}/board`)
    return data.board
  },

  async createColumn(projectId: string, name: string): Promise<BoardColumnDto> {
    const { data } = await apiClient.post<{ column: BoardColumnDto }>(
      `/projects/${projectId}/board/columns`,
      { name },
    )
    return data.column
  },

  async updateColumn(
    projectId: string,
    columnId: string,
    payload: { name?: string; wipLimit?: number | null },
  ): Promise<BoardColumnDto> {
    const { data } = await apiClient.patch<{ column: BoardColumnDto }>(
      `/projects/${projectId}/board/columns/${columnId}`,
      payload,
    )
    return data.column
  },

  async deleteColumn(
    projectId: string,
    columnId: string,
    moveToColumnId?: string,
  ): Promise<void> {
    await apiClient.delete(`/projects/${projectId}/board/columns/${columnId}`, {
      data: moveToColumnId ? { moveToColumnId } : {},
    })
  },

  async reorderColumns(projectId: string, orderedIds: string[]): Promise<BoardColumnDto[]> {
    const { data } = await apiClient.post<{ columns: BoardColumnDto[] }>(
      `/projects/${projectId}/board/columns/reorder`,
      { orderedIds },
    )
    return data.columns
  },

  async createTask(projectId: string, payload: CreateTaskPayload): Promise<BoardTaskDto> {
    const { data } = await apiClient.post<{ task: BoardTaskDto }>(
      `/projects/${projectId}/tasks`,
      payload,
    )
    return data.task
  },

  async quickCreateTask(
    projectId: string,
    payload: { title: string; columnId: string },
  ): Promise<BoardTaskDto> {
    const { data } = await apiClient.post<{ task: BoardTaskDto }>(
      `/projects/${projectId}/tasks/quick`,
      payload,
    )
    return data.task
  },

  async updateTask(taskId: string, payload: UpdateTaskPayload): Promise<BoardTaskDto> {
    const { data } = await apiClient.patch<{ task: BoardTaskDto }>(`/tasks/${taskId}`, payload)
    return data.task
  },

  async deleteTask(taskId: string): Promise<void> {
    await apiClient.delete(`/tasks/${taskId}`)
  },

  async moveTask(
    taskId: string,
    payload: { columnId: string; sortOrder?: number },
  ): Promise<BoardTaskDto> {
    const { data } = await apiClient.patch<{ task: BoardTaskDto }>(
      `/tasks/${taskId}/move`,
      payload,
    )
    return data.task
  },

  async addAttachment(taskId: string, payload: CreateAttachmentPayload): Promise<BoardTaskDto> {
    const { data } = await apiClient.post<{ task: BoardTaskDto }>(
      `/tasks/${taskId}/attachments`,
      payload,
    )
    return data.task
  },

  async deleteAttachment(taskId: string, attachmentId: string): Promise<BoardTaskDto> {
    const { data } = await apiClient.delete<{ task: BoardTaskDto }>(
      `/tasks/${taskId}/attachments/${attachmentId}`,
    )
    return data.task
  },

  async listMine(params?: ListMyTasksParams): Promise<{
    tasks: Task[]
    pagination: { page: number; limit: number; total: number; totalPages: number }
  }> {
    const { data } = await apiClient.get<{
      tasks: Task[]
      pagination: { page: number; limit: number; total: number; totalPages: number }
    }>('/tasks/mine', { params })
    return data
  },

  async getStats(
    scope: TaskStatsScope = 'mine',
    projectId?: string,
    limit?: number,
  ): Promise<TaskStatsDto> {
    const { data } = await apiClient.get<{ stats: TaskStatsDto }>('/tasks/stats', {
      params: { scope, projectId, limit },
    })
    return data.stats
  },

  async getProgress(
    scope: TaskStatsScope = 'mine',
    projectId?: string,
  ): Promise<TaskProgressPoint[]> {
    const { data } = await apiClient.get<{ progress: TaskProgressPoint[] }>('/tasks/stats/progress', {
      params: { scope, projectId },
    })
    return data.progress
  },
}

export type { BoardFilters, TaskStatus }
