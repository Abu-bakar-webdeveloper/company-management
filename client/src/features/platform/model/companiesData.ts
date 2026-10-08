import type { Company } from '@/features/platform/model/types'

export type PlatformStatIcon =
  | 'companies'
  | 'users'
  | 'subscriptions'
  | 'revenue'
  | 'check'
  | 'clock'
  | 'warning'

export type PlatformStatCardData = {
  id: string
  label: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: PlatformStatIcon
  footer?: string
  footerColor?: string
  trendColor?: string
}

export const planLabels = {
  pro: 'Pro',
  basic: 'Basic',
  enterprise: 'Enterprise',
} as const

export const planDotColors = {
  pro: 'bg-[#1877f2]',
  basic: 'bg-[#00b67a]',
  enterprise: 'bg-[#9333ea]',
} as const

export const statusLabels = {
  trial: 'TRIAL',
  active: 'ACTIVE',
  inactive: 'INACTIVE',
} as const

export const companiesPageStatCards: PlatformStatCardData[] = [
  {
    id: 'companies',
    label: 'Total Companies',
    value: '120',
    change: '+12%',
    trend: 'up',
    icon: 'companies',
  },
  {
    id: 'active',
    label: 'Active Companies',
    value: '45',
    change: '+5.2%',
    trend: 'up',
    icon: 'users',
  },
  {
    id: 'users',
    label: 'Total Users',
    value: '0',
    change: '—',
    trend: 'up',
    icon: 'users',
  },
  {
    id: 'revenue',
    label: 'Platform Revenue',
    value: '$45,200',
    change: '+8.1%',
    trend: 'up',
    icon: 'revenue',
  },
]

export const mockCompanies: Company[] = [
  { id: '1', name: 'TechCorp Ltd', plan: 'pro', users: 48, userLimit: 50, status: 'trial', rating: 5, actionVariant: 'view' },
  { id: '2', name: 'NovaSoft', plan: 'basic', users: 12, userLimit: 25, status: 'active', rating: 4, actionVariant: 'edit' },
  { id: '3', name: 'NovaSoft', plan: 'enterprise', users: 12, userLimit: 100, status: 'inactive', rating: 3, actionVariant: 'reactivate' },
  { id: '4', name: 'CloudNine Inc', plan: 'pro', users: 32, userLimit: 50, status: 'active', rating: 5, actionVariant: 'view' },
  { id: '5', name: 'PixelWorks', plan: 'basic', users: 8, userLimit: 15, status: 'trial', rating: 4, actionVariant: 'edit' },
  { id: '6', name: 'DataStream', plan: 'enterprise', users: 95, userLimit: 100, status: 'active', rating: 5, actionVariant: 'view' },
  { id: '7', name: 'GreenLeaf Co', plan: 'basic', users: 18, userLimit: 25, status: 'active', rating: 3, actionVariant: 'edit' },
  { id: '8', name: 'Apex Solutions', plan: 'pro', users: 41, userLimit: 50, status: 'trial', rating: 4, actionVariant: 'view' },
  { id: '9', name: 'BrightPath', plan: 'enterprise', users: 67, userLimit: 100, status: 'active', rating: 5, actionVariant: 'edit' },
  { id: '10', name: 'Summit Labs', plan: 'pro', users: 22, userLimit: 50, status: 'inactive', rating: 2, actionVariant: 'reactivate' },
  { id: '11', name: 'Horizon Tech', plan: 'basic', users: 14, userLimit: 25, status: 'active', rating: 4, actionVariant: 'view' },
  { id: '12', name: 'Velocity AI', plan: 'pro', users: 38, userLimit: 50, status: 'active', rating: 5, actionVariant: 'edit' },
  { id: '13', name: 'NorthStar', plan: 'enterprise', users: 88, userLimit: 100, status: 'trial', rating: 4, actionVariant: 'view' },
  { id: '14', name: 'BlueOcean', plan: 'basic', users: 10, userLimit: 15, status: 'active', rating: 3, actionVariant: 'view' },
  { id: '15', name: 'CraftStudio', plan: 'pro', users: 29, userLimit: 50, status: 'inactive', rating: 2, actionVariant: 'reactivate' },
  { id: '16', name: 'Zenith Corp', plan: 'enterprise', users: 72, userLimit: 100, status: 'active', rating: 5, actionVariant: 'edit' },
  { id: '17', name: 'SwiftLogix', plan: 'basic', users: 16, userLimit: 25, status: 'trial', rating: 4, actionVariant: 'view' },
  { id: '18', name: 'PrimeEdge', plan: 'pro', users: 44, userLimit: 50, status: 'active', rating: 5, actionVariant: 'edit' },
  { id: '19', name: 'LumenWorks', plan: 'basic', users: 11, userLimit: 15, status: 'active', rating: 3, actionVariant: 'view' },
  { id: '20', name: 'Orbit Systems', plan: 'enterprise', users: 91, userLimit: 100, status: 'active', rating: 4, actionVariant: 'edit' },
  { id: '21', name: 'Pulse Digital', plan: 'pro', users: 35, userLimit: 50, status: 'trial', rating: 4, actionVariant: 'view' },
  { id: '22', name: 'CoreBridge', plan: 'basic', users: 9, userLimit: 15, status: 'inactive', rating: 2, actionVariant: 'reactivate' },
  { id: '23', name: 'Skyline Group', plan: 'pro', users: 47, userLimit: 50, status: 'active', rating: 5, actionVariant: 'edit' },
  { id: '24', name: 'Vertex Labs', plan: 'enterprise', users: 78, userLimit: 100, status: 'active', rating: 4, actionVariant: 'view' },
]
