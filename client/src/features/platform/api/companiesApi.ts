import type { CompanyFormValues } from '@/features/platform/model/schemas'
import { apiClient } from '@/shared/api/axios'
import { uploadLogoToCloudinary } from '@/shared/lib/uploadAvatar'

export type CompanyRow = {
  id: string
  name: string
  plan: string
  users: number
  userLimit: number
  status: string
  rating: number
  actionVariant: 'view' | 'edit' | 'reactivate' | 'suspend'
}

export type CompanyDetail = {
  id: string
  name: string
  email: string
  phone: string
  startingDate?: string
  subscriptionPlan: string
  status: string
  users: number
  userLimit: number
  adminUserId: string
  createdAt: string
  country: string
  city: string
  addressLine: string
  postalCode: string
  logoUrl?: string
  primaryColor: string
  secondaryColor: string
  timezone: string
  currency: string
  dateFormat: string
  enabledHubs: Array<'people' | 'finance' | 'work'>
  admin: { id: string; email: string; fullName: string; status: string; avatar?: string }
}

export type UpdateCompanyPayload = Partial<{
  companyName: string
  email: string
  phone: string
  startingDate: string
  subscriptionPlan: string
  status: string
  adminFullName: string
  users: number
  country: string
  city: string
  addressLine: string
  postalCode: string
  primaryColor: string
  secondaryColor: string
  timezone: string
  currency: string
  dateFormat: string
  enabledHubs: Array<'people' | 'finance' | 'work'>
}>

export type CompanyStats = {
  totalCompanies: number
  activeCompanies: number
  trialCompanies: number
  inactiveCompanies: number
  licensedUsers: number
  activeUsers: number
  platformRevenue: number
}

export type CompanyGrowthPoint = {
  month: string
  newCompanies: number
  totalUsers: number
}

export type CreateCompanyResult = {
  company: CompanyDetail
  devInviteToken?: string
}

export type ListCompaniesParams = {
  page?: number
  limit?: number
  status?: string
  search?: string
  rating?: number
}

export type ListCompaniesResult = {
  companies: CompanyRow[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type UpdateCompanyPreferencesPayload = Partial<{
  companyName: string
  email: string
  phone: string
  country: string
  city: string
  addressLine: string
  postalCode: string
  logoUrl: string
  primaryColor: string
  secondaryColor: string
  timezone: string
  currency: string
  dateFormat: string
}>

export type CompanyPreferencesDto = {
  id: string
  name: string
  email: string
  phone: string
  country: string
  city: string
  addressLine: string
  postalCode: string
  timezone: string
  currency: string
  dateFormat: string
  primaryColor: string
  secondaryColor: string
  logoUrl?: string
}

export const companiesApi = {
  async getMine(): Promise<CompanyPreferencesDto> {
    const { data } = await apiClient.get<{ company: CompanyPreferencesDto }>('/companies/me')
    return data.company
  },

  async updateMine(payload: UpdateCompanyPreferencesPayload): Promise<CompanyPreferencesDto> {
    const { data } = await apiClient.patch<{ company: CompanyPreferencesDto }>(
      '/companies/me',
      payload,
    )
    return data.company
  },

  async create(values: CompanyFormValues): Promise<CreateCompanyResult> {
    const { logo, ...rest } = values
    let logoUrl: string | undefined
    if (logo) {
      logoUrl = await uploadLogoToCloudinary(logo)
    }
    const { data } = await apiClient.post<CreateCompanyResult>('/companies', {
      ...rest,
      ...(logoUrl ? { logoUrl } : {}),
    })
    return data
  },

  async list(params?: ListCompaniesParams): Promise<ListCompaniesResult> {
    const { data } = await apiClient.get<ListCompaniesResult>('/companies', { params })
    return data
  },

  async getStats(): Promise<CompanyStats> {
    const { data } = await apiClient.get<{ stats: CompanyStats }>('/companies/stats')
    return data.stats
  },

  async getGrowth(months = 6): Promise<CompanyGrowthPoint[]> {
    const { data } = await apiClient.get<{ growth: CompanyGrowthPoint[] }>(
      '/companies/stats/growth',
      { params: { months } },
    )
    return data.growth
  },

  async getById(id: string): Promise<CompanyDetail> {
    const { data } = await apiClient.get<{ company: CompanyDetail }>(`/companies/${id}`)
    return data.company
  },

  async resendInvite(id: string): Promise<{ devInviteToken?: string }> {
    const { data } = await apiClient.post<{ devInviteToken?: string }>(
      `/companies/${id}/resend-invite`,
    )
    return data
  },

  async update(id: string, payload: UpdateCompanyPayload): Promise<CompanyDetail> {
    const { data } = await apiClient.patch<{ company: CompanyDetail }>(`/companies/${id}`, payload)
    return data.company
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/companies/${id}`)
  },

  async resetAccess(id: string): Promise<void> {
    await apiClient.post(`/companies/${id}/reset-access`)
  },
}
