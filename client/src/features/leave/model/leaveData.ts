import type { LeaveRequest, LeaveType } from '@/features/leave/model/types'

function avatarUrl(id: string): string {
  const img = Number.parseInt(id, 10) % 70 || 1
  return `https://i.pravatar.cc/80?img=${img}`
}

export const mockLeaveTypes: LeaveType[] = [
  {
    id: '1',
    name: 'Sick Leave',
    maxDays: 10,
    description: 'Medical leave for health-related absence.',
    icon: 'sick',
    carryForward: false,
    paidLeave: true,
    status: 'active',
  },
  {
    id: '2',
    name: 'Casual Leave',
    maxDays: 7,
    description: 'Short term leave for personal errands.',
    icon: 'casual',
    carryForward: false,
    paidLeave: true,
    status: 'active',
  },
  {
    id: '3',
    name: 'Annual Leave',
    maxDays: 20,
    description: 'Paid time off for holidays and vacations.',
    icon: 'annual',
    carryForward: true,
    paidLeave: true,
    status: 'active',
  },
  {
    id: '4',
    name: 'Unpaid Leave',
    maxDays: 'unlimited',
    description: 'Leave taken without pay for various reasons.',
    icon: 'unpaid',
    carryForward: false,
    paidLeave: false,
    status: 'active',
  },
]

const SEED_REQUESTS: Omit<LeaveRequest, 'id'>[] = [
  {
    requestId: 'LR-005',
    employeeId: 'emp-ali-raza',
    employeeName: 'Ali Raza',
    department: 'Design Department',
    avatar: avatarUrl('33'),
    leaveTypeId: '1',
    leaveTypeName: 'Sick Leave',
    reason:
      'High fever and flu. Taking doctor-prescribed rest to recover and prevent spreading infection in the office.',
    startDate: '2024-01-05',
    endDate: '2024-01-07',
    durationDays: 3,
    status: 'pending',
    appliedDate: '2024-01-01',
    totalLeavesTaken: 12,
    remainingBalance: 8,
  },
  {
    requestId: 'LR-006',
    employeeId: 'emp-sara-khan',
    employeeName: 'Sara Khan',
    department: 'Marketing Department',
    avatar: avatarUrl('47'),
    leaveTypeId: '2',
    leaveTypeName: 'Casual Leave',
    reason: 'Personal family matter requiring immediate attention.',
    startDate: '2024-02-10',
    endDate: '2024-02-10',
    durationDays: 1,
    status: 'approved',
    appliedDate: '2024-02-05',
    adminComment: 'Approved for personal matter.',
    totalLeavesTaken: 12,
    remainingBalance: 8,
  },
  {
    requestId: 'LR-001',
    employeeId: 'emp-naeem-ashraf',
    employeeName: 'Naeem Ashraf',
    department: 'Development',
    avatar: avatarUrl('68'),
    leaveTypeId: '3',
    leaveTypeName: 'Annual Leave',
    reason: 'Family vacation to Italy. Planning to spend quality time with family and explore cultural sites.',
    startDate: '2024-10-12',
    endDate: '2024-10-19',
    durationDays: 5,
    status: 'pending',
    appliedDate: '2024-09-28',
    totalLeavesTaken: 12,
    remainingBalance: 8,
  },
  {
    requestId: 'LR-002',
    employeeId: 'emp-john-doe',
    employeeName: 'John Doe',
    department: 'Operations',
    avatar: avatarUrl('12'),
    leaveTypeId: '1',
    leaveTypeName: 'Sick Leave',
    reason: 'Not feeling well, need rest and recovery at home.',
    startDate: '2024-09-03',
    endDate: '2024-09-04',
    durationDays: 2,
    status: 'approved',
    appliedDate: '2024-09-02',
    totalLeavesTaken: 12,
    remainingBalance: 8,
  },
  {
    requestId: 'LR-003',
    employeeId: 'emp-sarah-khan',
    employeeName: 'Sarah Khan',
    department: 'Marketing',
    avatar: avatarUrl('47'),
    leaveTypeId: '4',
    leaveTypeName: 'Unpaid Leave',
    reason: 'Family Bonding Time.',
    startDate: '2024-08-01',
    endDate: '2024-10-30',
    durationDays: 60,
    status: 'rejected',
    appliedDate: '2024-07-15',
    totalLeavesTaken: 12,
    remainingBalance: 8,
  },
  {
    requestId: 'LR-004',
    employeeId: 'emp-ali-raza-2',
    employeeName: 'Ali Raza',
    department: 'Design',
    avatar: avatarUrl('33'),
    leaveTypeId: '3',
    leaveTypeName: 'Annual Leave',
    reason: 'Personal time off for family commitments and rest.',
    startDate: '2024-11-10',
    endDate: '2024-11-15',
    durationDays: 4,
    status: 'approved',
    appliedDate: '2024-10-20',
    totalLeavesTaken: 12,
    remainingBalance: 8,
  },
]

