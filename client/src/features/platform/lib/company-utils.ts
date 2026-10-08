import { resolveEnabledHubs } from '@/features/auth/model/companyHubs'
import type {
  CompanyDetail as ApiCompanyDetail,
  CompanyRow,
  CompanyStats,
  ListCompaniesParams,
  UpdateCompanyPayload,
} from '@/features/platform/api/companiesApi'
import type { CompanyEditFormValues } from '@/features/platform/model/schemas'
import { planLabels, type PlatformStatCardData } from '@/features/platform/model/companiesData'
import type { Company, CompanyDetail, CompanyListFilters } from '@/features/platform/model/types'
import { formatCompanyLongDate } from '@/shared/lib/format'

function toDateInputValue(iso?: string): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

export function mapApiCompanyToEditForm(company: ApiCompanyDetail): CompanyEditFormValues {
  return {
    companyName: company.name,
    email: company.email,
    phone: company.phone,
    startingDate: toDateInputValue(company.startingDate),
    subscriptionPlan: company.subscriptionPlan as CompanyEditFormValues['subscriptionPlan'],
    status: company.status as CompanyEditFormValues['status'],
    adminFullName: company.admin.fullName,
    users: company.users ?? 0,
    country: company.country,
    city: company.city,
    addressLine: company.addressLine,
    postalCode: company.postalCode,
    primaryColor: company.primaryColor,
    secondaryColor: company.secondaryColor,
    timezone: company.timezone,
    currency: company.currency,
    dateFormat: company.dateFormat,
    enabledHubs: resolveEnabledHubs(company.enabledHubs),
  }
}

export function editFormToUpdatePayload(values: CompanyEditFormValues): UpdateCompanyPayload {
  return {
    companyName: values.companyName,
    email: values.email,
    phone: values.phone,
    startingDate: values.startingDate,
    subscriptionPlan: values.subscriptionPlan,
    status: values.status,
    adminFullName: values.adminFullName,
    users: values.users,
    country: values.country,
    city: values.city,
    addressLine: values.addressLine,
    postalCode: values.postalCode,
    primaryColor: values.primaryColor,
    secondaryColor: values.secondaryColor,
    timezone: values.timezone,
    currency: values.currency,
    dateFormat: values.dateFormat,
    enabledHubs: values.enabledHubs,
  }
}

export function mapApiCompanyToDetail(company: ApiCompanyDetail): CompanyDetail {
  const joinDate = formatCompanyLongDate(company.startingDate ?? company.createdAt)
  const location = [company.city, company.country].filter(Boolean).join(', ')

  return {
    id: company.id,
    name: company.name,
    industry: location || '—',
    email: company.email,
    phone: company.phone,
    joinDate,
    status: company.status as CompanyDetail['status'],
    plan: company.subscriptionPlan as CompanyDetail['plan'],
    adminId: company.admin.id,
    joiningDate: joinDate,
    workLocation: company.addressLine
      ? `${company.addressLine}${location ? `, ${location}` : ''}`
      : location || '—',
    adminName: company.admin.fullName,
    adminEmail: company.admin.email,
    adminStatus: company.admin.status as CompanyDetail['adminStatus'],
    adminAvatar: company.admin.avatar,
    logoUrl: company.logoUrl,
    employees: company.users ?? 0,
    employeeAvatars: [],
    enabledHubs: resolveEnabledHubs(company.enabledHubs),
  }
}

export function mapCompanyRow(row: CompanyRow): Company {
  return {
    id: row.id,
    name: row.name,
    plan: row.plan as Company['plan'],
    users: row.users,
    userLimit: row.userLimit,
    status: row.status as Company['status'],
    rating: row.rating,
    actionVariant: row.actionVariant,
  }
}

export function toListCompaniesParams(
  filters: CompanyListFilters,
  page: number,
  limit: number,
): ListCompaniesParams {
  return {
    page,
    limit,
    ...(filters.status !== 'all' ? { status: filters.status } : {}),
    ...(filters.search.trim() ? { search: filters.search.trim() } : {}),
    ...(filters.rating !== 'all' ? { rating: Number(filters.rating) } : {}),
  }
}

export function companyStatsToStatCards(stats: CompanyStats): PlatformStatCardData[] {
  return [
    {
      id: 'companies',
      label: 'Total Companies',
      value: String(stats.totalCompanies),
      change: '—',
      trend: 'up',
      icon: 'companies',
    },
    {
      id: 'active',
      label: 'Active Companies',
      value: String(stats.activeCompanies),
      change: '—',
      trend: 'up',
      icon: 'users',
    },
    {
      id: 'users',
      label: 'Total Users',
      value: String(stats.activeUsers),
      change: '—',
      trend: 'up',
      icon: 'users',
    },
    {
      id: 'revenue',
      label: 'Platform Revenue',
      value: `$${stats.platformRevenue.toLocaleString()}`,
      change: '—',
      trend: 'up',
      icon: 'revenue',
    },
  ]
}

export function filterCompanies(companies: Company[], filters: CompanyListFilters): Company[] {
  const q = filters.search.trim().toLowerCase()

  return companies.filter((company) => {
    const matchesSearch =
      !q ||
      company.name.toLowerCase().includes(q) ||
      planLabels[company.plan].toLowerCase().includes(q)

    const matchesRating =
      filters.rating === 'all' || company.rating >= Number(filters.rating)

    const matchesStatus = filters.status === 'all' || company.status === filters.status

    return matchesSearch && matchesRating && matchesStatus
  })
}
