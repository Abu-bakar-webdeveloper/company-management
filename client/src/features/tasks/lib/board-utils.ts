import type { AuthUser } from '@/features/auth/model/types'
import type {
  BoardFilters,
  BoardRole,
  BoardTask,
  BoardTaskPriority,
} from '@/features/tasks/model/types'
import { userHasPermission } from '@/features/auth/model/permissions'
import { formatCompanyShortDate } from '@/shared/lib/format'

export function resolveBoardRole(
  user: AuthUser | null,
  canManageBoard: boolean,
): BoardRole {
  if (!user) return 'viewer'
  if (canManageBoard) return 'pm'
  if (userHasPermission(user, 'tasks:write')) return 'employee'
  return 'viewer'
}

export function canEditBoardTask(
  role: BoardRole,
  task: BoardTask,
  currentUserId: string | null,
): boolean {
  if (role === 'viewer') return false
  if (role === 'pm') return true
  return Boolean(currentUserId && task.assigneeId === currentUserId)
}

export function filterBoardTasks(tasks: BoardTask[], filters: BoardFilters): BoardTask[] {
  const search = filters.search.trim().toLowerCase()
  return tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search)) return false
    if (filters.assignee && t.assigneeId !== filters.assignee) return false
    if (filters.priority && t.priority !== filters.priority) return false
    if (filters.milestone && t.milestoneId !== filters.milestone) return false
    return true
  })
}

export const BOARD_PRIORITY_OPTIONS: {
  value: BoardTaskPriority
  label: string
}[] = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

export function formatBoardDueDate(date: string): { label: string; overdue: boolean } {
  const d = new Date(`${date}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const overdue = d < today
  const label = formatCompanyShortDate(date)
  return { label, overdue }
}

export function membersById<T extends { id: string }>(members: T[]): Record<string, T> {
  return Object.fromEntries(members.map((m) => [m.id, m]))
}
