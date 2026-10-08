export type PlatformReport = {
  id: string
  name: string
  category: string
  generatedOn: string
  exportFormat?: 'pdf' | 'excel' | 'csv'
}

export type PlatformReportCompany = {
  id: string
  company: string
  plan: 'pro' | 'basic' | 'enterprise'
  adminUsers: number
  adminLimit: number
  revenue: string
  status: 'active' | 'inactive' | 'expired'
  details: string
}

export type SuperAdminReportMetric = {
  id: string
  label: string
  value: string
  icon: 'companies' | 'revenue' | 'subscriptions' | 'status'
  badge?: string
}

export type SuperAdminReportDetail = {
  id: string
  title: string
  metrics: SuperAdminReportMetric[]
  companies: PlatformReportCompany[]
  charts?: {
    revenueTrend: { month: string; value: number }[]
    subscriptionBreakdown: { label: string; percent: number; color: string; dot: string }[]
  }
}
