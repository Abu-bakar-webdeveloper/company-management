import type { ActivityItem } from '@/features/dashboard/ui/RecentActivities'
import { mockCompanies } from '@/features/platform/model/companiesData'

export type { CompanyPlan, CompanyStatus } from '@/features/platform/model/types'
export { planDotColors, planLabels } from '@/features/platform/model/companiesData'

export type SuperAdminStatIcon = 'companies' | 'users' | 'subscriptions' | 'revenue'

export type SuperAdminStatCardData = {
  id: string
  label: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: SuperAdminStatIcon
}

export const superAdminStatCards: SuperAdminStatCardData[] = [
  {
    id: 'companies',
    label: 'Total Companies',
    value: '120',
    change: '+12%',
    trend: 'up',
    icon: 'companies',
  },
  {
    id: 'users',
    label: 'Total Users',
    value: '45',
    change: '+5.2%',
    trend: 'up',
    icon: 'users',
  },
  {
    id: 'subscriptions',
    label: 'Active Subscriptions',
    value: '15',
    change: '-2.4%',
    trend: 'down',
    icon: 'subscriptions',
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

export const companyGrowthData = [
  { month: 'Jan', newCompanies: 22, totalUsers: 520 },
  { month: 'Feb', newCompanies: 28, totalUsers: 610 },
  { month: 'Mar', newCompanies: 35, totalUsers: 720 },
  { month: 'Apr', newCompanies: 30, totalUsers: 800 },
  { month: 'May', newCompanies: 38, totalUsers: 920 },
  { month: 'Jun', newCompanies: 32, totalUsers: 980 },
]

export const revenuePlanData = [
  { name: 'Pro', value: 42, color: '#1877f2' },
  { name: 'Basic', value: 33, color: '#00b67a' },
  { name: 'Enterprise', value: 25, color: '#9333ea' },
]

export type RecentCompanyRow = (typeof mockCompanies)[number]

export const recentCompanies = mockCompanies.slice(0, 3)

export const recentActivities: ActivityItem[] = [
  {
    id: '1',
    title: 'New employee onboarded',
    description: 'Sarah Khan joined Design Team',
    time: '2 hours ago',
    icon: 'user',
  },
  {
    id: '2',
    title: "Project 'Taalam' Completed",
    description: 'Delivered ahead of schedule',
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
