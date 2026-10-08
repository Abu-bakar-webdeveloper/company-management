import type { ReactNode } from 'react'
import type { AnalyticsStats } from '@/features/performance/model/types'
import { CheckIcon, ClipboardIcon, MedalIcon, StarIcon } from '@/features/performance/ui/icons'
import { StarRating } from '@/features/performance/ui/StarRating'
import { cn } from '@/shared/lib/cn'

const reviewerAvatars = [
  'https://i.pravatar.cc/64?img=12',
  'https://i.pravatar.cc/64?img=11',
  'https://i.pravatar.cc/64?img=5',
]

function PillBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[#E7F8F2] px-2.5 py-1 text-xs font-bold text-[#00B67A]">
      {children}
    </span>
  )
}

function AvatarStack() {
  return (
    <div className="flex items-center -space-x-2">
      {reviewerAvatars.map((src) => (
        <img
          key={src}
          src={src}
          alt=""
          className="size-7 rounded-full border-2 border-surface object-cover"
        />
      ))}
      <span className="flex size-7 items-center justify-center rounded-full border-2 border-surface bg-[#1E293B] text-[10px] font-bold text-white">
        +12
      </span>
    </div>
  )
}

type CardConfig = {
  label: string
  labelNote?: (s: AnalyticsStats) => string
  icon: (props: { className?: string }) => ReactNode
  iconBg: string
  border: string
  topRight?: (s: AnalyticsStats) => ReactNode
  value: (s: AnalyticsStats) => string
  valueSuffix?: (s: AnalyticsStats) => ReactNode
}

const configs: CardConfig[] = [
  {
    label: 'Overall Efficiency',
    icon: ClipboardIcon,
    iconBg: 'bg-[#EFF6FF]',
    border: 'border-primary-muted',
    topRight: (s) => <PillBadge>+{s.efficiencyChange}%</PillBadge>,
    value: (s) => `${s.overallEfficiency}%`,
  },
  {
    label: 'Review Completion',
    icon: CheckIcon,
    iconBg: 'bg-[#F5F3FF] text-[#9333EA]',
    border: 'border-[#7C3AED33]',
    topRight: () => <AvatarStack />,
    value: (s) => `${s.reviewCompletion}%`,
    valueSuffix: () => (
      <span className="text-sm font-semibold text-text-muted">Target 100%</span>
    ),
  },
  {
    label: 'AVG Rating',
    labelNote: () => '(Based on 142 peer reviews)',
    icon: StarIcon,
    iconBg: 'bg-[#FFFBEB]',
    border: 'border-[#FEF3C7]',
    value: (s) => `${s.avgRating}/5`,
    valueSuffix: (s) => <StarRating rating={s.avgRating} size="sm" />,
  },
  {
    label: 'Top Department',
    labelNote: () => '(Leading for 3 consecutive months)',
    icon: MedalIcon,
    iconBg: 'bg-[#FFF7ED] text-[#EA580C]',
    border: 'border-[#FFEDD5]',
    topRight: (s) => <PillBadge>{s.topDepartmentEfficiency}% EFF</PillBadge>,
    value: (s) => s.topDepartment,
  },
]

export function AnalyticsStatsRow({ stats }: { stats: AnalyticsStats }) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {configs.map(({ label, labelNote, icon: Icon, iconBg, border, topRight, value, valueSuffix }) => (
        <div key={label} className={cn('rounded-xl border bg-surface p-5 sm:p-6', border)}>
          <div className="flex items-start justify-between gap-2">
            <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', iconBg)}>
              <Icon className="size-5" />
            </div>
            {topRight?.(stats)}
          </div>
          <div className="mt-4">
            <p className="text-sm text-text-muted">
              {label}
            </p>
              {labelNote && (
                <span className=" text-[10px] leading-none text-text-muted/80">
                  {labelNote(stats)}
                </span>
              )}
            <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <p className="text-[26px] font-bold leading-8 text-heading sm:text-[28px]">
                {value(stats)}
              </p>
              {valueSuffix?.(stats)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
