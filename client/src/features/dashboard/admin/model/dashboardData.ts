export type StatCardData = {
  id: string
  label: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: 'employees' | 'projects' | 'leave' | 'expenses'
}

export const statCards: StatCardData[] = [
  { id: 'employees', label: 'Total Employees', value: '120', change: '+12%', trend: 'up', icon: 'employees' },
  { id: 'projects', label: 'Active Projects', value: '45', change: '+5.2%', trend: 'up', icon: 'projects' },
  { id: 'leave', label: 'Pending Leaves Request', value: '15', change: '-2.4%', trend: 'down', icon: 'leave' },
  { id: 'expenses', label: 'Total Expenses', value: '$45,200', change: '+8.1%', trend: 'up', icon: 'expenses' },
]

export const projectOverviewData = [
  { month: 'Jan', active: 32, completed: 22, activeCount: 4, completedCount: 3 },
  { month: 'Feb', active: 48, completed: 28, activeCount: 5, completedCount: 4 },
  { month: 'Mar', active: 55, completed: 35, activeCount: 6, completedCount: 4 },
  { month: 'Apr', active: 42, completed: 52, activeCount: 7, completedCount: 5 },
  { month: 'May', active: 58, completed: 48, activeCount: 8, completedCount: 6 },
  { month: 'Jun', active: 50, completed: 62, activeCount: 7, completedCount: 8 },
]

export const expenseSummaryData = [
  { name: 'Marketing', value: 45, color: '#1877f2' },
  { name: 'Operations', value: 30, color: '#00b67a' },
  { name: 'Others', value: 25, color: '#ffffff' },
]

export const recentActivities = [
  {
    id: '1',
    title: 'New employee onboarded',
    description: 'Sarah Khan joined Design Team',
    time: '2 hours ago',
    icon: 'user' as const,
  },
  {
    id: '2',
    title: "Project 'Taalam' Completed",
    description: 'Delivered ahead of schedule',
    time: '5 hours ago',
    icon: 'check' as const,
  },
  {
    id: '3',
    title: 'Server Maintenance',
    description: 'Scheduled for Sunday night',
    time: 'Yesterday',
    icon: 'warning' as const,
  },
]

export const topPerformers = [
  { id: '1', name: 'John Doe', score: 4.9, avatar: 'https://i.pravatar.cc/80?img=11' },
  { id: '2', name: 'Ali Raza', score: 4.8, avatar: 'https://i.pravatar.cc/80?img=33' },
]

export const leaveRequests = [
  {
    id: '1',
    employee: 'Ali Raza',
    avatar: 'https://i.pravatar.cc/80?img=33',
    leaveType: 'Sick Leave',
    dates: 'Jan 5 - 7, 2024',
    status: 'pending' as const,
  },
  {
    id: '2',
    employee: 'John Doe',
    avatar: 'https://i.pravatar.cc/80?img=11',
    leaveType: 'Casual Leave',
    dates: 'Jan 7 - 10, 2024',
    status: 'approved' as const,
  },
  {
    id: '3',
    employee: 'Sara Khan',
    avatar: 'https://i.pravatar.cc/80?img=47',
    leaveType: 'Unpaid Leave',
    dates: 'Jan 9 - 12, 2024',
    status: 'rejected' as const,
  },
]
