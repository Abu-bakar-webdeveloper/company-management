import type { ProjectStats } from '@/features/projects/model/types'
import {
  BriefcaseIcon,
  CheckCircleIcon,
  ClockAlertIcon,
  TimerIcon,
} from '@/features/projects/ui/icons'
import { HubStatsRow, type HubStatCard } from '@/features/hubs/ui/HubStatsRow'

export function ProjectStatsRow({ stats }: { stats: ProjectStats }) {
  const cards: HubStatCard[] = [
    {
      id: 'total',
      label: 'Total Projects',
      value: String(stats.total).padStart(2, '0'),
      icon: <BriefcaseIcon />,
      iconBg: 'bg-[#EFF6FF] text-[#136DEC]',
      border: 'border-[#136DEC33]',
    },
    {
      id: 'completed',
      label: 'Completed',
      value: String(stats.completed).padStart(2, '0'),
      hintClass: 'text-[#00B67A]',
      icon: <CheckCircleIcon />,
      iconBg: 'bg-[#F5F3FF] text-[#9333EA]',
      border: 'border-[#9333EA33]',
    },
    {
      id: 'inProgress',
      label: 'In Progress',
      value: String(stats.inProgress).padStart(2, '0'),
      icon: <TimerIcon />,
      iconBg: 'bg-[#FFF7ED] text-[#EA580C]',
      border: 'border-[#EA580C33]',
    },
    {
      id: 'delayed',
      label: 'Delayed',
      value: String(stats.delayed).padStart(2, '0'),
      hint: stats.delayed > 0 ? 'Needs attention' : 'On track',
      hintClass: stats.delayed > 0 ? 'text-[#DC2626]' : 'text-[#00B67A]',
      icon: <ClockAlertIcon />,
      iconBg: 'bg-[#FEF2F2] text-[#DC2626]',
      border: 'border-[#DC262633]',
    },
  ]

  return <HubStatsRow cards={cards} />
}
