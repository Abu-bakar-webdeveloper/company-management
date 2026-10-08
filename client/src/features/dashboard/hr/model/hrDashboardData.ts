import type { LeaveTypeIcon } from '@/features/leave/model/types'
import type { EmployeeActivityItem } from '@/features/dashboard/employee/model/employeeDashboardData'

export type HrStatCardConfig = {
  id: string
  label: string
  value: string
  valueSuffix: string
  icon: 'employees' | 'onLeave' | 'pendingLeave' | 'payroll'
  iconBg: string
  iconColor: string
}

export const hrStatCardConfigs: HrStatCardConfig[] = [
  {
    id: 'employees',
    label: 'Total Employees',
    value: '44',
    valueSuffix: '',
    icon: 'employees',
    iconBg: 'bg-[#EFF6FF]',
    iconColor: 'text-[#136DEC]',
  },
  {
    id: 'on-leave',
    label: 'Employees on Leave',
    value: '03',
    valueSuffix: '',
    icon: 'onLeave',
    iconBg: 'bg-[#F5F3FF]',
    iconColor: 'text-[#7C3AED]',
  },
  {
    id: 'pending-leave',
    label: 'Pending Leave Requests',
    value: '12',
    valueSuffix: '',
    icon: 'pendingLeave',
    iconBg: 'bg-[#FFF7ED]',
    iconColor: 'text-[#FF5C00]',
  },
  {
    id: 'payroll',
    label: 'Payroll Status',
    value: '4.5 / 5',
    valueSuffix: 'Score',
    icon: 'payroll',
    iconBg: 'bg-[#ECFDF5]',
    iconColor: 'text-[#00B67A]',
  },
]

export const monthlyLeaveRequestsData = [
  { month: 'Jan', requests: 8 },
  { month: 'Feb', requests: 12 },
  { month: 'Mar', requests: 10 },
  { month: 'Apr', requests: 14 },
  { month: 'May', requests: 11 },
  { month: 'Jun', requests: 16 },
]

export const leaveStatusData = [
  { name: 'Approved', value: 60, color: '#4CAF50' },
  { name: 'Active', value: 25, color: '#1877F2' },
  { name: 'Pending', value: 15, color: '#FF9500' },
]

export const hrActivities: EmployeeActivityItem[] = [
  {
    id: '1',
    title: 'Sarah Khan submitted Annual Leave',
    time: '2 hours ago',
    icon: 'check',
  },
  {
    id: '2',
    title: "Ali Raza's salary processed",
    time: 'Yesterday',
    icon: 'play',
  },
  {
    id: '3',
    title: 'John Doe joined Engineering',
    time: 'Yesterday',
    icon: 'refresh',
  },
]

export const payrollOverview = {
  overall: 85,
  employeesPaid: 32,
  pendingPayroll: 12,
}

export type HrLeaveRow = {
  id: string
  employee: string
  avatar?: string
  leaveType: string
  icon: LeaveTypeIcon
  dates: string
  status: 'pending' | 'approved' | 'rejected'
}

export const hrLeaveRequests: HrLeaveRow[] = [
  {
    id: '1',
    employee: 'Sarah Khan',
    leaveType: 'Sick Leave',
    icon: 'sick',
    dates: 'Jan 5 - 7, 2024',
    status: 'approved',
  },
  {
    id: '2',
    employee: 'Ali Raza',
    leaveType: 'Casual Leave',
    icon: 'casual',
    dates: 'Feb 10, 2024',
    status: 'pending',
  },
  {
    id: '3',
    employee: 'John Doe',
    leaveType: 'Annual Leave',
    icon: 'annual',
    dates: 'Feb 10, 2024',
    status: 'pending',
  },
]
