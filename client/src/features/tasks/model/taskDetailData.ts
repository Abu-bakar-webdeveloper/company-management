import { mockTasks } from '@/features/tasks/model/tasksData'
import type { TaskActivity, TaskDetail, TaskSubtask } from '@/features/tasks/model/types'

const taskImage =
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=640&q=80'

function avatarUrl(id: string): string {
  const img = Number.parseInt(id, 10) % 70 || 1
  return `https://i.pravatar.cc/80?img=${img}`
}

const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

const defaultSubtasks: TaskSubtask[] = [
  { id: '1', title: 'Design Homepage', dueDate: '2026-04-10', status: 'pending' },
  { id: '2', title: 'API Integration', dueDate: null, status: 'completed' },
  { id: '3', title: 'Testing Module', dueDate: '2026-04-15', status: 'in_progress' },
]

const defaultActivities: TaskActivity[] = [
  {
    id: '1',
    actor: 'Manager',
    action: 'updated the project status to',
    target: 'In Progress',
    timestamp: hoursAgo(2),
  },
  {
    id: '2',
    actor: 'Manager',
    action: 'added',
    target: 'Naeem Ashraf as Team Lead',
    timestamp: hoursAgo(5),
  },
]

export function getTaskDetail(id: string): TaskDetail | null {
  const task = mockTasks.find((item) => item.id === id)
  if (!task) return null

  return {
    id: task.id,
    code: `TASK-2026-${task.id.padStart(3, '0')}`,
    name: task.name,
    description: `Work on ${task.name.toLowerCase()} for the ${task.project} project.`,
    priority: task.priority,
    status: task.status,
    image: taskImage,
    leadName: task.assignedBy,
    leadRole: 'Project Lead',
    leadAvatar: avatarUrl(task.id),
    progress: task.status === 'completed' ? 100 : task.status === 'in_progress' ? 45 : 0,
    startDate: '2026-03-04',
    deadline: '2026-04-11',
    subtasks: defaultSubtasks,
    activities: defaultActivities,
  }
}
