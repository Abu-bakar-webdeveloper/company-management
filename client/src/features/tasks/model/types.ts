export type TaskPriority = 'high' | 'active' | 'medium' | 'low'

export type TaskStatus = 'in_progress' | 'completed' | 'hold' | 'overdue'

export type Task = {
  id: string
  name: string
  project: string
  projectId?: string
  assignedBy: string
  dueDate: string
  priority: TaskPriority
  status: TaskStatus
  actionVariant: 'view' | 'menu'
}

export type TaskListFilters = {
  search: string
  progress: 'all' | 'in_progress' | 'completed' | 'overdue'
  status: 'all' | TaskStatus
}

export type SubtaskStatus = 'pending' | 'in_progress' | 'completed'

export type TaskSubtask = {
  id: string
  title: string
  dueDate: string | null
  status: SubtaskStatus
}

export type TaskActivity = {
  id: string
  actor: string
  action: string
  target?: string
  timestamp: string
}

export type TaskDetail = {
  id: string
  code: string
  name: string
  description: string
  priority: TaskPriority
  status: TaskStatus
  image?: string
  leadName: string
  leadRole: string
  leadAvatar?: string
  progress: number
  startDate: string
  deadline: string
  subtasks: TaskSubtask[]
  activities: TaskActivity[]
}

/** Kanban board types */

export type BoardTaskPriority = 'urgent' | 'high' | 'medium' | 'low'

export type BoardRole = 'pm' | 'employee' | 'viewer'

export type BoardMember = {
  id: string
  name: string
  initials: string
  colorClass: string
}

export type BoardMilestone = {
  id: string
  name: string
  colorClass: string
}

export type BoardSubtask = {
  id: string
  text: string
  done: boolean
}

export type BoardColumn = {
  id: string
  name: string
  order: number
  wipLimit?: number | null
}

export type BoardAttachment = {
  id: string
  url: string
  publicId: string | null
  fileName: string
  mimeType: string
  sizeBytes: number
  sortOrder: number
  createdAt: string
}

export type BoardTask = {
  id: string
  projectId: string
  title: string
  description: string
  assigneeId: string | null
  priority: BoardTaskPriority
  dueDate: string
  milestoneId: string | null
  subtasks: BoardSubtask[]
  comments: number
  attachments: number
  attachmentItems: BoardAttachment[]
  columnId: string
  image?: string | null
  sortOrder: number
}

export type BoardFilters = {
  search: string
  assignee: string
  priority: string
  milestone: string
}
