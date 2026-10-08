import type { UserRole } from '@/features/auth/model/types'

export type Permission =
  | 'dashboard:view'
  | 'employees:read'
  | 'employees:write'
  | 'team:read'
  | 'tasks:read'
  | 'tasks:write'
  | 'projects:read'
  | 'projects:write'
  | 'clients:read'
  | 'clients:write'
  | 'leave:manage'
  | 'leave:approve'
  | 'leave:request'
  | 'attendance:self'
  | 'attendance:team'
  | 'attendance:manage'
  | 'attendance:settings'
  | 'expenses:read'
  | 'expenses:write'
  | 'salaries:read'
  | 'salaries:write'
  | 'salaries:self'
  | 'performance:read'
  | 'performance:write'
  | 'performance:kpi-setup'
  | 'performance:roi:view'
  | 'reports:read'
  | 'settings:read'
  | 'settings:admin'

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  superadmin: [
    'dashboard:view',
    'reports:read',
    'settings:read',
    'settings:admin',
  ],
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

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

export function userHasPermission(
  user: { role: UserRole; permissions?: Permission[] },
  permission: Permission,
): boolean {
  if (user.permissions?.length) {
    return user.permissions.includes(permission)
  }
  return hasPermission(user.role, permission)
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission))
}

export function userHasAnyPermission(
  user: { role: UserRole; permissions?: Permission[] },
  permissions: Permission[],
): boolean {
  return permissions.some((permission) => userHasPermission(user, permission))
}

/** Contract / commercial money — admin & HR only (not managers). */
export function canViewContractValue(role: UserRole | undefined): boolean {
  return role === 'admin' || role === 'hr' || role === 'superadmin'
}
