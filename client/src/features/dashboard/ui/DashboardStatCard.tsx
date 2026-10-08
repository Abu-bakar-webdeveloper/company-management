import type { ReactNode } from 'react'
import { TrendDownIcon, TrendUpIcon } from '@/features/dashboard/ui/icons'
import { cn } from '@/shared/lib/cn'

export type DashboardStatCardData = {
  id: string
  label: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: ReactNode
  iconBg: string
  iconColor: string
  border?: string
  footer?: string
  footerColor?: string
  trendColor?: string
}

export function DashboardStatCard({ data }: { data: DashboardStatCardData }) {
  const isUp = data.trend === 'up'
  const trendColor = data.trendColor ?? (isUp ? 'text-[#10B981]' : 'text-[#FF5C00]')

  return (
    <div
      className={cn(
        'flex min-h-[148px] flex-col rounded-xl border border-border-card bg-surface p-6 shadow-(--shadow-stat)',
        data.border,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-lg',
            data.iconBg,
            data.iconColor,
          )}
        >
          {data.icon}
        </div>
        <div className={cn('flex items-center gap-1 text-sm font-medium', trendColor)}>
          <span>{data.change}</span>
          {isUp ? <TrendUpIcon className={trendColor} /> : <TrendDownIcon className={trendColor} />}
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <p className="text-sm font-medium leading-5 text-text-muted">{data.label}</p>
        <p className="mt-1 text-2xl font-bold leading-8 text-heading">{data.value}</p>
        {data.footer ? (
          <p className={cn('mt-auto pt-2 text-xs font-medium', data.footerColor ?? 'text-text-muted')}>
            {data.footer}
          </p>
        ) : null}
      </div>
    </div>
  )
}
