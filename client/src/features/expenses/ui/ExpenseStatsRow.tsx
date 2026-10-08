import { formatCurrency } from '@/features/expenses/lib/expense-utils'
import type { ExpenseStats } from '@/features/expenses/model/types'
import {
  CheckCircleIcon,
  ClockIcon,
  DollarIcon,
  XCircleIcon,
} from '@/features/expenses/ui/icons'
import { HubStatsRow, type HubStatCard } from '@/features/hubs/ui/HubStatsRow'

export function ExpenseStatsRow({ stats }: { stats: ExpenseStats }) {
  const cards: HubStatCard[] = [
    {
      id: 'total',
      label: 'Total Expenses',
      value: formatCurrency(stats.total),
      icon: <DollarIcon />,
      iconBg: 'bg-primary-muted text-primary',
      border: 'border-primary-muted',
    },
    {
      id: 'pending',
      label: 'Pending',
      value: formatCurrency(stats.pending),
      hint: stats.pending > 0 ? 'Needs review' : 'All clear',
      hintClass: stats.pending > 0 ? 'text-[#D97706]' : 'text-[#00B67A]',
      icon: <ClockIcon />,
      iconBg: 'bg-warning-muted text-warning',
      border: 'border-warning-muted',
    },
    {
      id: 'approved',
      label: 'Approved',
      value: formatCurrency(stats.approved),
      icon: <CheckCircleIcon />,
      iconBg: 'bg-success-muted text-success',
      border: 'border-success-muted',
    },
    {
      id: 'rejected',
      label: 'Rejected',
      value: formatCurrency(stats.rejected),
      icon: <XCircleIcon />,
      iconBg: 'bg-danger-muted text-danger',
      border: 'border-[#DC262633]',
    },
  ]

  return <HubStatsRow cards={cards} />
}
