import type { AuthUser } from '@/features/auth/model/types'
import { resolveRoleApiKey } from '@/features/settings/lib/role-permissions'
import { formatPreferenceDate } from '@/features/settings/lib/preference-utils'
import type { CustomRole, ManagedUser, UserFormValues } from '@/features/settings/model/types'
import type { CreateUserPayload, UpdateUserPayload } from '@/shared/api/usersApi'

const ROLE_LABELS: Record<string, string> = {
  manager: 'Manager',
  hr: 'HR',
  employee: 'Employee',
  admin: 'Admin',
}
function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length <= 1) return { firstName: parts[0] ?? '', lastName: '' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

export function mapAuthUserToManagedUser(user: AuthUser): ManagedUser {
  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    role: user.customRoleName ?? ROLE_LABELS[user.role] ?? user.role,
    roleKey: user.role as 'manager' | 'hr' | 'employee',
    customRoleId: user.customRoleId ?? undefined,
    department: user.department ?? '—',
    status: user.status === 'pending' ? 'pending' : 'active',
    avatar: user.avatar,
    phone: user.phone,
    jobTitle: user.jobTitle,
    joinDate: user.joinDate ? formatPreferenceDate(user.joinDate) : undefined,
    managerId: user.managerId ?? null,
    managerName: user.managerName,
  }
}
export function mapRoleFilter(role: string): 'manager' | 'hr' | 'employee' | undefined {
  const normalized = role.toLowerCase()
  if (normalized === 'manager') return 'manager'
  if (normalized === 'hr') return 'hr'
  if (normalized === 'employee') return 'employee'
  return undefined
}

export function mapStatusFilter(status: string): 'active' | 'pending' | undefined {
  const normalized = status.toLowerCase()
  if (normalized === 'active') return 'active'
  if (normalized === 'pending' || normalized === 'inactive') return 'pending'
  return undefined
}

export function formValuesToCreatePayload(
  values: UserFormValues,
  customRoles: CustomRole[] = [],
): CreateUserPayload {
  if (!values.role) {
    throw new Error('Role is required')
  }

  const apiRole = resolveRoleApiKey(values.role, customRoles)
  if (!apiRole) {
    throw new Error('Invalid role selected')
  }

  const customRoleId = getCustomRoleIdFromFormRole(values.role)

  const base = {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    role: apiRole,
    ...(customRoleId ? { customRoleId } : {}),
    sendInviteEmail: values.sendInviteEmail,
  }

  if (apiRole === 'employee') {
    return {
      ...base,
      phone: values.phone?.trim() ?? '',
      cnic: values.cnic?.trim() ?? '',
      department: values.department,
      jobTitle: values.jobTitle?.trim() || undefined,
      joinDate: values.joinDate ?? new Date().toISOString().slice(0, 10),
      ...(values.managerId ? { managerId: values.managerId } : {}),
    }
  }

  if (apiRole === 'manager' || apiRole === 'hr') {
    return {
      ...base,
      department: values.department || undefined,
      jobTitle: values.jobTitle?.trim() || undefined,
      ...(values.managerId ? { managerId: values.managerId } : {}),
    }
  }

  return {
    ...base,
    jobTitle: values.jobTitle?.trim() || undefined,
    ...(values.managerId ? { managerId: values.managerId } : {}),
  }
}
export function formValuesToUpdatePayload(values: UserFormValues): UpdateUserPayload {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    phone: values.phone?.trim(),
    department: values.department || undefined,
    jobTitle: values.jobTitle?.trim() || undefined,
    joinDate: values.joinDate,
    status: values.status,
    managerId: values.managerId ? values.managerId : null,
  }
}

export function managedUserToFormValues(user: ManagedUser): UserFormValues {
  const { firstName, lastName } = splitFullName(user.name)

  return {
    firstName,
    lastName,
    email: user.email,
    role: user.customRoleId ? `custom:${user.customRoleId}` : user.roleKey,
    department: user.department === '—' ? '' : user.department,
    jobTitle: user.jobTitle ?? '',
    phone: user.phone ?? '',
    cnic: '',
    joinDate: user.joinDate ?? '',
    managerId: user.managerId ?? '',
    status: user.status,
    sendInviteEmail: false,
  }
}

export function getCustomRoleIdFromFormRole(role: UserFormValues['role']): string | null {
  if (!role?.startsWith('custom:')) return null
  return role.slice('custom:'.length)
}