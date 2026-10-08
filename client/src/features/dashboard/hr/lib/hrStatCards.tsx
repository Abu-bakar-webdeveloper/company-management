import type { ReactNode } from 'react'
import {
  hrStatCardConfigs,
  type HrStatCardConfig,
} from '@/features/dashboard/hr/model/hrDashboardData'
import {
  StatLeaveIcon,
  StatPerformanceIcon,
  StatProjectsIcon,
} from '@/features/dashboard/employee/ui/employeeIcons'
import { StatEmployeesIcon } from '@/features/dashboard/ui/icons'

const iconMap: Record<HrStatCardConfig['icon'], () => ReactNode> = {
  employees: () => <StatEmployeesIcon />,
  onLeave: () => <StatProjectsIcon />,
  pendingLeave: () => <StatLeaveIcon />,
  payroll: () => <StatPerformanceIcon />,
}

export type HrSummaryStatCardData = HrStatCardConfig & {
  iconNode: ReactNode
}

export function getHrStatCards(): HrSummaryStatCardData[] {
  return hrStatCardConfigs.map((card) => ({
    ...card,
    iconNode: iconMap[card.icon](),
  }))
}
