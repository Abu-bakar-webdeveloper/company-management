import type { ClientStats } from '@/features/clients/model/types'
import { HubStatsRow, type HubStatCard } from '@/features/hubs/ui/HubStatsRow'
import {
  HubCheckIcon,
  HubFolderIcon,
  HubMoneyIcon,
  HubWarningIcon,
} from '@/features/hubs/ui/hubIcons'
import { formatCompanyMoney } from '@/shared/lib/format'

export function ClientStatsRow({
  stats,
  showContractValue = false,
}: {
  stats: ClientStats
  showContractValue?: boolean
}) {
  const cards: HubStatCard[] = [
    {
      id: 'active',
      label: 'Active clients',
      value: String(stats.activeClients),
      hint: `${stats.inactiveClients} inactive`,
      hintClass: 'text-primary',
      icon: <HubFolderIcon />,
      iconBg: 'bg-[#EFF6FF] text-primary',
      border: 'border-primary-muted',
    },
  ]

  if (showContractValue) {
    cards.push({
      id: 'contract',
      label: 'Total contract value',
      value: formatCompanyMoney(stats.totalContractValue),
      hint: 'Across linked projects',
      hintClass: 'text-[#00B67A]',
      icon: <HubMoneyIcon />,
      iconBg: 'bg-[#ECFDF5] text-[#00B67A]',
      border: 'border-[#A7F3D0]',
    })
  }

  cards.push(
    {
      id: 'delayed',
      label: 'Clients with delayed project',
      value: String(stats.clientsWithDelayedProject),
      hint: stats.clientsWithDelayedProject > 0 ? 'Needs relationship follow-up' : 'All on track',
      hintClass: stats.clientsWithDelayedProject > 0 ? 'text-[#DC2626]' : 'text-[#00B67A]',
      icon: <HubWarningIcon />,
      iconBg: 'bg-[#FEF2F2] text-[#DC2626]',
      border: 'border-[#DC262633]',
    },
    {
      id: 'healthy',
      label: 'Relationship health',
      value:
        stats.clientsWithDelayedProject === 0
          ? 'Healthy'
          : String(Math.max(0, stats.activeClients - stats.clientsWithDelayedProject)),
      hint:
        stats.clientsWithDelayedProject === 0
          ? 'No delayed delivery flags'
          : 'Active clients without delay',
      hintClass: 'text-[#00B67A]',
      icon: <HubCheckIcon />,
      iconBg: 'bg-[#ECFDF5] text-[#00B67A]',
      border: 'border-[#A7F3D0]',
    },
  )

  return <HubStatsRow cards={cards.slice(0, 4)} />
}
