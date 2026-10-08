import type { ReactNode } from 'react'
import type { SuperAdminReportMetric } from '@/features/dashboard/superadmin/reports/model/types'
import {
  StatCheckIcon,
  StatCompaniesIcon,
  StatRevenueIcon,
  StatSubscriptionsIcon,
} from '@/features/dashboard/superadmin/ui/superadminIcons'
import { cn } from '@/shared/lib/cn'

const metricStyles: Record<
  SuperAdminReportMetric['icon'],
  { iconBg: string; iconColor: string; icon: ReactNode }
> = {
  companies: {
    iconBg: 'bg-[#EFF6FF]',
    iconColor: 'text-[#1877F2]',
    icon: <StatCompaniesIcon />,
  },
  revenue: {
    iconBg: 'bg-[#F5F3FF]',
    iconColor: 'text-[#7C3AED]',
    icon: <StatRevenueIcon />,
  },
  subscriptions: {
    iconBg: 'bg-[#FFF7ED]',
    iconColor: 'text-[#F59E0B]',
    icon: <StatSubscriptionsIcon />,
  },
  status: {
    iconBg: 'bg-[#ECFDF5]',
    iconColor: 'text-[#10B981]',
    icon: <StatCheckIcon />,
  },
}

export function SuperAdminReportMetricCard({ metric }: { metric: SuperAdminReportMetric }) {
  const style = metricStyles[metric.icon]

  return (
    <div className="relative flex min-h-[132px] flex-col rounded-xl border border-border-card bg-surface p-5 shadow-[var(--shadow-stat)]">
      {metric.badge && (
        <span className="absolute right-5 top-5 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#00B67A]">
          {metric.badge}
        </span>
      )}
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-lg',
          style.iconBg,
          style.iconColor,
        )}
      >
        {style.icon}
      </span>
      <p className="mt-4 text-sm font-medium text-text-muted">{metric.label}</p>
      <p className="mt-1 text-2xl font-bold leading-8 text-heading">{metric.value}</p>
    </div>
  )
}
