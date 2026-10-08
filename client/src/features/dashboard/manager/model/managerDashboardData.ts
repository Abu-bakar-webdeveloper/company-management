import type { MetricStatCardData } from '@/features/dashboard/ui/MetricStatCard'

type ManagerStatCard = Omit<MetricStatCardData, 'icon'> & {
  icon: 'employees' | 'projects' | 'leave' | 'performance'
}

export const managerStatCardConfigs: ManagerStatCard[] = [
  {
    id: 'team',
    label: 'Team Members',
    value: '12',
    badge: '+2 This Month',
    badgeTone: 'success',
    icon: 'employees',
    iconBg: 'bg-[#EFF6FF]',
    iconColor: 'text-[#136DEC]',
    border: 'border-[#136DEC33]',
  },
  {
    id: 'projects',
    label: 'Active Projects',
    value: '06',
    badge: 'All on Track',
    badgeTone: 'info',
    icon: 'projects',
    iconBg: 'bg-[#F5F3FF]',
    iconColor: 'text-[#7C3AED]',
    border: 'border-[#7C3AED33]',
  },
  {
    id: 'leave',
    label: 'Pending Leaves Request',
    value: '04',
    badge: 'Action Required',
    badgeTone: 'warning',
    icon: 'leave',
    iconBg: 'bg-[#FFF7ED]',
    iconColor: 'text-[#FF5C00]',
    border: 'border-[#FF5C0033]',
  },
  {
    id: 'performance',
    label: 'Team Performance',
    value: '4.3 / 5',
    badge: '0.2 Increase',
    badgeTone: 'success',
    icon: 'performance',
    iconBg: 'bg-[#ECFDF5]',
    iconColor: 'text-[#00B67A]',
    border: 'border-[#00B67A33]',
  },
]

export const teamWorkloadData = [
  { month: 'Jan', ali: 45, sara: 38, john: 52 },
  { month: 'Feb', ali: 52, sara: 42, john: 48 },
  { month: 'Mar', ali: 58, sara: 55, john: 60 },
  { month: 'Apr', ali: 48, sara: 50, john: 55 },
  { month: 'May', ali: 62, sara: 58, john: 65 },
  { month: 'Jun', ali: 55, sara: 52, john: 58 },
]

export const projectStatusData = [
  { name: 'Active', value: 40, color: '#1877f2' },
  { name: 'Completed', value: 30, color: '#00b67a' },
  { name: 'Delayed', value: 20, color: '#ff5c00' },
  { name: 'Planning', value: 10, color: '#dc2626' },
]

export const managerTeamActivities = [
  {
    id: '1',
    title: 'Leave request submitted',
    description: 'Ali Raza submitted a leave request for Jan 5–7',
    time: '10 minutes ago',
    icon: 'user' as const,
  },
  {
    id: '2',
    title: 'Project milestone reached',
    description: 'Taalam Phase 2 marked complete by the team',
    time: '3 hours ago',
    icon: 'check' as const,
  },
  {
    id: '3',
    title: 'Performance review due',
    description: '2 team members need quarterly reviews this week',
    time: 'Yesterday',
    icon: 'warning' as const,
  },
  {
    id: '4',
    title: 'New task assigned',
    description: 'Sarah Khan assigned API Integration to John Doe',
    time: 'Yesterday',
    icon: 'user' as const,
  },
]

export const managerTopPerformers = [
  { id: '1', name: 'John Doe', score: 4.9, avatar: 'https://i.pravatar.cc/80?img=11' },
  { id: '2', name: 'Ali Raza', score: 4.8, avatar: 'https://i.pravatar.cc/80?img=33' },
  { id: '3', name: 'Sara Khan', score: 4.7, avatar: 'https://i.pravatar.cc/80?img=25' },
]

export const managerPendingLeaves = [
  {
    id: '1',
    employee: 'Ali Raza',
    avatar: 'https://i.pravatar.cc/80?img=33',
    reason: 'Family vacation',
    duration: 'Jan 5 - 7, 2024',
    status: 'pending' as const,
  },
  {
    id: '2',
    employee: 'Emma Wilson',
    avatar: 'https://i.pravatar.cc/80?img=25',
    reason: 'Medical appointment',
    duration: 'Jan 10 - 12, 2024',
    status: 'pending' as const,
  },
  {
    id: '3',
    employee: 'Mike Chen',
    avatar: 'https://i.pravatar.cc/80?img=15',
    reason: 'Personal leave',
    duration: 'Jan 15 - 20, 2024',
    status: 'pending' as const,
  },
]
