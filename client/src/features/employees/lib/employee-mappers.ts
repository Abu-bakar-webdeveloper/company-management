import type { AccountStatus, AuthUser } from '@/features/auth/model/types'
import { staffRoleLabel, type StaffRole } from '@/features/auth/lib/staff-roles'
import type { EmployeeCreateFormValues, EmployeeFormValues } from '@/features/employees/model/schemas'
import { resolveRoleApiKey } from '@/features/settings/lib/role-permissions'
import type { CustomRole } from '@/features/settings/model/types'
import type { CreateUserPayload, UpdateUserPayload } from '@/shared/api/usersApi'
import type { Employee, EmployeeDepartment, EmployeeStatus } from '@/features/employees/model/types'
import { uploadAvatarToCloudinary } from '@/shared/lib/uploadAvatar'

const DEPARTMENTS: EmployeeDepartment[] = [
  'engineering',
  'design',
  'marketing',
  'hr',
  'finance',
  'operations',
]

function toEmployeeId(user: AuthUser): string {
  return user.employeeCode || `EMP-${user.id.slice(-4).toUpperCase()}`
}

function parseDepartment(value?: string): EmployeeDepartment {
  if (value && DEPARTMENTS.includes(value as EmployeeDepartment)) {
    return value as EmployeeDepartment
  }
  return 'engineering'
}

export function mapAccountStatusToEmployee(status: AccountStatus): EmployeeStatus {
  if (status === 'pending') return 'pending'
  if (status === 'suspended') return 'suspended'
  return 'active'
}

export function mapEmployeeStatusToAccount(
  status: EmployeeStatus,
): 'active' | 'pending' | 'suspended' | undefined {
  if (status === 'active') return 'active'
  if (status === 'pending') return 'pending'
  if (status === 'suspended' || status === 'inactive') return 'suspended'
  return undefined
}

export function mapAuthUserToEmployee(user: AuthUser): Employee {
  const department = parseDepartment(user.department)
  const staffRole = user.role as StaffRole
  const roleLabel =
    user.customRoleName ??
    (staffRole === 'manager' || staffRole === 'hr' || staffRole === 'employee'
      ? staffRoleLabel(staffRole)
      : 'Employee')

  return {
    id: user.id,
    employeeId: toEmployeeId(user),
    fullName: user.fullName,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone ?? '',
    cnic: user.cnic,
    homeAddress: user.homeAddress,
    department,
    jobTitle: user.jobTitle?.trim() || '',
    systemRole:
      user.role === 'manager' || user.role === 'hr' || user.role === 'employee'
        ? user.role
        : undefined,
    customRoleId: user.customRoleId ?? null,
    roleLabel,
    status: mapAccountStatusToEmployee(user.status),
    joinDate: user.joinDate ?? new Date().toISOString(),
    avatar: user.avatar,
    workLocation: 'On-site',
    employmentType: 'Full-time',
    managerId: user.managerId ?? null,
    managerName: user.managerName,
    managerAvatar: user.managerAvatar,
    reporteesCount: user.reporteesCount,
    basicSalary: user.basicSalary,
    hra: user.hra,
    utilityAllowance: user.utilityAllowance,
    conveyanceAllowance: user.conveyanceAllowance,
    bankName: user.bankName,
    bankAccountNo: user.bankAccountNo,
    employmentStage: user.employmentStage,
    probationEndDate: user.probationEndDate,
    confirmationDate: user.confirmationDate,
  }
}

function getCustomRoleIdFromRole(role: string): string | undefined {
  if (!role.startsWith('custom:')) return undefined
  return role.slice('custom:'.length)
}

