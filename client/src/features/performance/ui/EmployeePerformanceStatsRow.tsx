import type { MyPerformance, PerformanceStatus } from '@/features/performance/model/contracts'
import {
  ClipboardIcon,
  LightningBoltIcon,
  MedalIcon,
  StarIcon,
} from '@/features/performance/ui/icons'
import { cn } from '@/shared/lib/cn'

const statusBadge: Record<PerformanceStatus, string> = {
  excellent: 'bg-[#ECFDF5] text-[#00B67A]',
  needs_improvement: 'bg-[#FFF7ED] text-[#FF9F43]',
  poor: 'bg-[#FEF2F2] text-[#DC2626]',
  good: 'bg-[#EFF6FF] text-[#1877F2]',
  average: 'bg-[#FFF7ED] text-[#FF9F43]',
  critical: 'bg-[#FEF2F2] text-[#DC2626]',
}

function formatTrend(value: number): string {
  if (value === 0) return '0%'
  return `${value > 0 ? '+' : ''}${value}%`
}

export function EmployeePerformanceStatsRow({ data }: { data: MyPerformance }) {
  const isManager = data.subjectRole === 'manager'
  const cards = [
    {
      label: 'KPI Score',
      value:
        data.currentMonthScore != null
          ? `${data.currentMonthScore}`
          : data.avgScore != null
            ? `${data.avgScore}`
            : data.avgRating != null
              ? `${data.avgRating}★`
              : '—',
      icon: StarIcon,
      iconBg: 'bg-warning-muted',
      iconColor: 'text-warning',
      border: 'border-warning-muted',
      badge: formatTrend(data.avgRatingChange),
      badgeClass:
        data.avgRatingChange >= 0
          ? 'bg-success-muted text-success'
          : 'bg-[#FEF2F2] text-[#DC2626]',
    },
    {
      label: isManager ? 'Projects Completed' : 'Tasks Completed',
      value: isManager
        ? `${data.projectsCompleted}/${data.projectsTotal || 0}`
        : String(data.tasksCompleted),
      icon: MedalIcon,
      iconBg: 'bg-[#F5F3FF]',
      iconColor: 'text-[#7C3AED]',
      border: 'border-[#7C3AED33]',
      badge: isManager ? 'Delivery' : 'MVP',
      badgeClass: 'bg-[#F5F3FF] text-[#7C3AED]',
    },
    {
      label: 'Current Month Rating',
      value: data.currentMonthRating != null ? String(data.currentMonthRating) : '—',
      icon: ClipboardIcon,
      iconBg: 'bg-[#EFF6FF]',
      iconColor: 'text-primary',
      border: 'border-primary-muted',
      badge: data.periodLabel,
      badgeClass: 'bg-[#EFF6FF] text-primary',
    },
    {
      label: 'Efficiency Score',
      value: `${data.efficiency}%`,
      icon: LightningBoltIcon,
      iconBg: 'bg-[#ECFDF5]',
      iconColor: 'text-[#00B67A]',
      border: 'border-[#00B67A33]',
      badge: data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'N/A',
      badgeClass: data.status ? statusBadge[data.status] : 'bg-[#F1F5F9] text-[#64748B]',
    },
  ]

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, iconBg, iconColor, border, badge, badgeClass }) => (
        <div key={label} className={cn('rounded-xl border bg-surface p-[25px]', border)}>
          <div className="flex items-start justify-between">
            <div
              className={cn('flex size-10 items-center justify-center rounded-lg', iconBg, iconColor)}
            >
              <Icon />
            </div>
            <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold capitalize', badgeClass)}>
              {badge}
            </span>
          </div>
          <p className="mt-4 text-sm leading-5 text-text-muted">{label}</p>
          <p className="mt-1 text-[24px] font-bold leading-8 text-heading">{value}</p>
        </div>
      ))}
    </div>
  )
}
