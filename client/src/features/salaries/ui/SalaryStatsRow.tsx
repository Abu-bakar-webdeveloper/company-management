import { formatCurrency } from '@/features/salaries/lib/salary-utils'
import type { SalaryStats } from '@/features/salaries/model/types'
import {
  CheckCircleIcon,
  ClockIcon,
  DollarIcon,
  XCircleIcon,
} from '@/features/salaries/ui/icons'
import { HubStatsRow, type HubStatCard } from '@/features/hubs/ui/HubStatsRow'

export function SalaryStatsRow({ stats }: { stats: SalaryStats }) {
  const cards: HubStatCard[] = [
    {
      id: 'total',
      label: 'Total Monthly Payroll',
      value: formatCurrency(stats.totalMonthlyPayroll),
      icon: <DollarIcon />,
      iconBg: 'bg-primary-muted text-primary',
      border: 'border-primary-muted',
    },
    {
      id: 'pending',
      label: 'Pending Payroll',
      value: formatCurrency(stats.pendingPayroll),
      hint: stats.pendingPayroll > 0 ? 'Needs processing' : 'All settled',
      hintClass: stats.pendingPayroll > 0 ? 'text-[#D97706]' : 'text-[#00B67A]',
      icon: <ClockIcon />,
      iconBg: 'bg-warning-muted text-warning',
      border: 'border-warning-muted',
    },
    {
      id: 'paid',
      label: 'Paid This Month',
      value: formatCurrency(stats.paidThisMonth),
      icon: <CheckCircleIcon />,
      iconBg: 'bg-success-muted text-success',
      border: 'border-success-muted',
    },
    {
      id: 'hold',
      label: 'Unpaid / On Hold',
      value: formatCurrency(stats.unpaidOnHold),
      icon: <XCircleIcon />,
      iconBg: 'bg-danger-muted text-danger',
      border: 'border-[#DC262633]',
    },
  ]

  return <HubStatsRow cards={cards} />
}
