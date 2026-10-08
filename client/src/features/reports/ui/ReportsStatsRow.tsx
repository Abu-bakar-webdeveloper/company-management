import type { ReactElement } from 'react'
import { useAuth } from '@/features/auth/model/AuthContext'
import { isCompanyHubEnabled, type CompanyHub } from '@/features/auth/model/companyHubs'
import type { ReportsOverviewStats } from '@/features/reports/model/types'
import {
  ReportEmployeeIcon,
  ReportLeavesIcon,
  ReportProjectsIcon,
  ReportTeamsIcon,
} from '@/features/reports/ui/reportStatIcons'
import { cn } from '@/shared/lib/cn'

type StatConfig = {
  label: string
  hub: CompanyHub
  icon: (props: { className?: string }) => ReactElement
  iconBg: string
  border: string
  value: (stats: ReportsOverviewStats) => string
}

const configs: StatConfig[] = [
  {
    label: 'Employee',
    hub: 'people',
    icon: ReportEmployeeIcon,
    iconBg: 'bg-[#EFF6FF]',
    border: 'border-[#136DEC33]',
    value: (s) => String(s.employees),
  },
  {
    label: 'Projects',
    hub: 'work',
    icon: ReportProjectsIcon,
    iconBg: 'bg-[#F5F3FF]',
    border: 'border-[#7C3AED33]',
    value: (s) => String(s.projects),
  },
  {
    label: 'Leaves',
    hub: 'people',
    icon: ReportLeavesIcon,
    iconBg: 'bg-[#FFF7ED]',
    border: 'border-[#FF5C0033]',
    value: (s) => String(s.leaves),
  },
  {
    label: 'Teams',
    hub: 'people',
    icon: ReportTeamsIcon,
    iconBg: 'bg-[#FAF5FF]',
    border: 'border-[#DB277733]',
    value: (s) => String(s.teams),
  },
]

export function ReportsStatsRow({ stats }: { stats: ReportsOverviewStats }) {
  const { user } = useAuth()
  const visible = configs.filter((config) => isCompanyHubEnabled(user?.enabledHubs, config.hub))

  if (visible.length === 0) return null

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {visible.map(({ label, icon: Icon, iconBg, border, value }) => (
        <div key={label} className={cn('rounded-xl border bg-surface p-[25px]', border)}>
          <div className={cn('flex size-10 items-center justify-center rounded-lg', iconBg)}>
            <Icon className="size-5" />
          </div>
          <p className="mt-4 text-sm font-medium leading-5 text-text-muted">{label}</p>
          <p className="mt-1 text-[24px] font-bold leading-8 text-heading">{value(stats)}</p>
        </div>
      ))}
    </div>
  )
}
