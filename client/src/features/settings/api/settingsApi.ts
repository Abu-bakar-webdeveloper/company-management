import {
  loadSystemPreferences,
  saveSystemPreferencesToStorage,
} from '@/features/settings/lib/preferences-storage'
import {
  managedUsers,
  notificationSettings,
  roles,
  userActivities,
} from '@/features/settings/model/settingsData'
import type { Permission } from '@/features/auth/model/permissions'
import type {
  CompanySettings,
  ManagedUser,
  NotificationSettings,
  Role,
  SystemPreferences,
  UserFormValues,
} from '@/features/settings/model/types'
import {
  companiesApi,
  type CompanyPreferencesDto,
  type UpdateCompanyPreferencesPayload,
} from '@/features/platform/api/companiesApi'
import { formatCompanyDate } from '@/shared/lib/format'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

function toCompanySettings(company: CompanyPreferencesDto): CompanySettings {
  return {
    companyName: company.name,
    email: company.email,
    phone: company.phone,
    country: company.country,
    city: company.city,
    addressLine: company.addressLine,
    postalCode: company.postalCode,
    primaryColor: company.primaryColor,
    secondaryColor: company.secondaryColor,
    timezone: company.timezone,
    currency: company.currency,
    dateFormat: company.dateFormat,
    logoUrl: company.logoUrl,
  }
}

function toUpdatePayload(settings: CompanySettings): UpdateCompanyPreferencesPayload {
  return {
    companyName: settings.companyName,
    email: settings.email,
    phone: settings.phone,
    country: settings.country,
    city: settings.city,
    addressLine: settings.addressLine,
    postalCode: settings.postalCode,
    primaryColor: settings.primaryColor,
    secondaryColor: settings.secondaryColor,
    timezone: settings.timezone,
    currency: settings.currency,
    dateFormat: settings.dateFormat,
    ...(settings.logoUrl ? { logoUrl: settings.logoUrl } : {}),
  }
}

export const settingsApi = {
  async getRoles(): Promise<Role[]> {
    await delay()
    return roles.map((role) => ({
      ...role,
      permissions: [...role.permissions],
    }))
  },

  async saveRolePermissions(_roleId: string, _permissions: Permission[]) {
    await delay(500)
    return { success: true }
  },

  async createRole(name: string): Promise<Role> {
    await delay(500)
    return {
      id: `role-${Date.now()}`,
      name,
      description: 'Custom role',
      userCount: 0,
      permissions: ['dashboard:view'],
      isLocked: true,
      readOnly: true,
    }
  },

  async getCompanySettings(): Promise<CompanySettings> {
    const company = await companiesApi.getMine()
    return toCompanySettings(company)
  },

  async saveCompanySettings(settings: CompanySettings): Promise<CompanySettings> {
    const company = await companiesApi.updateMine(toUpdatePayload(settings))
    return toCompanySettings(company)
  },

  async getNotificationSettings(): Promise<NotificationSettings> {
    await delay()
    return JSON.parse(JSON.stringify(notificationSettings)) as NotificationSettings
  },

  async saveNotificationSettings(_settings: NotificationSettings) {
    await delay(500)
    return { success: true }
  },

  async getSystemPreferences(): Promise<SystemPreferences> {
    await delay()
    return loadSystemPreferences()
  },

  async saveSystemPreferences(settings: SystemPreferences) {
    await delay(500)
    saveSystemPreferencesToStorage(settings)
    return { success: true }
  },

  async runBackup() {
    await delay(800)
    return { success: true, timestamp: new Date().toISOString() }
  },

  async getUsers(): Promise<ManagedUser[]> {
    await delay()
    return managedUsers.map((u) => ({ ...u }))
  },

  async getUserActivities(userId: string) {
    await delay()
    return userActivities[userId] ?? []
  },

  async createUser(values: UserFormValues): Promise<ManagedUser> {
    await delay(500)
    const name = `${values.firstName} ${values.lastName}`.trim()
    const roleKey =
      values.role === 'hr' || values.role === 'manager' || values.role === 'employee'
        ? values.role
        : 'employee'
    const customRoleId = values.role.startsWith('custom:')
      ? values.role.slice('custom:'.length)
      : undefined

    return {
      id: `usr-${Date.now()}`,
      name,
      email: values.email,
      role: values.role === 'hr' ? 'HR' : values.role === 'manager' ? 'Manager' : 'Employee',
      roleKey,
      customRoleId,
      department: values.department,
      status: values.status,
      joinDate: formatCompanyDate(new Date().toISOString()),
      lastActive: 'Just now',
    }
  },

  async updateUser(id: string, values: UserFormValues): Promise<ManagedUser> {
    await delay(500)
    const existing = managedUsers.find((u) => u.id === id)
    const name = `${values.firstName} ${values.lastName}`.trim()
    const roleKey =
      values.role === 'hr' || values.role === 'manager' || values.role === 'employee'
        ? values.role
        : existing?.roleKey || 'employee'

    return {
      ...existing!,
      name,
      email: values.email,
      role: values.role === 'hr' ? 'HR' : values.role === 'manager' ? 'Manager' : 'Employee',
      roleKey,
      department: values.department,
      status: values.status,
    }
  },

  async deleteUser(_id: string) {
    await delay(300)
    return { success: true }
  },
}
