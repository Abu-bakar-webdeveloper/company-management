export type SalaryStatus = 'paid' | 'pending' | 'on_hold'

export type SalaryActivityType =
  | 'created'
  | 'reviewed'
  | 'approved'
  | 'updated'
  | 'status_changed'

export type SalaryActivity = {
  id: string
  type: SalaryActivityType
  actor: string
  timestamp: string
  note?: string
}

export type SalaryEarnings = {
  basic: number
  hra: number
  utilityAllowance: number
  conveyanceAllowance: number
  reimburse: number
  overTime: number
  bonus: number
  loanIssued: number
  leaveEncashment: number
}

export type SalaryDeductions = {
  leave: number
  loan: number
  providentFund: number
  advance: number
  incomeTax: number
  other: number
}

export type SalaryLineItem = {
  componentId?: string
  code: string
  name: string
  kind: 'earning' | 'deduction'
  amount: number
}

export type Salary = {
  id: string
  employeeId: string
  employeeCode: string
  employeeName: string
  employeeAvatar?: string
  department: string
  designation: string
  basic: number
  allowances: number
  deductions: number
  providentFund: number
  employerProvidentFund?: number
  net: number
  date: string
  payPeriodMonth: number
  payPeriodYear: number
  payPeriodLabel: string
  status: SalaryStatus
  description: string
  earnings: SalaryEarnings
  deductionBreakdown: SalaryDeductions
  lineItems?: SalaryLineItem[]
  activities: SalaryActivity[]
  approvedBy?: string
  approvedAt?: string
  bankName?: string
  bankAccountNo?: string
}

export type SalaryListFilters = {
  search: string
  department: string | 'all'
  status: SalaryStatus | 'all'
  month: number | 'all'
  year: number | 'all'
  employeeId: string | 'all'
}

export type SalaryStats = {
  totalMonthlyPayroll: number
  pendingPayroll: number
  paidThisMonth: number
  unpaidOnHold: number
  month?: number
  year?: number
  byDepartment?: Array<{ department: string; total: number }>
}

export type EmployeeSalaryDefaults = {
  employeeId: string
  employeeCode: string
  employeeName: string
  earnings: SalaryEarnings
  deductions: SalaryDeductions
  lineItems?: SalaryLineItem[]
  employerProvidentFund?: number
}

export type PayrollComponent = {
  id: string
  code: string
  name: string
  kind: 'earning' | 'deduction'
  calcType: 'fixed' | 'percent_of_basic'
  defaultValue: number
  isSystem: boolean
  active: boolean
  sortOrder: number
}

export type CompanyPayrollSettings = {
  companyId: string
  pf: {
    enabled: boolean
    employeePercent: number
    employerPercent: number
    base: 'basic' | 'gross'
  }
  leavePolicy: {
    excessLeaveMode: 'reject' | 'deduct_from_salary' | 'admin_can_waive'
    leaveDeductionDivisor: number
    encashmentEnabled: boolean
    encashmentDivisor: number
  }
  incrementPolicy: {
    probationMonths: number
    permanentMonths: number
    eligibleFrom: 'join_date' | 'confirmation_or_last_increment'
  }
  components: PayrollComponent[]
}

export type EmployeeCompensation = {
  employeeId: string
  employmentStage: 'probation' | 'permanent'
  probationEndDate?: string
  confirmationDate?: string
  lastIncrementAt?: string
  currentPackage: {
    basic: number
    allowances: Record<string, number | undefined>
    source: string
    effectiveFrom?: string
  }
  eligibility: {
    stage: string
    due: boolean
    nextEligibleOn: string | null
    monthsUntilDue: number | null
    message: string
  }
  history: {
    id: string
    effectiveFrom: string
    type: string
    basic: number
    allowances: Record<string, number | undefined>
    reason?: string
    createdAt: string
  }[]
}

export type PayrollAssignment = {
  id: string
  componentCode: string
  kind: 'earning' | 'deduction'
  amount: number
  startMonth: number
  startYear: number
  endMonth?: number | null
  endYear?: number | null
  note?: string
  active: boolean
  source: string
}

export type EmployeeLoan = {
  id: string
  principal: number
  issuedOn: string
  installmentAmount: number
  startMonth: number
  startYear: number
  endMonth: number
  endYear: number
  remainingBalance: number
  status: string
  issueInPayroll: boolean
  note?: string
  schedule: {
    month: number
    year: number
    amount: number
    status: string
    salaryId?: string
  }[]
}
