import type { LeaveStats } from '@/features/leave/model/types'
import {
  CheckCircleIcon,
  ClockIcon,
  ListIcon,
  XCircleIcon,
} from '@/features/leave/ui/icons'
import { cn } from '@/shared/lib/cn'

type StatConfig = {
  key: keyof Pick<LeaveStats, 'total' | 'pending' | 'overdue' | 'approved' | 'rejected'>
  label: string
  icon: typeof ListIcon
  iconBg: string
  iconColor: string
  border: string
}

const statConfigs: StatConfig[] = [
  {
    key: 'total',
    label: 'Total Requests',
    icon: ListIcon,
    iconBg: 'bg-[#EFF6FF]',
    iconColor: 'text-[#136DEC]',
    border: 'border-[#136DEC33]',
  },
  {
    key: 'pending',
    label: 'Pending',
    icon: ClockIcon,
    iconBg: 'bg-[#F5F3FF]',
    iconColor: 'text-[#9333EA]',
    border: 'border-[#9333EA33]',
  },
  {
    key: 'overdue',
    label: 'Overdue',
    icon: ClockIcon,
    iconBg: 'bg-[#FEF2F2]',
    iconColor: 'text-[#DC2626]',
    border: 'border-[#DC262633]',
  },
  {
    key: 'approved',
    label: 'Approved',
    icon: CheckCircleIcon,
    iconBg: 'bg-[#ECFDF5]',
    iconColor: 'text-[#00B67A]',
    border: 'border-[#00B67A33]',
  },
  {
    key: 'rejected',
    label: 'Rejected',
    icon: XCircleIcon,
    iconBg: 'bg-[#FEF2F2]',
    iconColor: 'text-[#DC2626]',
    border: 'border-[#DC262633]',
  },
]

export function LeaveStatsRow({ stats }: { stats: LeaveStats }) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {statConfigs.map(({ key, label, icon: Icon, iconBg, iconColor, border }) => (
        <div key={key} className={cn('rounded-xl border bg-surface p-[25px]', border)}>
          <div className={cn('flex size-10 items-center justify-center rounded-lg', iconBg, iconColor)}>
            <Icon />
          </div>
          <p className="mt-4 text-sm leading-5 text-text-muted">{label}</p>
          <p className="mt-1 text-2xl font-bold leading-8 text-heading">{stats[key]}</p>
        </div>
      ))}
    </div>
  )
}
