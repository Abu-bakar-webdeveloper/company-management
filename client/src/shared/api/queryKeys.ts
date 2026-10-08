import type { ListCompaniesParams } from '@/features/platform/api/companiesApi'
import type { ListEmployeesParams, ListUsersParams } from '@/shared/api/usersApi'

export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },
  companies: {
    all: ['companies'] as const,
    list: (params: ListCompaniesParams) => [...queryKeys.companies.all, 'list', params] as const,
    stats: () => [...queryKeys.companies.all, 'stats'] as const,
    growth: (months?: number) => [...queryKeys.companies.all, 'growth', months ?? 6] as const,
    detail: (id: string) => [...queryKeys.companies.all, 'detail', id] as const,
    me: () => [...queryKeys.companies.all, 'me'] as const,
  },
  employees: {
    all: ['employees'] as const,
    list: (params: ListEmployeesParams) => [...queryKeys.employees.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.employees.all, 'detail', id] as const,
  },
  users: {
    all: ['users'] as const,
    list: (params: ListUsersParams) => [...queryKeys.users.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
    managerOptions: () => [...queryKeys.users.all, 'manager-options'] as const,
  },
  team: {
    all: ['team'] as const,
    members: () => [...queryKeys.team.all, 'members'] as const,
    member: (id: string) => [...queryKeys.team.all, 'member', id] as const,
    workload: () => [...queryKeys.team.all, 'workload'] as const,
  },
  projects: {
    all: ['projects'] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.projects.all, 'list', params ?? {}] as const,
    stats: () => [...queryKeys.projects.all, 'stats'] as const,
    overview: (months?: number) => [...queryKeys.projects.all, 'overview', months ?? 6] as const,
    detail: (id: string) => [...queryKeys.projects.all, 'detail', id] as const,
    managerOptions: () => [...queryKeys.projects.all, 'manager-options'] as const,
    memberOptions: () => [...queryKeys.projects.all, 'member-options'] as const,
    byMember: (userId: string) => [...queryKeys.projects.all, 'by-member', userId] as const,
    milestones: (projectId: string) =>
      [...queryKeys.projects.all, 'milestones', projectId] as const,
    milestoneStats: () => [...queryKeys.projects.all, 'milestone-stats'] as const,
    files: (projectId: string) => [...queryKeys.projects.all, 'files', projectId] as const,
  },
  clients: {
    all: ['clients'] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.clients.all, 'list', params ?? {}] as const,
    detail: (id: string) => [...queryKeys.clients.all, 'detail', id] as const,
    options: () => [...queryKeys.clients.all, 'options'] as const,
    stats: () => [...queryKeys.clients.all, 'stats'] as const,
  },
  tasks: {
    all: ['tasks'] as const,
    board: (projectId: string) => [...queryKeys.tasks.all, 'board', projectId] as const,
    mine: (params?: Record<string, unknown>) =>
      [...queryKeys.tasks.all, 'mine', params ?? {}] as const,
    stats: (scope: string, projectId?: string) =>
      [...queryKeys.tasks.all, 'stats', scope, projectId ?? null] as const,
    progress: (scope: string, projectId?: string) =>
      [...queryKeys.tasks.all, 'progress', scope, projectId ?? null] as const,
    detail: (id: string) => [...queryKeys.tasks.all, 'detail', id] as const,
  },
  leaves: {
    all: ['leaves'] as const,
    types: () => [...queryKeys.leaves.all, 'types'] as const,
    type: (id: string) => [...queryKeys.leaves.all, 'type', id] as const,
    requests: (params?: Record<string, unknown>) =>
      [...queryKeys.leaves.all, 'requests', params ?? {}] as const,
    requestsPaginated: (params?: Record<string, unknown>) =>
      [...queryKeys.leaves.all, 'requests-paginated', params ?? {}] as const,
    stats: (scope?: string) => [...queryKeys.leaves.all, 'stats', scope ?? 'default'] as const,
    detail: (id: string) => [...queryKeys.leaves.all, 'detail', id] as const,
    employeeSummary: (userId: string) =>
      [...queryKeys.leaves.all, 'employee-summary', userId] as const,
  },
  reports: {
    all: ['reports'] as const,
    overview: () => [...queryKeys.reports.all, 'overview'] as const,
    charts: () => [...queryKeys.reports.all, 'charts'] as const,
    options: () => [...queryKeys.reports.all, 'options'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.reports.all, 'list', filters ?? {}] as const,
    detail: (id: string) => [...queryKeys.reports.all, 'detail', id] as const,
  },
  expenses: {
    all: ['expenses'] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.expenses.all, 'list', params ?? {}] as const,
    stats: () => [...queryKeys.expenses.all, 'stats'] as const,
    detail: (id: string) => [...queryKeys.expenses.all, 'detail', id] as const,
  },
  roles: {
    all: ['roles'] as const,
    list: () => [...queryKeys.roles.all, 'list'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.notifications.all, 'list', params ?? {}] as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unread-count'] as const,
    preferences: () => [...queryKeys.notifications.all, 'preferences'] as const,
  },
  activities: {
    all: ['activities'] as const,
    list: (params?: { scope?: string; page?: number; limit?: number }) =>
      [...queryKeys.activities.all, 'list', params ?? {}] as const,
  },
  attendance: {
    all: ['attendance'] as const,
    today: () => [...queryKeys.attendance.all, 'today'] as const,
    mine: (params?: Record<string, unknown>) =>
      [...queryKeys.attendance.all, 'mine', params ?? {}] as const,
    employee: (id: string, params?: Record<string, unknown>) =>
      [...queryKeys.attendance.all, 'employee', id, params ?? {}] as const,
    dashboard: (params?: Record<string, unknown>) =>
      [...queryKeys.attendance.all, 'dashboard', params ?? {}] as const,
    settings: () => [...queryKeys.attendance.all, 'settings'] as const,
  },
} as const
