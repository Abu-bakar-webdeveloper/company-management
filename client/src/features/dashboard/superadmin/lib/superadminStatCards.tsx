import type { PlatformStatCardData } from '@/features/platform/model/companiesData'
import {
  StatCheckIcon,
  StatClockIcon,
  StatCompaniesIcon,
  StatPlatformUsersIcon,
  StatRevenueIcon,
  StatSubscriptionsIcon,
  StatWarningIcon,
} from '@/features/dashboard/superadmin/ui/superadminIcons'
import type { DashboardStatCardData } from '@/features/dashboard/ui/DashboardStatCard'

const statStyles: Record<
  PlatformStatCardData['icon'],
  Pick<DashboardStatCardData, 'iconBg' | 'iconColor'>
> = {
  companies: {
    iconBg: 'bg-[#EFF6FF]',
    iconColor: 'text-[#3B82F6]',
  },
  users: {
    iconBg: 'bg-[#F5F3FF]',
    iconColor: 'text-[#7C3AED]',
  },
  subscriptions: {
    iconBg: 'bg-[#FFF7ED]',
    iconColor: 'text-[#F59E0B]',
  },
  revenue: {
    iconBg: 'bg-[#ECFDF5]',
    iconColor: 'text-[#10B981]',
  },
  check: {
    iconBg: 'bg-[#EFF6FF]',
    iconColor: 'text-[#3B82F6]',
  },
  clock: {
    iconBg: 'bg-[#FEF2F2]',
    iconColor: 'text-[#EF4444]',
  },
  warning: {
    iconBg: 'bg-[#FFF7ED]',
    iconColor: 'text-[#F59E0B]',
  },
}

const statIcons = {
  companies: StatCompaniesIcon,
  users: StatPlatformUsersIcon,
  subscriptions: StatSubscriptionsIcon,
  revenue: StatRevenueIcon,
  check: StatCheckIcon,
  clock: StatClockIcon,
  warning: StatWarningIcon,
}

export function toSuperAdminStatCards(cards: PlatformStatCardData[]): DashboardStatCardData[] {
  return cards.map((card) => {
    const styles = statStyles[card.icon]
    const Icon = statIcons[card.icon]
    return {
      ...card,
      ...styles,
      icon: <Icon />,
    }
  })
}
