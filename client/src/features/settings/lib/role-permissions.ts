import {
  DEFAULT_STAFF_ROLES,
  staffRoleDescription,
  staffRoleLabel,
  type StaffRole,
} from '@/features/auth/lib/staff-roles'
import {
  filterPermissionsForHubs,
  resolveEnabledHubs,
  type CompanyHub,
} from '@/features/auth/model/companyHubs'
import {
  ROLE_PERMISSIONS,
  type Permission,
} from '@/features/auth/model/permissions'
import type { CustomRole, Role } from '@/features/settings/model/types'

export function getDefaultStaffRoles(
  userCounts?: Partial<Record<StaffRole, number>>,
  hubs?: readonly CompanyHub[] | null,
): Role[] {
  const enabledHubs = resolveEnabledHubs(hubs)
  return DEFAULT_STAFF_ROLES.map((role, index) => ({
    id: role,
    name: staffRoleLabel(role),
    description: staffRoleDescription(role, enabledHubs),
    badge: index === 0 ? 'Default Role' : undefined,
    userCount: userCounts?.[role] ?? 0,
    permissions: filterPermissionsForHubs([...ROLE_PERMISSIONS[role]], enabledHubs),
    isDefault: true,
    baseRole: role,
    readOnly: true,
  }))
}

export function customRoleToRole(
  custom: CustomRole,
  userCount = 0,
  hubs?: readonly CompanyHub[] | null,
): Role {
  const enabledHubs = resolveEnabledHubs(hubs)
  return {
    id: `custom:${custom.id}`,
    name: custom.name,
    description: custom.description,
    userCount: custom.userCount ?? userCount,
    badge: 'Locked',
    permissions: filterPermissionsForHubs([...custom.permissions], enabledHubs),
    isCustom: true,
    baseRole: custom.baseRole,
    readOnly: true,
    isLocked: true,
  }
}

export function apiRoleToCustomRole(role: {
  id: string
  name: string
  description: string
  baseRole: StaffRole
  permissions: Permission[]
  userCount?: number
  isLocked?: boolean
  createdAt: string
}): CustomRole {
  return {
    id: role.id,
    name: role.name,
    description: role.description,
    baseRole: role.baseRole,
    permissions: [...role.permissions],
    userCount: role.userCount,
    isLocked: role.isLocked ?? true,
    createdAt: role.createdAt,
  }
}

export function createCustomRolePayload(
  name: string,
  baseRole: StaffRole,
  permissions: Permission[],
  description?: string,
): {
  name: string
  description: string
  baseRole: StaffRole
  permissions: Permission[]
} {
  return {
    name,
    description: description ?? `Custom role based on ${staffRoleLabel(baseRole)}`,
    baseRole,
    permissions,
  }
}

export function mergeRoles(
  defaultRoles: Role[],
  customRoles: CustomRole[],
  hubs?: readonly CompanyHub[] | null,
): Role[] {
  return [...defaultRoles, ...customRoles.map((role) => customRoleToRole(role, role.userCount, hubs))]
}

export function resolveRoleApiKey(role: string, customRoles: CustomRole[]): StaffRole | null {
  if (role === 'manager' || role === 'hr' || role === 'employee') {
    return role
  }

  if (role.startsWith('custom:')) {
    const customId = role.slice('custom:'.length)
    const custom = customRoles.find((item) => item.id === customId)
    return custom?.baseRole ?? null
  }

  return null
}
