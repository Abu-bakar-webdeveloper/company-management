import type { CompanyHub } from '@/features/auth/model/companyHubs'

export type CompanyPlan = 'pro' | 'basic' | 'enterprise'

export type CompanyStatus = 'trial' | 'active' | 'inactive'

export type CompanyActionVariant = 'view' | 'edit' | 'reactivate' | 'suspend'

export type Company = {
  id: string
  name: string
  plan: CompanyPlan
  users: number
  userLimit: number
  status: CompanyStatus
  rating: number
  actionVariant: CompanyActionVariant
}

export type CompanyListFilters = {
  search: string
  rating: 'all' | '4' | '3' | '2'
  status: 'all' | CompanyStatus
}

export type CompanyDetail = {
  id: string
  name: string
  industry: string
  email: string
  phone: string
  joinDate: string
  status: CompanyStatus
  plan: CompanyPlan
  adminId: string
  joiningDate: string
  workLocation: string
  adminName: string
  adminEmail: string
  adminStatus: 'active' | 'pending'
  adminAvatar?: string
  logoUrl?: string
  employees: number
  employeeAvatars: string[]
  enabledHubs?: CompanyHub[]
}

export type Subscription = {
  id: string
  companyId: string
  companyName: string
  plan: CompanyPlan
  users: number
  adminLimit: number
  expiryDate: string
  status: CompanyStatus
  rating: number
  actionVariant: CompanyActionVariant
}

export type SubscriptionListFilters = {
  search: string
  rating: 'all' | '4' | '3' | '2'
  status: 'all' | CompanyStatus
}

export type SubscriptionDetail = CompanyDetail & {
  expiryDate: string
  adminUsers: number
  adminLimit: number
  customers: number
  customerLimit: number
  storageUsed: string
  storageLimit: string
  billingInvoice: string
  billingDate: string
  billingStatus: CompanyStatus
}

export type SubscriptionPlanTier = {
  id: CompanyPlan
  name: string
  subtitle: string
  price: string
  pricePeriod?: string
  featureHeader: string
  features: string[]
  popular?: boolean
  borderColor: string
}
