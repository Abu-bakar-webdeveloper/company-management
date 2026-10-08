import type { ReactNode } from 'react'
import {
  employeeStatCardConfigs,
  type EmployeeStatCardConfig,
} from '@/features/dashboard/employee/model/employeeDashboardData'
import {
  StatLeaveIcon,
  StatPerformanceIcon,
  StatProjectsIcon,
  StatTasksIcon,
} from '@/features/dashboard/employee/ui/employeeIcons'

const iconMap: Record<EmployeeStatCardConfig['icon'], () => ReactNode> = {
  tasks: () => <StatTasksIcon />,
  projects: () => <StatProjectsIcon />,
  leave: () => <StatLeaveIcon />,
  performance: () => <StatPerformanceIcon />,
}

export type EmployeeSummaryStatCardData = EmployeeStatCardConfig & {
  iconNode: ReactNode
}

export function getEmployeeStatCards(): EmployeeSummaryStatCardData[] {
  return employeeStatCardConfigs.map((card) => ({
    ...card,
    iconNode: iconMap[card.icon](),
  }))
}
