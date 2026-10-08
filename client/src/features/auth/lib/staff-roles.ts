import type { UserRole } from '@/features/auth/model/types'
import { isCompanyHubEnabled } from '@/features/auth/model/companyHubs'

export type StaffRole = 'manager' | 'hr' | 'employee'

/** Default assignable staff roles for every company. */
export const DEFAULT_STAFF_ROLES: StaffRole[] = ['manager', 'hr', 'employee']

const CREATABLE_STAFF_ROLES: Record<UserRole, StaffRole[]> = {
  superadmin: [],
  admin: [...DEFAULT_STAFF_ROLES],
  hr: ['employee'],
  manager: [],
  employee: [],
}

const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  manager: 'Manager',
  hr: 'HR',
  employee: 'Employee',
}

const STAFF_ROLE_DESCRIPTIONS: Record<StaffRole, string> = {
  manager: 'Team & project oversight',
  hr: 'Personnel & leave management',
  employee: 'Standard workspace access',
}

export function getCreatableStaffRoles(actorRole: UserRole): StaffRole[] {
  return CREATABLE_STAFF_ROLES[actorRole] ?? []
}

export function getEmployeeCreatableRoles(actorRole: UserRole): StaffRole[] {
  return getCreatableStaffRoles(actorRole).filter((role) => role === 'employee')
}

export function staffRoleLabel(role: StaffRole): string {
  return STAFF_ROLE_LABELS[role]
}

export function staffRoleDescription(
  role: StaffRole,
  hubs?: readonly string[] | null,
): string {
  const people = isCompanyHubEnabled(hubs, 'people')
  const work = isCompanyHubEnabled(hubs, 'work')
  const finance = isCompanyHubEnabled(hubs, 'finance')

  if (role === 'manager') {
    if (people && work) return 'Team & project oversight'
    if (work) return 'Project oversight'
    if (people) return 'Team oversight'
    return 'Standard workspace access'
  }

  if (role === 'hr') {
    if (people && finance) return 'Personnel & payroll data'
    if (people) return 'Personnel & leave management'
    if (finance) return 'Payroll data'
    return 'Standard workspace access'
  }

  return STAFF_ROLE_DESCRIPTIONS[role]
}

export function isStaffRole(value: string): value is StaffRole {
  return DEFAULT_STAFF_ROLES.includes(value as StaffRole)
}