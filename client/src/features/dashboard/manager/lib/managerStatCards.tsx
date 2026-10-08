import { managerStatCardConfigs } from '@/features/dashboard/manager/model/managerDashboardData'
import {
  StatEmployeesIcon,
  StatExpensesIcon,
  StatLeaveIcon,
  StatProjectsIcon,
} from '@/features/dashboard/ui/icons'
import type { MetricStatCardData } from '@/features/dashboard/ui/MetricStatCard'

const iconMap = {
  employees: StatEmployeesIcon,
  projects: StatProjectsIcon,
  leave: StatLeaveIcon,
  performance: StatExpensesIcon,
}

export function getManagerStatCards(): MetricStatCardData[] {
  return managerStatCardConfigs.map((card) => {
    const Icon = iconMap[card.icon]
    return {
      ...card,
      icon: <Icon />,
    }
  })
}
