import { statusLabels } from '@/features/projects/model/projectsData'
import type { Project, ProjectStatus } from '@/features/projects/model/types'
import {
  formatCompanyDateRange,
  formatCompanyLongDate,
  formatCompanyShortDate,
} from '@/shared/lib/format'

export function formatProjectDate(iso: string): string {
  return formatCompanyShortDate(iso)
}

export function formatProjectLongDate(iso: string): string {
  return formatCompanyLongDate(iso)
}

export function formatTimelineRange(start: string, end: string): string {
  return formatCompanyDateRange(start, end).replace('–', '-')
}

export function filterProjects(
  items: Project[],
  search: string,
  status: ProjectStatus | 'all',
): Project[] {
  const q = search.trim().toLowerCase()
  return items.filter((item) => {
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.managerName.toLowerCase().includes(q) ||
      item.projectCode.toLowerCase().includes(q)

    const matchesStatus = status === 'all' || item.status === status
    return matchesSearch && matchesStatus
  })
}

export function computeProjectStats(projects: Project[]) {
  return {
    total: projects.length,
    completed: projects.filter((p) => p.status === 'completed').length,
    inProgress: projects.filter((p) => p.status === 'in_progress').length,
    delayed: projects.filter((p) => p.status === 'delayed').length,
  }
}

export function statusLabel(status: ProjectStatus): string {
  return statusLabels[status]
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}
