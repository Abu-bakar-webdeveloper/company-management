import { Types } from 'mongoose'
import { AppError } from '../../utils/AppError.js'
import { User } from '../auth/user.model.js'
import {
  Company,
  type SubscriptionPlan,
} from '../companies/company.model.js'
import { getCompanyGrowth, getCompanyStats } from '../companies/company.service.js'
import { buildPlatformCsv } from './exporters/csv.js'
import { buildPlatformExcel } from './exporters/excel.js'
import { buildPlatformPdf } from './exporters/pdf.js'
import type { ExportFormat } from './report.model.js'

const PLAN_MONTHLY_PRICE: Record<SubscriptionPlan, number> = {
  basic: 29,
  pro: 99,
  enterprise: 299,
}

const PLAN_ADMIN_LIMITS: Record<SubscriptionPlan, number> = {
  basic: 3,
  pro: 5,
  enterprise: 10,
}

export type PlatformReportKey =
  | 'platform-performance'
  | 'revenue-summary'
  | 'admin-activity'
  | 'subscription-overview'

export type PlatformReportListItem = {
  id: PlatformReportKey
  name: string
  category: string
  generatedOn: string
  exportFormat: ExportFormat
}

export type PlatformStatCard = {
  id: string
  label: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: 'companies' | 'users' | 'subscriptions' | 'revenue'
}

export type PlatformMetric = {
  id: string
  label: string
  value: string
  icon: 'companies' | 'revenue' | 'subscriptions' | 'status'
  badge?: string
}

export type PlatformCompanyRow = {
  id: string
  company: string
  plan: SubscriptionPlan
  adminUsers: number
  adminLimit: number
  revenue: string
  status: 'active' | 'inactive' | 'expired'
  details: string
}

export type PlatformChartsDto = {
  revenueTrend: { month: string; value: number }[]
  subscriptionBreakdown: { label: string; percent: number; color: string; dot: string }[]
}

export type PlatformReportDetailDto = {
  id: PlatformReportKey
  title: string
  metrics: PlatformMetric[]
  companies: PlatformCompanyRow[]
  charts: PlatformChartsDto
}

const REPORT_META: Record<
  PlatformReportKey,
  { name: string; category: string; exportFormat: ExportFormat }
> = {
  'platform-performance': {
    name: 'Platform Performance Report',
    category: 'Subscription',
    exportFormat: 'pdf',
  },
  'revenue-summary': {
    name: 'Revenue Summary',
    category: 'Subscription',
    exportFormat: 'excel',
  },
  'admin-activity': {
    name: 'Admin Activity Report',
    category: 'Admins',
    exportFormat: 'pdf',
  },
  'subscription-overview': {
    name: 'Subscription Overview',
    category: 'Subscription',
    exportFormat: 'excel',
  },
}

