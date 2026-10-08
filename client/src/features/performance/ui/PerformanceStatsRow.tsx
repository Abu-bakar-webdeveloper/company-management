import type { PerformanceStats } from '@/features/performance/model/types'
import {
  ClipboardIcon,
  MedalIcon,
  StarIcon,
  WarningIcon,
} from '@/features/performance/ui/icons'
import { cn } from '@/shared/lib/cn'

const configs = [
  {
    key: 'avgRating' as const,
    label: 'AVG Rating',
    icon: StarIcon,
    iconBg: 'bg-warning-muted',
    iconColor: 'text-warning',
    border: 'border-warning-muted',
    format: (s: PerformanceStats) =>
      s.avgScore != null && s.avgScore > 0 ? `${s.avgScore} KPI` : `${s.avgRating} Stars`,
    badge: (s: PerformanceStats) =>
      `${s.avgRatingChange > 0 ? '+' : ''}${s.avgRatingChange}%`,
    badgeClass: (s: PerformanceStats) =>
      s.avgRatingChange >= 0 ? 'bg-success-muted text-success' : 'bg-[#FEF2F2] text-[#DC2626]',
  },
  { 
    key: 'topPerformer' as const,
    label: 'Top Performer',
    icon: MedalIcon,
    iconBg: 'bg-[#F5F3FF]',
    iconColor: 'text-[#7C3AED]',
    border: 'border-[#7C3AED33]',
    format: (s: PerformanceStats) => s.topPerformer,
    badge: () => 'MVP',
    badgeClass: () => 'bg-[#F5F3FF] text-[#7C3AED]',
  },
  {
    key: 'reviewsDue' as const,
    label: 'Reviews Due',
    icon: ClipboardIcon,
    iconBg: 'bg-[#EFF6FF]',
    iconColor: 'text-primary',
    border: 'border-primary-muted',
    format: (s: PerformanceStats) => String(s.reviewsDue).padStart(2, '0'),
    badge: () => 'Urgent',
    badgeClass: () => 'bg-[#FFFBEB] text-[#F59E0B]',
  },
  {
    key: 'lowPerformance' as const,
    label: 'Low Performance',
    icon: WarningIcon,
    iconBg: 'bg-[#FEF2F2]',
    iconColor: 'text-[#DC2626]',
    border: 'border-[#DC262633]',
    format: (s: PerformanceStats) => String(s.lowPerformance).padStart(2, '0'),
    badge: () => 'Critical',
    badgeClass: () => 'bg-[#F1F5F9] text-[#64748B]',
  },
]

export function PerformanceStatsRow({ stats }: { stats: PerformanceStats }) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {configs.map(({ label, icon: Icon, iconBg, iconColor, border, format, badge, badgeClass }) => (
        <div key={label} className={cn('rounded-xl border bg-surface p-[25px]', border)}>
          <div className="flex items-start justify-between">
            <div className={cn('flex size-10 items-center justify-center rounded-lg', iconBg, iconColor)}>
              <Icon />
            </div>
            <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', badgeClass(stats))}>
              {badge(stats)}
            </span>
          </div>
          <p className="mt-4 text-sm leading-5 text-text-muted">{label}</p>
          <p className="mt-1 text-[24px] font-bold leading-8 text-heading">{format(stats)}</p>
        </div>
      ))}
    </div>
  )
}
