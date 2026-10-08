import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

export type SummaryStatCardData = {
  label: string
  value: string
  valueSuffix: string
  iconBg: string
  iconColor: string
  iconNode: ReactNode
}

export function EmployeeSummaryStatCard({ data }: { data: SummaryStatCardData }) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-6">
      <div
        className={cn(
          'flex size-10 items-center justify-center rounded-lg',
          data.iconBg,
          data.iconColor,
        )}
      >
        {data.iconNode}
      </div>
      <p className="mt-4 text-sm font-medium leading-5 text-[#64748B]">{data.label}</p>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
        <span className="text-2xl font-bold leading-8 text-[#1E293B] sm:text-[28px]">{data.value}</span>
        <span className="text-sm font-medium leading-5 text-[#64748B]">{data.valueSuffix}</span>
      </div>
    </div>
  )
}
