import type { Permission } from '@/features/auth/model/permissions'
import type { CompanyHub } from '@/features/auth/model/companyHubs'

export type UserRole = 'superadmin' | 'admin' | 'manager' | 'hr' | 'employee'

export type AccountStatus = 'active' | 'pending' | 'suspended'

export type { Permission }

export type AuthUser = {
  id: string
  email: string
  fullName: string
  firstName?: string
  lastName?: string
  phone?: string
  cnic?: string
  employeeCode?: string
  department?: string
  jobTitle?: string
  homeAddress?: string
  joinDate?: string
  avatar?: string
  basicSalary?: number
  hra?: number
  utilityAllowance?: number
  conveyanceAllowance?: number
  providentFund?: number
  bankName?: string
  bankAccountNo?: string
  employmentStage?: 'probation' | 'permanent'
  probationEndDate?: string
  confirmationDate?: string
  lastIncrementAt?: string
  role: UserRole
  status: AccountStatus
  companyId: string | null
  customRoleId?: string | null
  customRoleName?: string
  managerId?: string | null
  managerName?: string
  managerAvatar?: string
  reporteesCount?: number
  permissions?: Permission[]
  enabledHubs?: CompanyHub[]
}

export type AuthSession = {
  user: AuthUser
  accessToken: string
}

export type LoginCredentials = {
  email: string
  password: string
  rememberMe: boolean
}

export type RegisterPayload = {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

export type ForgotPasswordPayload = {
  email: string
}

export type AcceptInvitePayload = {
  token: string
  password: string
  confirmPassword: string
}

export type ResetPasswordPayload = {
  token: string
  password: string
  confirmPassword: string
}
