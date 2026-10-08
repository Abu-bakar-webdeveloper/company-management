import type { Permission } from '@/features/auth/model/permissions'
import { COMPANY_HUB_LABELS } from '@/features/auth/model/companyHubs'
import { userHasAnyPermission, userHasPermission } from '@/features/auth/model/permissions'
import type { AuthUser, UserRole } from '@/features/auth/model/types'

export type NavIconName =
  | 'dashboard'
  | 'companies'
  | 'admins'
  | 'subscriptions'
  | 'team'
  | 'employees'
  | 'tasks'
  | 'projects'
  | 'clients'
  | 'leave'
  | 'attendance'
  | 'salaries'
  | 'expenses'
  | 'performance'
  | 'reports'
  | 'settings'
  | 'people'
  | 'finance'
  | 'work'

export type NavItem = {
  id: string
  label: string
  path: string
  icon: NavIconName
  permission?: Permission
  anyOf?: Permission[]
  roles?: UserRole[]
}

export type NavGroup = {
  id: string
  label: string
  path: string
  icon: NavIconName
  children: NavItem[]
  anyOf?: Permission[]
}

export type NavEntry = NavItem | NavGroup

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return 'children' in entry
}

export const PEOPLE_HUB_PERMISSIONS: Permission[] = [
  'employees:read',
  'team:read',
  'leave:manage',
  'leave:approve',
  'leave:request',
  'attendance:manage',
  'attendance:team',
  'attendance:self',
  'performance:read',
]

export const FINANCE_HUB_PERMISSIONS: Permission[] = [
  'salaries:read',
  'salaries:self',
  'expenses:read',
]

export const WORK_HUB_PERMISSIONS: Permission[] = [
  'projects:read',
  'tasks:read',
  'clients:read',
]

const superAdminNav: NavEntry[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'dashboard',
    roles: ['superadmin'],
  },
  {
    id: 'companies',
    label: 'Companies',
    path: '/companies',
    icon: 'companies',
    roles: ['superadmin'],
  },
  {
    id: 'subscriptions',
    label: 'Subscriptions',
    path: '/subscriptions',
    icon: 'subscriptions',
    roles: ['superadmin'],
  },
  {
    id: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: 'reports',
    permission: 'reports:read',
    roles: ['superadmin'],
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: 'settings',
    permission: 'settings:read',
    roles: ['superadmin'],
  },
]

const peopleChildren: NavItem[] = [
  {
    id: 'employees',
    label: 'Employees',
    path: '/employees',
    icon: 'employees',
    permission: 'employees:read',
  },
  {
    id: 'team',
    label: 'Team',
    path: '/team',
    icon: 'team',
    permission: 'team:read',
  },
  {
    id: 'leave',
    label: 'Leave Management',
    path: '/leave',
    icon: 'leave',
    permission: 'leave:manage',
  },
  {
    id: 'leave-requests',
    label: 'Leave Requests',
    path: '/leave',
    icon: 'leave',
    permission: 'leave:approve',
  },
  {
    id: 'leave-my',
    label: 'My Leaves',
    path: '/leave',
    icon: 'leave',
    permission: 'leave:request',
  },
  {
    id: 'attendance',
    label: 'Attendance',
    path: '/attendance',
    icon: 'attendance',
    anyOf: ['attendance:manage', 'attendance:team'],
  },
  {
    id: 'attendance-my',
    label: 'My Attendance',
    path: '/my-attendance',
    icon: 'attendance',
    permission: 'attendance:self',
  },
  {
    id: 'performance',
    label: 'Performance',
    path: '/performance',
    icon: 'performance',
    permission: 'performance:read',
  },
  {
    id: 'performance-team',
    label: 'Team Performance',
    path: '/performance/team',
    icon: 'performance',
    permission: 'performance:read',
    roles: ['manager'],
  },
]

const financeChildren: NavItem[] = [
  {
    id: 'salaries',
    label: 'Salaries',
    path: '/salaries',
    icon: 'salaries',
    permission: 'salaries:read',
  },
  {
    id: 'salaries-my',
    label: 'My Salary',
    path: '/my-salary',
    icon: 'salaries',
    anyOf: ['salaries:self', 'salaries:read'],
  },
  {
    id: 'expenses',
    label: 'Expenses',
    path: '/expenses',
    icon: 'expenses',
    permission: 'expenses:read',
  },
]

const workChildren: NavItem[] = [
  {
    id: 'clients',
    label: 'Clients',
    path: '/clients',
    icon: 'clients',
    permission: 'clients:read',
  },
  {
    id: 'projects',
    label: 'Projects',
    path: '/projects',
    icon: 'projects',
    permission: 'projects:read',
  },
  {
    id: 'tasks',
    label: 'My Tasks',
    path: '/tasks',
    icon: 'tasks',
    permission: 'tasks:read',
  },
]

