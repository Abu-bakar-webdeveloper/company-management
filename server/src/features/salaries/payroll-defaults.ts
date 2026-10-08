import type { PayrollCalcType, PayrollComponentKind } from './payroll-component.model.js'

export type DefaultPayrollComponent = {
  code: string
  name: string
  kind: PayrollComponentKind
  calcType: PayrollCalcType
  defaultValue: number
  isSystem: boolean
  sortOrder: number
}

/** Legacy salary field mapping for dual-write during migration. */
export const EARNING_CODE_TO_FIELD: Record<string, keyof import('./salary.model.js').SalaryEarnings> =
  {
    BASIC: 'basic',
    HRA: 'hra',
    UTILITY: 'utilityAllowance',
    CONVEYANCE: 'conveyanceAllowance',
    REIMBURSE: 'reimburse',
    OT: 'overTime',
    BONUS: 'bonus',
    LOAN_ISSUED: 'loanIssued',
    LEAVE_ENCASHMENT: 'leaveEncashment',
  }

export const DEDUCTION_CODE_TO_FIELD: Record<
  string,
  keyof import('./salary.model.js').SalaryDeductions
> = {
  LEAVE: 'leave',
  LOAN: 'loan',
  PF: 'providentFund',
  ADVANCE: 'advance',
  TAX: 'incomeTax',
  OTHER: 'other',
}

export const DEFAULT_PAYROLL_COMPONENTS: DefaultPayrollComponent[] = [
  { code: 'BASIC', name: 'Basic', kind: 'earning', calcType: 'fixed', defaultValue: 0, isSystem: true, sortOrder: 10 },
  { code: 'HRA', name: 'HRA', kind: 'earning', calcType: 'fixed', defaultValue: 0, isSystem: false, sortOrder: 20 },
  { code: 'UTILITY', name: 'Utility Allowance', kind: 'earning', calcType: 'fixed', defaultValue: 0, isSystem: false, sortOrder: 30 },
  { code: 'CONVEYANCE', name: 'Conveyance Allowance', kind: 'earning', calcType: 'fixed', defaultValue: 0, isSystem: false, sortOrder: 40 },
  { code: 'REIMBURSE', name: 'Reimburse', kind: 'earning', calcType: 'fixed', defaultValue: 0, isSystem: false, sortOrder: 50 },
  { code: 'OT', name: 'Over Time', kind: 'earning', calcType: 'fixed', defaultValue: 0, isSystem: false, sortOrder: 60 },
  { code: 'BONUS', name: 'Bonus', kind: 'earning', calcType: 'fixed', defaultValue: 0, isSystem: false, sortOrder: 70 },
  { code: 'LOAN_ISSUED', name: 'Loan Issued', kind: 'earning', calcType: 'fixed', defaultValue: 0, isSystem: false, sortOrder: 80 },
  { code: 'LEAVE_ENCASHMENT', name: 'Leave Encashment', kind: 'earning', calcType: 'fixed', defaultValue: 0, isSystem: true, sortOrder: 90 },
  { code: 'LEAVE', name: 'Leave', kind: 'deduction', calcType: 'fixed', defaultValue: 0, isSystem: true, sortOrder: 110 },
  { code: 'LOAN', name: 'Loan', kind: 'deduction', calcType: 'fixed', defaultValue: 0, isSystem: false, sortOrder: 120 },
  { code: 'PF', name: 'Provident Fund', kind: 'deduction', calcType: 'fixed', defaultValue: 0, isSystem: true, sortOrder: 130 },
  { code: 'ADVANCE', name: 'Advance', kind: 'deduction', calcType: 'fixed', defaultValue: 0, isSystem: false, sortOrder: 140 },
  { code: 'TAX', name: 'Income Tax', kind: 'deduction', calcType: 'fixed', defaultValue: 0, isSystem: false, sortOrder: 150 },
  { code: 'OTHER', name: 'Other', kind: 'deduction', calcType: 'fixed', defaultValue: 0, isSystem: false, sortOrder: 160 },
]
