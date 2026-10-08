import type { UserRole } from '../auth/auth.types.js'
import { hasPermission, type Permission } from '../auth/permissions.js'

export type PerformanceActor = {
  id: string
  companyId: string
  role: UserRole
  permissions: Permission[]
  canWrite: boolean
  canManage: boolean
}

export function buildPerformanceActor(
  userId: string,
  companyId: string,
  role: UserRole,
  permissions: Permission[],
): PerformanceActor {
  return {
    id: userId,
    companyId,
    role,
    permissions,
    canWrite: hasPermission(role, 'performance:write', permissions),
    canManage: role === 'admin' || role === 'hr',
  }
}