const BREAKDOWN_STYLES: Record<string, { color: string; dot: string; label: string }> = {
  enterprise: { label: 'Enterprise Plan', color: 'bg-[#9333EA]', dot: 'bg-[#9333EA]' },
  pro: { label: 'Pro', color: 'bg-[#1877F2]', dot: 'bg-[#1877F2]' },
  basic: { label: 'Basic Plan', color: 'bg-[#00B67A]', dot: 'bg-[#00B67A]' },
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

function mapCompanyStatus(status: string): PlatformCompanyRow['status'] {
  if (status === 'inactive') return 'inactive'
  if (status === 'trial') return 'expired'
  return 'active'
}

function assertPlatformReportKey(id: string): PlatformReportKey {
  if (id in REPORT_META) return id as PlatformReportKey
  throw new AppError('Platform report not found', 404, 'NOT_FOUND')
}

const MONTH_KEY_RE = /^\d{4}-\d{2}$/

export function resolveReportMonth(month?: string): {
  key: string
  label: string
  start: Date
  end: Date
} {
  const now = new Date()
  let year = now.getFullYear()
  let monthIndex = now.getMonth()

  if (month && MONTH_KEY_RE.test(month)) {
    const [parsedYear, parsedMonth] = month.split('-').map(Number)
    const candidate = new Date(parsedYear, parsedMonth - 1, 1)
    const currentStart = new Date(now.getFullYear(), now.getMonth(), 1)
    if (!Number.isNaN(candidate.getTime()) && candidate <= currentStart) {
      year = parsedYear
      monthIndex = parsedMonth - 1
    }
  }

  const start = new Date(year, monthIndex, 1)
  const end = new Date(year, monthIndex + 1, 1)
  return {
    key: `${year}-${String(monthIndex + 1).padStart(2, '0')}`,
    label: start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    start,
    end,
  }
}

async function loadCompanyRows(asOf: Date): Promise<PlatformCompanyRow[]> {
  const companies = await Company.find({ createdAt: { $lt: asOf } })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean()
  const companyIds = companies.map((c) => c._id)
  const adminCounts = await User.aggregate<{ _id: Types.ObjectId; count: number }>([
    {
      $match: {
        companyId: { $in: companyIds },
        role: 'admin',
        createdAt: { $lt: asOf },
      },
    },
    { $group: { _id: '$companyId', count: { $sum: 1 } } },
  ])
  const adminMap = new Map(adminCounts.map((row) => [row._id.toString(), row.count]))

  return companies.map((company) => {
    const plan = company.subscriptionPlan
    const price = PLAN_MONTHLY_PRICE[plan] ?? 0
    const adminUsers = adminMap.get(company._id.toString()) ?? (company.adminUserId ? 1 : 0)
    return {
      id: company._id.toString(),
      company: company.name,
      plan,
      adminUsers,
      adminLimit: PLAN_ADMIN_LIMITS[plan] ?? 3,
      revenue: formatMoney(price),
      status: mapCompanyStatus(company.status),
      details:
        company.status === 'inactive'
          ? 'Suspended'
          : company.status === 'trial'
            ? 'Trial period'
            : `Plan: ${plan}`,
    }
  })
}

async function buildCharts(start: Date, end: Date): Promise<PlatformChartsDto> {
  const [growth, planCounts] = await Promise.all([
    getCompanyGrowth(5, start),
    Company.aggregate<{ _id: string; count: number }>([
      { $match: { createdAt: { $lt: end }, status: { $ne: 'inactive' } } },
      { $group: { _id: '$subscriptionPlan', count: { $sum: 1 } } },
    ]),
  ])

  const revenueTrend = growth.map((point) => ({
    month: point.month.toUpperCase().slice(0, 3),
    value: point.newCompanies * 50 + point.totalUsers, // relative bar scale from growth
  }))

  // Prefer actual revenue proxy: active plan counts * price, shown as % of companies
  const totalPlans = planCounts.reduce((sum, row) => sum + row.count, 0) || 1
  const subscriptionBreakdown = planCounts
    .sort((a, b) => b.count - a.count)
    .map((row) => {
      const style = BREAKDOWN_STYLES[row._id] ?? {
        label: row._id,
        color: 'bg-[#CBD5E1]',
        dot: 'bg-[#CBD5E1]',
      }
      return {
        label: style.label,
        percent: Math.round((row.count / totalPlans) * 100),
        color: style.color,
        dot: style.dot,
      }
    })

  return { revenueTrend, subscriptionBreakdown }
}

export async function getPlatformOverviewStats(month?: string): Promise<{
  stats: PlatformStatCard[]
}> {
  const { start, end } = resolveReportMonth(month)
  const [companyStats, adminCount, growth] = await Promise.all([
    getCompanyStats(end),
    User.countDocuments({ role: 'admin', createdAt: { $lt: end } }),
    getCompanyGrowth(2, start),
  ])

  const prevUsers = growth[0]?.totalUsers ?? 0
  const currUsers = growth[growth.length - 1]?.totalUsers ?? 0
  const userChange =
    prevUsers > 0 ? Math.round(((currUsers - prevUsers) / prevUsers) * 1000) / 10 : 0

  const activeSubscriptions =
    companyStats.activeCompanies + companyStats.trialCompanies

  return {
    stats: [
      {
        id: 'companies',
        label: 'Total Companies',
        value: String(companyStats.totalCompanies),
        change: `${companyStats.activeCompanies} active`,
        trend: 'up',
        icon: 'companies',
      },
      {
        id: 'admins',
        label: 'Active Admins',
        value: String(adminCount),
        change: `${userChange >= 0 ? '+' : ''}${userChange}%`,
        trend: userChange >= 0 ? 'up' : 'down',
        icon: 'users',
      },
      {
        id: 'subscriptions',
        label: 'Active Subscriptions',
        value: String(activeSubscriptions),
        change: `${companyStats.inactiveCompanies} inactive`,
        trend: companyStats.inactiveCompanies > 0 ? 'down' : 'up',
        icon: 'subscriptions',
      },
      {
        id: 'revenue',
        label: 'Monthly Revenue',
        value: formatMoney(companyStats.platformRevenue),
        change: 'Est. MRR',
        trend: 'up',
        icon: 'revenue',
      },
    ],
  }
}

export async function listPlatformReports(month?: string): Promise<PlatformReportListItem[]> {
  const { label: generatedOn } = resolveReportMonth(month)

  return (Object.keys(REPORT_META) as PlatformReportKey[]).map((id) => ({
    id,
    name: REPORT_META[id].name,
    category: REPORT_META[id].category,
    generatedOn,
    exportFormat: REPORT_META[id].exportFormat,
  }))
}

export async function getPlatformReportDetail(
  reportId: string,
  month?: string,
): Promise<PlatformReportDetailDto> {
  const id = assertPlatformReportKey(reportId)
  const { label: period, start, end } = resolveReportMonth(month)
  const [companyStats, companies, charts, adminCount] = await Promise.all([
    getCompanyStats(end),
    loadCompanyRows(end),
    buildCharts(start, end),
    User.countDocuments({ role: 'admin', createdAt: { $lt: end } }),
  ])
  const arpu =
    companyStats.totalCompanies > 0
      ? companyStats.platformRevenue / companyStats.totalCompanies
      : 0

  const baseMetrics: PlatformMetric[] = [
    {
      id: 'companies',
      label: 'Total Companies',
      value: String(companyStats.totalCompanies),
      icon: 'companies',
    },
    {
      id: 'revenue',
      label: 'Monthly Revenue',
      value: formatMoney(companyStats.platformRevenue),
      icon: 'revenue',
    },
    {
      id: 'avg',
      label: 'Average Revenue Per Company',
      value: formatMoney(arpu),
      icon: 'subscriptions',
    },
    {
      id: 'status',
      label: 'Status',
      value: 'Completed',
      icon: 'status',
      badge: 'Active',
    },
  ]

  let metrics = baseMetrics
  if (id === 'admin-activity') {
    metrics = [
      { id: 'companies', label: 'Active Admins', value: String(adminCount), icon: 'companies' },
      {
        id: 'revenue',
        label: 'Companies Managed',
        value: String(companyStats.totalCompanies),
        icon: 'revenue',
      },
      {
        id: 'avg',
        label: 'Avg Admins / Company',
        value:
          companyStats.totalCompanies > 0
            ? (adminCount / companyStats.totalCompanies).toFixed(1)
            : '0',
        icon: 'subscriptions',
      },
      {
        id: 'status',
        label: 'Status',
        value: 'Completed',
        icon: 'status',
        badge: 'Active',
      },
    ]
  } else if (id === 'revenue-summary' || id === 'subscription-overview') {
    metrics = [
      {
        id: 'companies',
        label: 'Paying Companies',
        value: String(companyStats.activeCompanies),
        icon: 'companies',
      },
      {
        id: 'revenue',
        label: 'Monthly Revenue',
        value: formatMoney(companyStats.platformRevenue),
        icon: 'revenue',
      },
      {
        id: 'avg',
        label: 'ARPU',
        value: formatMoney(arpu),
        icon: 'subscriptions',
      },
      {
        id: 'status',
        label: 'Status',
        value: 'Completed',
        icon: 'status',
        badge: 'Active',
      },
    ]
  }

  return {
    id,
    title: `${REPORT_META[id].name} (${period})`,
    metrics,
    companies,
    charts,
  }
}

export async function downloadPlatformReport(
  reportId: string,
  format: ExportFormat,
  month?: string,
): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
  const { key } = resolveReportMonth(month)
  const detail = await getPlatformReportDetail(reportId, month)
  const payload = {
    title: detail.title,
    metrics: detail.metrics.map((m) => ({ label: m.label, value: m.value })),
    companies: detail.companies,
  }

  if (format === 'excel') {
    const buffer = await buildPlatformExcel(payload)
    return {
      buffer,
      filename: `platform-${detail.id}-${key}.xlsx`,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }
  }

  if (format === 'pdf') {
    const buffer = await buildPlatformPdf(payload)
    return {
      buffer,
      filename: `platform-${detail.id}-${key}.pdf`,
      contentType: 'application/pdf',
    }
  }

  const buffer = buildPlatformCsv(payload)
  return {
    buffer,
    filename: `platform-${detail.id}-${key}.csv`,
    contentType: 'text/csv; charset=utf-8',
  }
}
