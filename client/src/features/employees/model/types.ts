export type EmployeeStatus = 'active' | 'pending' | 'on_leave' | 'inactive' | 'suspended'

export type EmployeeDepartment =
  | 'engineering'
  | 'design'
  | 'marketing'
  | 'hr'
  | 'finance'
  | 'operations'

export type EmployeeDetailTab = 'overview' | 'projects' | 'leaves' | 'performance' | 'salary'

export type Employee = {
  id: string
  employeeId: string
  fullName: string
  firstName?: string
  lastName?: string
  email: string
  phone: string
  cnic?: string
  homeAddress?: string
  department: EmployeeDepartment
  jobTitle: string
  systemRole?: 'manager' | 'hr' | 'employee'
  customRoleId?: string | null
  roleLabel?: string
  status: EmployeeStatus
  joinDate: string
  avatar?: string
  workLocation?: string
  employmentType?: string
  managerId?: string | null
  managerName?: string
  managerAvatar?: string
  reporteesCount?: number
  basicSalary?: number
  hra?: number
  utilityAllowance?: number
  conveyanceAllowance?: number
  bankName?: string
  bankAccountNo?: string
  employmentStage?: 'probation' | 'permanent'
  probationEndDate?: string
  confirmationDate?: string
}

export type EmployeePayload = Omit<Employee, 'id' | 'employeeId'> & {
  employeeId?: string
}

export type EmployeeListFilters = {
  search: string
  department: EmployeeDepartment | 'all'
  status: EmployeeStatus | 'all'
}

export type LeaveRecordStatus = 'approved' | 'pending' | 'rejected'

export type LeaveRecord = {
  id: string
  type: string
  typeColor: string
  dates: string
  duration: string
  reason: string
  status: LeaveRecordStatus
}

export type LeaveTypeBalance = {
  leaveTypeId: string
  name: string
  icon: 'sick' | 'casual' | 'annual' | 'unpaid'
  maxDays: number | 'unlimited'
  entitlement: number | null
  carryIn: number
  used: number
  pending: number
  remaining: number | null
  available: number | null
  carryForward: boolean
  paidLeave: boolean
}

export type EmployeeLeaveSummary = {
  year: number
  yearlyTaken: number
  remainingBalance: number
  pendingRequests: number
  totalTaken: number
  balances: LeaveTypeBalance[]
  history: LeaveRecord[]
}

export type EmployeePerformance = {
  overallRating: number
  reviewPeriod: string
  reviewTitle: string
  reviewText: string
  reviewStatus: 'approved' | 'pending'
}