function generateExtraRequests(): Omit<LeaveRequest, 'id'>[] {
  const employees = [
    { name: 'Mike Chen', dept: 'Engineering', avatar: avatarUrl('15') },
    { name: 'Emma Wilson', dept: 'Design', avatar: avatarUrl('25') },
    { name: 'Tom Lee', dept: 'Finance', avatar: avatarUrl('41') },
    { name: 'Lisa Park', dept: 'HR', avatar: avatarUrl('52') },
    { name: 'David Kim', dept: 'Marketing', avatar: avatarUrl('22') },
    { name: 'Anna Smith', dept: 'Operations', avatar: avatarUrl('18') },
    { name: 'James Brown', dept: 'Engineering', avatar: avatarUrl('35') },
    { name: 'Maria Garcia', dept: 'Design', avatar: avatarUrl('44') },
    { name: 'Chris Taylor', dept: 'Finance', avatar: avatarUrl('55') },
    { name: 'Emily Davis', dept: 'HR', avatar: avatarUrl('60') },
    { name: 'Robert Wilson', dept: 'Marketing', avatar: avatarUrl('62') },
    { name: 'Jennifer Lee', dept: 'Operations', avatar: avatarUrl('65') },
    { name: 'Michael Chen', dept: 'Engineering', avatar: avatarUrl('70') },
    { name: 'Sophia Martinez', dept: 'Design', avatar: avatarUrl('28') },
    { name: 'Daniel White', dept: 'Finance', avatar: avatarUrl('38') },
    { name: 'Olivia Johnson', dept: 'HR', avatar: avatarUrl('48') },
    { name: 'William Davis', dept: 'Marketing', avatar: avatarUrl('58') },
    { name: 'Isabella Moore', dept: 'Operations', avatar: avatarUrl('63') },
  ]

  const types = mockLeaveTypes
  const statuses: LeaveRequest['status'][] = ['pending', 'approved', 'rejected', 'approved']

  return employees.map((emp, i) => {
    const type = types[i % types.length]
    const status = statuses[i % statuses.length]
    const month = String((i % 12) + 1).padStart(2, '0')
    return {
      requestId: `LR-${String(i + 7).padStart(3, '0')}`,
      employeeId: `emp-extra-${i + 1}`,
      employeeName: emp.name,
      department: emp.dept,
      avatar: emp.avatar,
      leaveTypeId: type.id,
      leaveTypeName: type.name,
      reason: `Leave request for ${type.name.toLowerCase()} purposes.`,
      startDate: `2024-${month}-10`,
      endDate: `2024-${month}-15`,
      durationDays: 3 + (i % 4),
      status,
      appliedDate: `2024-${month}-05`,
      totalLeavesTaken: 12,
      remainingBalance: 8,
    }
  })
}

export const mockLeaveRequests: LeaveRequest[] = [...SEED_REQUESTS, ...generateExtraRequests()].map(
  (req, index) => ({
    ...req,
    id: String(index + 1),
  }),
)

export const leaveTypeStatusLabels: Record<LeaveType['status'], string> = {
  active: 'Active',
  inactive: 'Inactive',
}

export const requestStatusLabels: Record<LeaveRequest['status'], string> = {
  pending: 'PENDING',
  approved: 'APPROVED',
  rejected: 'REJECTED',
}

export const requestStatusFilterLabels: Record<
  LeaveRequest['status'] | 'overdue',
  string
> = {
  ...requestStatusLabels,
  overdue: 'OVERDUE',
}
