import {
  getCreatableStaffRoles,
  staffRoleLabel,
  type StaffRole,
} from '@/features/auth/lib/staff-roles'
import type { UserRole } from '@/features/auth/model/types'
import type { CustomRole } from '@/features/settings/model/types'

export type AssignableRoleOption = {
  value: StaffRole | `custom:${string}`
  label: string
  group: 'default' | 'custom'
}

export function getAssignableRoleOptions(
  actorRole: UserRole,
  customRoles: CustomRole[],
): AssignableRoleOption[] {
  const defaults = getCreatableStaffRoles(actorRole).map((role) => ({
    value: role as StaffRole,
    label: staffRoleLabel(role),
    group: 'default' as const,
  }))

  if (actorRole !== 'admin') {
    return defaults
  }

  const custom = customRoles.map((role) => ({
    value: `custom:${role.id}` as const,
    label: role.name,
    group: 'custom' as const,
  }))

  return [...defaults, ...custom]
}

export function isEmployeeAssignableRole(
  role: UserFormValuesRole,
  customRoles: CustomRole[],
): boolean {
  return requiresEmployeeProfile(role, customRoles)
}

export function requiresEmployeeProfile(
  role: string,
  customRoles: CustomRole[],
): boolean {
  if (role === 'employee') return true
  if (role === 'manager' || role === 'hr') return false
  if (!role?.startsWith('custom:')) return true

  const customId = role.slice('custom:'.length)
  return customRoles.find((item) => item.id === customId)?.baseRole === 'employee'
}

type UserFormValuesRole = StaffRole | `custom:${string}` | ''
