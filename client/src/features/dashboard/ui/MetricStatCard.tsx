import type { ReactNode } from 'react'
import { TrendUpIcon } from '@/features/dashboard/ui/icons'
import { cn } from '@/shared/lib/cn'

export type MetricStatCardData = {
  id: string
  label: string
  value: string
  badge: string
  badgeTone?: 'success' | 'warning' | 'info' | 'neutral'
  icon: ReactNode
  iconBg: string
  iconColor: string
  border: string
}

const badgeTones = {
  success: 'text-[#2EC291]',
  warning: 'text-[#FF5C00]',
  info: 'text-[#1877f2]',
  neutral: 'text-text-muted',
}

export function MetricStatCard({ data }: { data: MetricStatCardData }) {
  const badgeTone = data.badgeTone ?? 'neutral'
  const showTrend = badgeTone === 'success'

  return (
    <div className={cn('rounded-lg border bg-surface p-5', data.border)}>
      <div
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-lg',
          data.iconBg,
          data.iconColor,
        )}
      >
        {data.icon}
      </div>
      <div className="mt-3 flex items-center gap-1">
        <span className={cn('text-sm font-normal', badgeTones[badgeTone])}>{data.badge}</span>
        {showTrend ? <TrendUpIcon /> : null}
      </div>
      <p className="mt-1 text-sm font-medium leading-5 text-text-muted">{data.label}</p>
      <p className="mt-1 text-[24px] font-bold leading-8 text-heading">{data.value}</p>
    </div>
  )
}
