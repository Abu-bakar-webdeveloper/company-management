import { HubStatsRow, type HubStatCard } from '@/features/hubs/ui/HubStatsRow'
import {
  HubCheckIcon,
  HubClockIcon,
  HubUsersIcon,
  HubWarningIcon,
} from '@/features/hubs/ui/hubIcons'

export function AttendanceStatsRow({
  totalEmployees,
  present,
  absent,
  late,
  onLeave = 0,
  notArrived = 0,
}: {
  totalEmployees: number
  present: number
  absent: number
  late: number
  onLeave?: number
  notArrived?: number
}) {
  const cards: HubStatCard[] = [
    {
      id: 'total',
      label: 'Total Employees',
      value: String(totalEmployees),
      icon: <HubUsersIcon />,
      iconBg: 'bg-[#EFF6FF] text-[#136DEC]',
      border: 'border-[#136DEC33]',
    },
    {
      id: 'present',
      label: 'Employees Present',
      value: String(present).padStart(2, '0'),
      hintClass: 'text-[#00B67A]',
      icon: <HubCheckIcon />,
      iconBg: 'bg-[#ECFDF5] text-[#00B67A]',
      border: 'border-[#00B67A33]',
    },
    {
      id: 'absent',
      label: 'Employees Absent',
      value: String(absent).padStart(2, '0'),
      hintClass: absent > 0 ? 'text-[#EA580C]' : 'text-[#00B67A]',
      icon: <HubWarningIcon />,
      iconBg: 'bg-[#FFF7ED] text-[#EA580C]',
      border: 'border-[#EA580C33]',
    },
    {
      id: 'late',
      label: 'Late Employees',
      value: String(late),
      hintClass: late > 0 ? 'text-[#DC2626]' : 'text-[#00B67A]',
      icon: <HubClockIcon />,
      iconBg: 'bg-[#FEF2F2] text-[#DC2626]',
      border: 'border-[#DC262633]',
    },
    {
      id: 'onLeave',
      label: 'On Leave',
      value: String(onLeave),
      icon: <HubUsersIcon />,
      iconBg: 'bg-[#F5F3FF] text-[#7C3AED]',
      border: 'border-[#7C3AED33]',
    },
    {
      id: 'notArrived',
      label: 'Not Arrived',
      value: String(notArrived),
      icon: <HubClockIcon />,
      iconBg: 'bg-[#FFFBEB] text-[#D97706]',
      border: 'border-[#D9770633]',
    },
  ]

  return <HubStatsRow cards={cards} columnsClass="sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6" />
}
