import type { ReactNode } from 'react'
import type { ReportDetailStats } from '@/features/reports/model/types'
import {
  CheckCircleIcon,
  DollarIcon,
  FileTextIcon,
  WalletIcon,
} from '@/features/reports/ui/icons'
import { formatMetric } from '@/features/reports/lib/report-utils'
import { Card } from '@/shared/ui/Card'
import { cn } from '@/shared/lib/cn'

type StatConfig = {
  key: string
  label: (stats: ReportDetailStats) => string
  icon: (props: { className?: string }) => ReactNode
  iconClass: string
  value: (stats: ReportDetailStats) => string
  topRight?: (stats: ReportDetailStats) => ReactNode
}

const configs: StatConfig[] = [
  {
    key: 'totalRecords',
    label: () => 'Total Records',
    icon: FileTextIcon,
    iconClass: 'bg-[#EFF6FF] text-[#1877F2]',
    value: (s) => String(s.totalRecords),
  },
  {
    key: 'secondary',
    label: (s) => s.secondaryLabel,
    icon: WalletIcon,
    iconClass: 'bg-[#F5F3FF] text-[#9333EA]',
    value: (s) => formatMetric(s.secondaryValue, s.secondaryFormat),
  },
  {
    key: 'avg',
    label: (s) => s.avgLabel,
    icon: DollarIcon,
    iconClass: 'bg-[#FFF7ED] text-[#EA580C]',
    value: (s) => formatMetric(s.avgValue, s.avgFormat),
  },
  {
    key: 'status',
    label: () => 'Status',
    icon: CheckCircleIcon,
    iconClass: 'bg-[#ECFDF5] text-[#00B67A]',
    value: (s) => s.status,
    topRight: (s) => (
      <span className="rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[10px] font-bold text-[#00B67A]">
        {s.status === 'Failed' ? 'Error' : s.status === 'Processing' ? 'Busy' : 'Active'}
      </span>
    ),
  },
]

export function ReportDetailStatsRow({ stats }: { stats: ReportDetailStats }) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {configs.map(({ key, label, icon: Icon, iconClass, value, topRight }) => (
        <Card key={key} className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-2">
            <div className={cn('flex size-10 items-center justify-center rounded-lg', iconClass)}>
              <Icon className="size-5" />
            </div>
            {topRight?.(stats)}
          </div>
          <p className="mt-4 text-sm text-text-muted">{label(stats)}</p>
          <p className="mt-1 text-[24px] font-bold leading-8 text-heading sm:text-[26px]">
            {value(stats)}
          </p>
        </Card>
      ))}
    </div>
  )
}
