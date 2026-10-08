import type { ActivityItem } from '@/features/dashboard/ui/RecentActivities'
import type { PlatformStatCardData } from '@/features/platform/model/companiesData'
import type {
  Subscription,
  SubscriptionDetail,
  SubscriptionPlanTier,
} from '@/features/platform/model/types'
import { getCompanyDetail } from '@/features/platform/model/companyDetailData'

export const subscriptionsPageStatCards: PlatformStatCardData[] = [
  {
    id: 'active',
    label: 'Active Subscriptions',
    value: '120',
    change: '+12%',
    trend: 'up',
    icon: 'check',
    footer: 'Currently Active',
    footerColor: 'text-[#10B981]',
  },
  {
    id: 'expiring',
    label: 'Expiring Soon',
    value: '45',
    change: '-2.4%',
    trend: 'down',
    icon: 'clock',
    footer: 'Next 30 Days',
    footerColor: 'text-[#EF4444]',
    trendColor: 'text-[#EF4444]',
  },
  {
    id: 'suspended',
    label: 'Suspended Accounts',
    value: '15',
    change: '-2.4%',
    trend: 'down',
    icon: 'warning',
    trendColor: 'text-[#F59E0B]',
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

export const subscriptionPlans: SubscriptionPlanTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    subtitle: 'Best for personal use',
    price: '$8',
    pricePeriod: '/month',
    featureHeader: 'All free features, plus:',
    borderColor: 'border-t-[#00b67a]',
    features: [
      '2 Admin Users',
      '50 Customers',
      'Marketplace Access',
      'Calendar Integration',
      'Progress Tracking',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    subtitle: 'Best for personal use',
    price: '$16',
    pricePeriod: '/month',
    featureHeader: 'All starter features, plus:',
    borderColor: 'border-t-[#1877f2]',
    popular: true,
    features: [
      '5 Admin Users',
      '250 Customers',
      'Document Management',
      'Agile Methodology Support',
      'Issue Tracking',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    subtitle: 'Best for personal use',
    price: 'Custom',
    featureHeader: 'All business features, plus:',
    borderColor: 'border-t-[#9333ea]',
    features: [
      'SSO',
      'All integrations',
      'Client Collaboration with 2FA',
      'Advanced Project Planning',
      'Mobile App Integration',
    ],
  },
]

export const mockSubscriptions: Subscription[] = [
  { id: '1', companyId: '1', companyName: 'Tec system', plan: 'pro', users: 48, adminLimit: 5, expiryDate: 'Dec 15, 2026', status: 'trial', rating: 5, actionVariant: 'view' },
  { id: '2', companyId: '2', companyName: 'NovaSoft', plan: 'basic', users: 12, adminLimit: 3, expiryDate: 'Jan 20, 2026', status: 'active', rating: 4, actionVariant: 'edit' },
  { id: '3', companyId: '3', companyName: 'CloudNine Inc', plan: 'enterprise', users: 95, adminLimit: 10, expiryDate: 'Mar 8, 2026', status: 'inactive', rating: 3, actionVariant: 'reactivate' },
  { id: '4', companyId: '4', companyName: 'PixelWorks', plan: 'pro', users: 32, adminLimit: 5, expiryDate: 'Apr 2, 2026', status: 'active', rating: 5, actionVariant: 'suspend' },
  { id: '5', companyId: '5', companyName: 'DataStream', plan: 'basic', users: 18, adminLimit: 3, expiryDate: 'May 11, 2026', status: 'trial', rating: 4, actionVariant: 'edit' },
  { id: '6', companyId: '6', companyName: 'GreenLeaf Co', plan: 'enterprise', users: 67, adminLimit: 10, expiryDate: 'Jun 30, 2026', status: 'active', rating: 5, actionVariant: 'view' },
  { id: '7', companyId: '7', companyName: 'Apex Solutions', plan: 'pro', users: 41, adminLimit: 5, expiryDate: 'Jul 14, 2026', status: 'active', rating: 4, actionVariant: 'edit' },
  { id: '8', companyId: '8', companyName: 'BrightPath', plan: 'basic', users: 14, adminLimit: 3, expiryDate: 'Aug 5, 2026', status: 'inactive', rating: 2, actionVariant: 'reactivate' },
  { id: '9', companyId: '9', companyName: 'Summit Labs', plan: 'pro', users: 22, adminLimit: 5, expiryDate: 'Sep 12, 2026', status: 'inactive', rating: 2, actionVariant: 'reactivate' },
  { id: '10', companyId: '10', companyName: 'Horizon Tech', plan: 'basic', users: 14, adminLimit: 3, expiryDate: 'Oct 3, 2026', status: 'active', rating: 4, actionVariant: 'view' },
  { id: '11', companyId: '11', companyName: 'Velocity AI', plan: 'pro', users: 38, adminLimit: 5, expiryDate: 'Nov 18, 2026', status: 'active', rating: 5, actionVariant: 'edit' },
  { id: '12', companyId: '12', companyName: 'NorthStar', plan: 'enterprise', users: 88, adminLimit: 10, expiryDate: 'Dec 1, 2026', status: 'trial', rating: 4, actionVariant: 'view' },
  { id: '13', companyId: '13', companyName: 'BlueOcean', plan: 'basic', users: 10, adminLimit: 3, expiryDate: 'Jan 8, 2027', status: 'active', rating: 3, actionVariant: 'view' },
  { id: '14', companyId: '14', companyName: 'CraftStudio', plan: 'pro', users: 29, adminLimit: 5, expiryDate: 'Feb 22, 2027', status: 'inactive', rating: 2, actionVariant: 'reactivate' },
  { id: '15', companyId: '15', companyName: 'Zenith Corp', plan: 'enterprise', users: 72, adminLimit: 10, expiryDate: 'Mar 15, 2027', status: 'active', rating: 5, actionVariant: 'edit' },
  { id: '16', companyId: '16', companyName: 'SwiftLogix', plan: 'basic', users: 16, adminLimit: 3, expiryDate: 'Apr 9, 2027', status: 'trial', rating: 4, actionVariant: 'view' },
  { id: '17', companyId: '17', companyName: 'PrimeEdge', plan: 'pro', users: 44, adminLimit: 5, expiryDate: 'May 27, 2027', status: 'active', rating: 5, actionVariant: 'edit' },
  { id: '18', companyId: '18', companyName: 'LumenWorks', plan: 'basic', users: 11, adminLimit: 3, expiryDate: 'Jun 14, 2027', status: 'active', rating: 3, actionVariant: 'view' },
  { id: '19', companyId: '19', companyName: 'Orbit Systems', plan: 'enterprise', users: 91, adminLimit: 10, expiryDate: 'Jul 30, 2027', status: 'active', rating: 4, actionVariant: 'edit' },
  { id: '20', companyId: '20', companyName: 'Pulse Digital', plan: 'pro', users: 35, adminLimit: 5, expiryDate: 'Aug 19, 2027', status: 'trial', rating: 4, actionVariant: 'view' },
  { id: '21', companyId: '21', companyName: 'CoreBridge', plan: 'basic', users: 9, adminLimit: 3, expiryDate: 'Sep 5, 2027', status: 'inactive', rating: 2, actionVariant: 'reactivate' },
  { id: '22', companyId: '22', companyName: 'Skyline Group', plan: 'pro', users: 47, adminLimit: 5, expiryDate: 'Oct 11, 2027', status: 'active', rating: 5, actionVariant: 'edit' },
  { id: '23', companyId: '23', companyName: 'Vertex Labs', plan: 'enterprise', users: 78, adminLimit: 10, expiryDate: 'Nov 24, 2027', status: 'active', rating: 4, actionVariant: 'view' },
  { id: '24', companyId: '24', companyName: 'TechCorp Ltd', plan: 'pro', users: 48, adminLimit: 5, expiryDate: 'Dec 15, 2027', status: 'trial', rating: 5, actionVariant: 'suspend' },
]

export const subscriptionsPlatformActivities: ActivityItem[] = [
  {
    id: '1',
    title: 'ATL Motors renewed Business Plan',
    description: 'ATL Motors joined Bizzflow',
    time: '2 hours ago',
    icon: 'user',
  },
  {
    id: '2',
    title: 'Car Hub upgraded to Enterprise',
    description: 'Plan Changed to Enterprise',
    time: '5 hours ago',
    icon: 'check',
  },
  {
    id: '3',
    title: 'Server Maintenance',
    description: 'Scheduled for Sunday night',
    time: 'Yesterday',
    icon: 'warning',
  },
]

export function getSubscriptionDetail(id: string): SubscriptionDetail | undefined {
  const sub = mockSubscriptions.find((s) => s.id === id)
  const company = getCompanyDetail(sub?.companyId ?? '1')
  if (!company || !sub) return undefined

  return {
    ...company,
    id: sub.id,
    expiryDate: sub.expiryDate,
    adminUsers: 3,
    adminLimit: sub?.adminLimit ?? 5,
    customers: 187,
    customerLimit: 250,
    storageUsed: '45GB',
    storageLimit: '100GB',
    billingInvoice: '120$',
    billingDate: 'April 11, 2026',
    billingStatus: 'active',
  }
}
