import type { StatCardData } from '@/features/dashboard/admin/model/dashboardData'
import {
  StatEmployeesIcon,
  StatExpensesIcon,
  StatLeaveIcon,
  StatProjectsIcon,
  TrendDownIcon,
  TrendUpIcon,
} from '@/features/dashboard/ui/icons'
import { cn } from '@/shared/lib/cn'

const cardStyles: Record<
  StatCardData['icon'],
  { border: string; iconBg: string; iconColor: string }
> = {
  employees: {
    border: 'border-[#136DEC33]',
    iconBg: 'bg-[#EFF6FF]',
    iconColor: 'text-[#136DEC]',
  },
  projects: {
    border: 'border-[#7C3AED33]',
    iconBg: 'bg-[#F5F3FF]',
    iconColor: 'text-[#7C3AED]',
  },
  leave: {
    border: 'border-[#FF5C0033]',
    iconBg: 'bg-[#FFF7ED]',
    iconColor: 'text-[#FF5C00]',
  },
  expenses: {
    border: 'border-[#00B67A33]',
    iconBg: 'bg-[#ECFDF5]',
    iconColor: 'text-[#00B67A]',
  },
}

const statIcons: Record<StatCardData['icon'], typeof StatEmployeesIcon> = {
  employees: StatEmployeesIcon,
  projects: StatProjectsIcon,
  leave: StatLeaveIcon,
  expenses: StatExpensesIcon,
}

export function StatCard({ data }: { data: StatCardData }) {
  const isUp = data.trend === 'up'
  const styles = cardStyles[data.icon]
  const Icon = statIcons[data.icon]

  return (
    <div
      className={cn(
        'rounded-xl border bg-surface p-[25px]',
        styles.border,
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'flex size-10 items-center justify-center rounded-lg',
            styles.iconBg,
            styles.iconColor,
          )}
        >
          <Icon />
        </div>
        <div className="flex items-center gap-1 text-sm font-normal">
          <span className={isUp ? 'text-[#2EC291]' : 'text-[#FF5C00]'}>{data.change}</span>
          {isUp ? <TrendUpIcon /> : <TrendDownIcon />}
        </div>
      </div>
      <p className="mt-4 text-sm leading-5 font-medium text-text-muted">{data.label}</p>
      <p className="mt-1 text-[24px] font-bold leading-8 text-heading">{data.value}</p>
    </div>
  )
}
