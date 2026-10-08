import type { ReactNode } from 'react'
import type { PerformanceRecord, PerformanceStats } from '@/features/performance/model/types'
import { primaryScoreLabel } from '@/features/performance/lib/performance-utils'
import {
  ClipboardIcon,
  MedalIcon,
  StarIcon,
  WarningIcon,
} from '@/features/performance/ui/icons'
import { cn } from '@/shared/lib/cn'

type AdminCompanyHubStatsProps = {
  stats: PerformanceStats
  records: PerformanceRecord[]
}

type HubCard = {
  label: string
  value: string
  hint: string
  hintClass?: string
  icon: (props: { className?: string }) => ReactNode
  iconBg: string
  border: string
}

export function AdminCompanyHubStats({ stats, records }: AdminCompanyHubStatsProps) {
  const topPerson = [...records]
    .filter((r) => r.rating != null || r.finalAdjustedScore != null)
    .sort(
      (a, b) =>
        (b.finalAdjustedScore ?? (b.rating ?? 0) * 20) -
        (a.finalAdjustedScore ?? (a.rating ?? 0) * 20),
    )[0]

  const excellentCount = records.filter(
    (r) =>
      r.status === 'excellent' ||
      r.performanceLevel === 'excellent' ||
      (r.finalAdjustedScore != null && r.finalAdjustedScore >= 90),
  ).length

  const cards: HubCard[] = [
    {
      label: 'Top Performer',
      value: topPerson?.employeeName ?? stats.topPerformer ?? '—',
      hint: topPerson
        ? `${primaryScoreLabel({
            finalAdjustedScore: topPerson.finalAdjustedScore,
            rating: topPerson.rating,
          })} · MVP`
        : 'No scored reviews yet',
      hintClass: topPerson ? 'text-[#7C3AED]' : 'text-text-muted',
      icon: MedalIcon,
      iconBg: 'bg-[#F5F3FF] text-[#7C3AED]',
      border: 'border-[#7C3AED33]',
    },
    {
      label: 'Reviews Due',
      value: String(stats.reviewsDue),
      hint: stats.reviewsDue > 0 ? 'Needs manager follow-up' : 'All caught up',
      hintClass: stats.reviewsDue > 0 ? 'text-[#D97706]' : 'text-[#00B67A]',
      icon: ClipboardIcon,
      iconBg: 'bg-[#EFF6FF] text-primary',
      border: 'border-primary-muted',
    },
    {
      label: 'At Risk',
      value: String(stats.lowPerformance),
      hint: 'Needs improvement / poor / critical',
      hintClass: stats.lowPerformance > 0 ? 'text-[#DC2626]' : 'text-text-muted',
      icon: WarningIcon,
      iconBg: 'bg-[#FEF2F2] text-[#DC2626]',
      border: 'border-[#DC262633]',
    },
    {
      label: 'Excellent',
      value: String(excellentCount),
      hint: 'KPI ≥ 90 this period',
      hintClass: excellentCount > 0 ? 'text-[#00B67A]' : 'text-text-muted',
      icon: StarIcon,
      iconBg: 'bg-[#ECFDF5] text-[#00B67A]',
      border: 'border-[#A7F3D0]',
    },
  ]

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div key={card.label} className={cn('rounded-xl border bg-surface p-5', card.border)}>
            <div className={cn('flex size-10 items-center justify-center rounded-lg', card.iconBg)}>
              <Icon className="size-5" />
            </div>
            <p className="mt-4 text-sm text-text-muted">{card.label}</p>
            <p className="mt-1 truncate text-[24px] font-bold leading-8 text-heading">{card.value}</p>
            <p className={cn('mt-1 text-xs font-semibold', card.hintClass ?? 'text-text-muted')}>
              {card.hint}
            </p>
          </div>
        )
      })}
    </div>
  )
}
