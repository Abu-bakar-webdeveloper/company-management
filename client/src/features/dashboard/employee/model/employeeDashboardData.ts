import type { LeaveTypeIcon } from '@/features/leave/model/types'

export type EmployeeStatCardConfig = {
  id: string
  label: string
  value: string
  valueSuffix: string
  icon: 'tasks' | 'projects' | 'leave' | 'performance'
  iconBg: string
  iconColor: string
}

export const employeeStatCardConfigs: EmployeeStatCardConfig[] = [
  {
    id: 'tasks',
    label: 'My Tasks',
    value: '08',
    valueSuffix: 'Pending Tasks',
    icon: 'tasks',
    iconBg: 'bg-[#EFF6FF]',
    iconColor: 'text-[#136DEC]',
  },
  {
    id: 'projects',
    label: 'My Projects',
    value: '03',
    valueSuffix: 'Active Projects',
    icon: 'projects',
    iconBg: 'bg-[#F5F3FF]',
    iconColor: 'text-[#7C3AED]',
  },
  {
    id: 'leave',
    label: 'Leave Balance',
    value: '12',
    valueSuffix: 'Days Remaining',
    icon: 'leave',
    iconBg: 'bg-[#FFF7ED]',
    iconColor: 'text-[#FF5C00]',
  },
  {
    id: 'performance',
    label: 'Performance',
    value: '4.5 / 5',
    valueSuffix: 'Score',
    icon: 'performance',
    iconBg: 'bg-[#ECFDF5]',
    iconColor: 'text-[#00B67A]',
  },
]

export const workProgressData = [
  { month: 'Jan', completed: 6 },
  { month: 'Feb', completed: 9 },
  { month: 'Mar', completed: 11 },
  { month: 'Apr', completed: 16 },
  { month: 'May', completed: 13 },
  { month: 'Jun', completed: 18 },
]

export const tasksStatusData = [
  { name: 'Done', value: 60, color: '#4CAF50' },
  { name: 'Active', value: 25, color: '#1877F2' },
  { name: 'Hold', value: 15, color: '#CBD5E1' },
]

export type EmployeeActivityItem = {
  id: string
  title: string
  time: string
  icon: 'check' | 'play' | 'refresh'
}

export const employeeActivities: EmployeeActivityItem[] = [
  {
    id: '1',
    title: "Completed task 'Dashboard UI'",
    time: '2 hours ago',
    icon: 'check',
  },
  {
    id: '2',
    title: 'Submitted leave request',
    time: 'Yesterday',
    icon: 'play',
  },
  {
    id: '3',
    title: 'Updated project milestone',
    time: 'Yesterday',
    icon: 'refresh',
  },
]

export const employeePerformance = {
  overall: 85,
  rating: 4.5,
  tasksDone: 32,
  projects: 4,
  status: 'EXCELLENT' as const,
}

export type EmployeeLeaveRow = {
  id: string
  leaveType: string
  icon: LeaveTypeIcon
  dates: string
  status: 'pending' | 'approved' | 'rejected'
}

export const employeeLeaveRequests: EmployeeLeaveRow[] = [
  {
    id: '1',
    leaveType: 'Sick Leave',
    icon: 'sick',
    dates: 'Jan 5 - 7, 2024',
    status: 'approved',
  },
  {
    id: '2',
    leaveType: 'Casual Leave',
    icon: 'casual',
    dates: 'Feb 10, 2024',
    status: 'pending',
  },
  {
    id: '3',
    leaveType: 'Annual Leave',
    icon: 'annual',
    dates: 'Feb 10, 2024',
    status: 'pending',
  },
]
