import { z } from 'zod'

const money = z.coerce.number().min(0, 'Must be 0 or more')

export const salaryEarningsSchema = z.object({
  basic: money,
  hra: money,
  utilityAllowance: money,
  conveyanceAllowance: money,
  reimburse: money,
  overTime: money,
  bonus: money,
  loanIssued: money,
  leaveEncashment: money,
})

export const salaryDeductionsSchema = z.object({
  leave: money,
  loan: money,
  providentFund: money,
  advance: money,
  incomeTax: money,
  other: money,
})

export const salaryFormSchema = z.object({
  employeeId: z.string().min(1, 'Select an employee'),
  payPeriodMonth: z.coerce.number().int().min(1).max(12),
  payPeriodYear: z.coerce.number().int().min(2000).max(2100),
  status: z.enum(['paid', 'pending', 'on_hold']),
  description: z.string().trim().max(2000).optional(),
  applyToEmployeeDefaults: z.boolean().optional(),
  earnings: salaryEarningsSchema,
  deductions: salaryDeductionsSchema,
})

export type SalaryFormValues = z.infer<typeof salaryFormSchema>