const orgNav: NavEntry[] = [
  {
    id: 'dashboard-org',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'dashboard',
    permission: 'dashboard:view',
  },
  {
    id: 'people',
    label: COMPANY_HUB_LABELS.people,
    path: '/people',
    icon: 'people',
    anyOf: PEOPLE_HUB_PERMISSIONS,
    children: peopleChildren,
  },
  {
    id: 'finance',
    label: COMPANY_HUB_LABELS.finance,
    path: '/finance',
    icon: 'finance',
    anyOf: FINANCE_HUB_PERMISSIONS,
    children: financeChildren,
  },
  {
    id: 'work',
    label: COMPANY_HUB_LABELS.work,
    path: '/work',
    icon: 'work',
    anyOf: WORK_HUB_PERMISSIONS,
    children: workChildren,
  },
  {
    id: 'reports-org',
    label: 'Reports',
    path: '/reports',
    icon: 'reports',
    permission: 'reports:read',
  },
  {
    id: 'settings-org',
    label: 'Settings',
    path: '/settings',
    icon: 'settings',
    permission: 'settings:read',
  },
]

export const sidebarNav: NavEntry[] = [...superAdminNav, ...orgNav]

function isNavItemVisible(item: NavItem, user: AuthUser): boolean {
  const { role } = user

  if (role === 'superadmin') {
    return item.roles?.includes('superadmin') ?? false
  }

  // Items scoped to specific roles (e.g. superadmin-only) must not leak via permissions.
  if (item.roles && !item.roles.includes(role)) {
    return false
  }

  if (item.id === 'leave') {
    return userHasPermission(user, 'leave:manage')
  }

  // Approve-only roles (no personal request) still get a team queue entry.
  if (item.id === 'leave-requests') {
    return (
      userHasPermission(user, 'leave:approve') &&
      !userHasPermission(user, 'leave:manage') &&
      !userHasPermission(user, 'leave:request')
    )
  }

  // Managers and employees with leave:request see My Leaves (not Leave Requests).
  if (item.id === 'leave-my') {
    return (
      userHasPermission(user, 'leave:request') && !userHasPermission(user, 'leave:manage')
    )
  }

  if (item.id === 'performance-team') {
    return role === 'manager' && userHasPermission(user, 'performance:read')
  }

  if (item.id === 'tasks') {
    // Admin/HR use org views; personal My Tasks is for managers and employees
    return role !== 'admin' && role !== 'hr' && userHasPermission(user, 'tasks:read')
  }

  if (item.id === 'clients') {
    return role !== 'hr' && userHasPermission(user, 'clients:read')
  }

  if (item.id === 'attendance') {
    return userHasAnyPermission(user, ['attendance:manage', 'attendance:team'])
  }

  if (item.id === 'attendance-my') {
    // Admin has team Attendance; personal shortcut is for managers/employees who punch
    return role !== 'admin' && userHasPermission(user, 'attendance:self')
  }

  if (item.id === 'salaries-my') {
    // Admin already has Salaries; personal My Salary is for other roles
    return (
      role !== 'admin' && userHasAnyPermission(user, ['salaries:self', 'salaries:read'])
    )
  }

  if (item.permission) {
    return userHasPermission(user, item.permission)
  }

  if (item.anyOf) {
    return userHasAnyPermission(user, item.anyOf)
  }

  if (item.roles) {
    return item.roles.includes(role)
  }

  return false
}

function remapNavItem(item: NavItem, user: AuthUser): NavItem {
  const { role } = user

  if (role === 'employee') {
    if (item.id === 'projects') return { ...item, label: 'My Projects' }
    if (item.id === 'performance') return { ...item, label: 'My Performance' }
  }
  if (role === 'manager') {
    if (item.id === 'performance') return { ...item, label: 'My Performance' }
  }
  if (role === 'hr' && item.id === 'leave') {
    return { ...item, label: 'Leave Management' }
  }
  return item
}

function dedupeItems(items: NavItem[]): NavItem[] {
  const seenPaths = new Set<string>()
  return items.filter((item) => {
    const pathKey = `${item.path}:${item.icon}`
    if (seenPaths.has(pathKey)) return false
    seenPaths.add(pathKey)
    return true
  })
}

/** Flat list of visible leaf links (includes hub paths for groups). Kept for callers that need a linear nav. */
export function navForUser(user: AuthUser): NavItem[] {
  return navTreeForUser(user).flatMap((entry) => {
    if (isNavGroup(entry)) {
      return [
        {
          id: entry.id,
          label: entry.label,
          path: entry.path,
          icon: entry.icon,
          anyOf: entry.anyOf,
        },
        ...entry.children,
      ]
    }
    return [entry]
  })
}

export function navTreeForUser(user: AuthUser): NavEntry[] {
  const { role } = user

  if (role === 'superadmin') {
    return sidebarNav
      .filter((entry): entry is NavItem => !isNavGroup(entry) && isNavItemVisible(entry, user))
      .map((item) => remapNavItem(item, user))
  }

  const result: NavEntry[] = []

  for (const entry of orgNav) {
    if (isNavGroup(entry)) {
      const children = dedupeItems(
        entry.children
          .filter((child) => isNavItemVisible(child, user))
          .map((child) => remapNavItem(child, user)),
      )
      if (children.length === 0) continue
      result.push({ ...entry, children })
      continue
    }

    if (!isNavItemVisible(entry, user)) continue
    result.push(remapNavItem(entry, user))
  }

  return result
}