export async function formValuesToCreatePayload(
  values: EmployeeCreateFormValues | EmployeeFormValues,
  customRoles: CustomRole[] = [],
): Promise<CreateUserPayload> {
  const roleKey = 'role' in values && values.role ? values.role : 'employee'
  const apiRole = resolveRoleApiKey(roleKey, customRoles) ?? 'employee'
  const customRoleId = getCustomRoleIdFromRole(roleKey)
  const avatar =
    'photo' in values && values.photo
      ? await uploadAvatarToCloudinary(values.photo)
      : undefined

  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    role: apiRole,
    phone: values.phone?.trim() || undefined,
    cnic: values.cnic?.trim() || undefined,
    department: values.department,
    jobTitle: values.jobTitle.trim(),
    homeAddress: values.homeAddress?.trim() || undefined,
    joinDate: values.joinDate || undefined,
    sendInviteEmail: values.sendInviteEmail ?? true,
    ...(customRoleId ? { customRoleId } : {}),
    ...(values.managerId ? { managerId: values.managerId } : {}),
    ...(avatar ? { avatar } : {}),
    ...(values.basicSalary != null ? { basicSalary: values.basicSalary } : {}),
    ...(values.hra != null ? { hra: values.hra } : {}),
    ...(values.utilityAllowance != null
      ? { utilityAllowance: values.utilityAllowance }
      : {}),
    ...(values.conveyanceAllowance != null
      ? { conveyanceAllowance: values.conveyanceAllowance }
      : {}),
    ...(values.bankName?.trim() ? { bankName: values.bankName.trim() } : {}),
    ...(values.bankAccountNo?.trim() ? { bankAccountNo: values.bankAccountNo.trim() } : {}),
    ...(values.employmentStage ? { employmentStage: values.employmentStage } : {}),
    ...(values.employmentStage === 'permanent'
      ? {
          confirmationDate:
            values.confirmationDate || values.joinDate || undefined,
        }
      : {}),
  }
}

export function formValuesToUpdatePayload(
  values: EmployeeFormValues,
  customRoles: CustomRole[] = [],
): UpdateUserPayload {
  const status = mapEmployeeStatusToAccount(values.status)
  const rolePayload = resolveUpdateRolePayload(values.role, customRoles)

  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    phone: values.phone.trim(),
    cnic: values.cnic?.trim() || undefined,
    department: values.department,
    jobTitle: values.jobTitle.trim(),
    homeAddress: values.homeAddress?.trim() || undefined,
    joinDate: values.joinDate,
    managerId: values.managerId ? values.managerId : null,
    ...(status ? { status } : {}),
    ...rolePayload,
    ...(values.basicSalary != null ? { basicSalary: values.basicSalary } : {}),
    ...(values.hra != null ? { hra: values.hra } : {}),
    ...(values.utilityAllowance != null
      ? { utilityAllowance: values.utilityAllowance }
      : {}),
    ...(values.conveyanceAllowance != null
      ? { conveyanceAllowance: values.conveyanceAllowance }
      : {}),
    bankName: values.bankName?.trim() || '',
    bankAccountNo: values.bankAccountNo?.trim() || '',
    ...(values.employmentStage ? { employmentStage: values.employmentStage } : {}),
    ...(values.employmentStage === 'permanent'
      ? {
          confirmationDate:
            values.confirmationDate || values.joinDate || undefined,
        }
      : values.employmentStage === 'probation'
        ? { confirmationDate: null }
        : values.confirmationDate
          ? { confirmationDate: values.confirmationDate }
          : {}),
  }
}

function resolveUpdateRolePayload(
  role: string | undefined,
  customRoles: CustomRole[],
): Pick<UpdateUserPayload, 'role' | 'customRoleId'> {
  if (!role) return {}

  const apiRole = resolveRoleApiKey(role, customRoles)
  if (!apiRole) return {}

  const customRoleId = getCustomRoleIdFromRole(role)
  return {
    role: apiRole,
    customRoleId: customRoleId ?? null,
  }
}

export async function formValuesToUpdatePayloadWithPhoto(
  values: EmployeeFormValues,
  customRoles: CustomRole[] = [],
): Promise<UpdateUserPayload> {
  const payload = formValuesToUpdatePayload(values, customRoles)
  if (!values.photo) return payload

  const avatar = await uploadAvatarToCloudinary(values.photo)
  return { ...payload, avatar }
}

export function mapListStatusFilter(
  status: EmployeeStatus | 'all',
): 'active' | 'pending' | 'suspended' | undefined {
  if (status === 'active') return 'active'
  if (status === 'pending') return 'pending'
  if (status === 'suspended' || status === 'inactive') return 'suspended'
  return undefined
}
