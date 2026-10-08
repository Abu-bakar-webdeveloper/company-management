export type UserRole = 'superadmin' | 'admin' | 'manager' | 'hr' | 'employee'
export type AccountStatus = 'active' | 'pending' | 'suspended'

import type { Permission } from './permissions.js'
import type { CompanyHub } from '../companies/company-hubs.js'

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

export type TokenMeta = {
  userAgent?: string
  ip?: string
}

export type LoginResult = {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

export type RefreshResult = {
  user: AuthUser
  accessToken: string
  refreshToken: string
  rememberMe: boolean
}
