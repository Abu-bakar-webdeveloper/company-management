import type { Task, TaskListFilters } from '@/features/tasks/model/types'

export function filterTasks(tasks: Task[], filters: TaskListFilters): Task[] {
  return tasks.filter((task) => {
    const search = filters.search.trim().toLowerCase()
    if (search) {
      const haystack = `${task.name} ${task.project} ${task.assignedBy}`.toLowerCase()
      if (!haystack.includes(search)) return false
    }

    if (filters.progress !== 'all' && task.status !== filters.progress) {
      return false
    }

    if (filters.status !== 'all' && task.status !== filters.status) {
      return false
    }

    return true
  })
}
