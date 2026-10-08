import type { UserRole } from './auth.types.js'

export const PERMISSIONS = [
  'dashboard:view',
  'employees:read',
  'employees:write',
  'team:read',
  'tasks:read',
  'tasks:write',
  'projects:read',
  'projects:write',
  'clients:read',
  'clients:write',
  'leave:manage',
  'leave:approve',
  'leave:request',
  'attendance:self',
  'attendance:team',
  'attendance:manage',
  'attendance:settings',
  'expenses:read',
  'expenses:write',
  'salaries:read',
  'salaries:write',
  'salaries:self',
  'performance:read',
  'performance:write',
  'performance:kpi-setup',
  'performance:roi:view',
  'reports:read',
  'settings:read',
  'settings:admin',
] as const

export type Permission = (typeof PERMISSIONS)[number]

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  superadmin: ['dashboard:view', 'reports:read', 'settings:read', 'settings:admin'],
  admin: [
    'dashboard:view',
    'employees:read',
    'employees:write',
    'tasks:read',
    'tasks:write',
    'projects:read',
    'projects:write',
    'clients:read',
    'clients:write',
    'leave:manage',
    'leave:approve',
    'attendance:self',
    'attendance:manage',
    'attendance:settings',
    'expenses:read',
    'expenses:write',
    'salaries:read',
    'salaries:write',
    'performance:read',
    'performance:write',
    'performance:kpi-setup',
    'performance:roi:view',
    'reports:read',
    'settings:read',
    'settings:admin',
  ],
  hr: [
    'dashboard:view',
    'employees:read',
    'employees:write',
    'projects:read',
    'leave:manage',
    'leave:approve',
    'attendance:self',
    'attendance:manage',
    'expenses:read',
    'expenses:write',
    'salaries:read',
    'salaries:write',
    'performance:read',
    'performance:roi:view',
    'reports:read',
    'settings:read',
  ],
  manager: [
    'dashboard:view',
    'team:read',
    'tasks:read',
    'tasks:write',
    'projects:read',
    'projects:write',
    'clients:read',
    'clients:write',
    'leave:approve',
    'leave:request',
    'attendance:self',
    'attendance:team',
    'salaries:self',
    'performance:read',
    'performance:write',
    'performance:roi:view',
    'reports:read',
    'settings:read',
  ],
  employee: [
    'dashboard:view',
    'tasks:read',
    'tasks:write',
    'projects:read',
    'leave:request',
    'attendance:self',
    'salaries:self',
    'performance:read',
    'settings:read',
  ],
}

export function resolveUserPermissions(
  role: UserRole,
  customPermissions?: Permission[] | null,
): Permission[] {
  if (customPermissions?.length) {
    return customPermissions
  }
  return ROLE_PERMISSIONS[role] ?? []
}

export function hasPermission(
  role: UserRole,
  permission: Permission,
  customPermissions?: Permission[] | null,
): boolean {
  return resolveUserPermissions(role, customPermissions).includes(permission)
}
