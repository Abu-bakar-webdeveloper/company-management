import type { Permission } from '@/features/auth/model/permissions'

export type ActivityStatus = 'success' | 'warning'

export type SystemActivity = {
  id: string
  activity: string
  icon: 'policy' | 'report' | 'alert'
  administrator: string
  dateTime: string
  status: ActivityStatus
}

export type Role = {
  id: string
  name: string
  description: string
  userCount: number
  badge?: string
  permissions: Permission[]
  isCustom?: boolean
  isDefault?: boolean
  baseRole?: 'manager' | 'hr' | 'employee'
  readOnly?: boolean
  isLocked?: boolean
}

export type CustomRole = {
  id: string
  name: string
  description: string
  baseRole: 'manager' | 'hr' | 'employee'
  permissions: Permission[]
  createdAt: string
  userCount?: number
  isLocked?: boolean
}

export type CompanySettings = {
  companyName: string
  email: string
  phone: string
  country: string
  city: string
  addressLine: string
  postalCode: string
  primaryColor: string
  secondaryColor: string
  timezone: string
  currency: string
  dateFormat: string
  logoUrl?: string
}

export type NotificationSettings = {
  email: Record<string, boolean>
  system: Record<string, boolean>
  reminders: Record<string, string>
  channels: Record<string, boolean>
}

export type SystemPreferences = {
  language: string
  timezone: string
  dateFormat: string
  timeFormat: string
  theme: 'light' | 'dark'
  primaryColor: string
  sidebarStyle: string
  defaultDashboard: string
  defaultLandingPage: string
  showQuickStats: boolean
  enableCharts: boolean
  autoLogoutTime: string
  sessionTimeout: string
  enableAutoSave: boolean
  enableNotifications: boolean
  autoBackup: boolean
  backupFrequency: string
}

export type SecuritySettings = {
  minPasswordLength: string
  passwordExpiry: string
  requireUppercase: boolean
  requireNumbers: boolean
  requireSymbols: boolean
  enable2fa: boolean
  twoFactorMethod: 'email' | 'authenticator'
  maxLoginAttempts: string
  accountLockTime: string
  rememberDevices: boolean
  sessionTimeout: string
  autoLogout: boolean
}

export type ActiveSession = {
  id: string
  device: string
  detail: string
  location: string
  lastActive: string
  lastActiveTone: 'success' | 'info'
}

export type SecurityLog = {
  id: string
  actor: string
  action: string
  date: string
}

export type ManagedUser = {
  id: string
  name: string
  email: string
  role: string
  roleKey: 'manager' | 'hr' | 'employee'
  customRoleId?: string
  department: string
  status: 'active' | 'pending'
  avatar?: string
  phone?: string
  location?: string
  jobTitle?: string
  joinDate?: string
  lastActive?: string
  managerId?: string | null
  managerName?: string
}

export type UserListFilters = {
  search: string
  role: string
  status: string
  department: string
}

export type UserFormValues = {
  firstName: string
  lastName: string
  email: string
  /** System role key or `custom:<id>` for admin-created roles */
  role: 'manager' | 'hr' | 'employee' | `custom:${string}` | ''
  department: string
  jobTitle?: string
  phone?: string
  cnic?: string
  joinDate?: string
  managerId?: string
  status: 'active' | 'pending'
  sendInviteEmail: boolean
}

export type UserActivity = {
  id: string
  title: string
  description: string
  timestamp: string
}
