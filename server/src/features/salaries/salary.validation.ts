import { z } from 'zod'
import { paginationQuerySchema } from '../../utils/pagination.js'

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id')
const money = z.coerce.number().min(0, 'Must be 0 or more')
const salaryStatusEnum = z.enum(['paid', 'pending', 'on_hold'])

const earningsSchema = z.object({
  basic: money,
  hra: money.default(0),
  utilityAllowance: money.default(0),
  conveyanceAllowance: money.default(0),
  reimburse: money.default(0),
  overTime: money.default(0),
  bonus: money.default(0),
  loanIssued: money.default(0),
  leaveEncashment: money.default(0),
})

const deductionsSchema = z.object({
  leave: money.default(0),
  loan: money.default(0),
  providentFund: money.default(0),
  advance: money.default(0),
  incomeTax: money.default(0),
  other: money.default(0),
})

const lineItemSchema = z.object({
  code: z.string().trim().min(1).max(40),
  amount: money,
})

export const createSalarySchema = z.object({
  employeeId: objectIdSchema,
  payPeriodMonth: z.coerce.number().int().min(1).max(12),
  payPeriodYear: z.coerce.number().int().min(2000).max(2100),
  status: salaryStatusEnum.default('pending'),
  earnings: earningsSchema.optional(),
  deductions: deductionsSchema.optional(),
  lineItems: z.array(lineItemSchema).optional(),
  description: z.string().trim().max(2000).optional(),
  applyToEmployeeDefaults: z.boolean().optional(),
})

export const updateSalarySchema = z
  .object({
    status: salaryStatusEnum.optional(),
    earnings: earningsSchema.optional(),
    deductions: deductionsSchema.optional(),
    lineItems: z.array(lineItemSchema).optional(),
    description: z.string().trim().max(2000).optional(),
    applyToEmployeeDefaults: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  })

export const updateSalaryStatusSchema = z.object({
  status: salaryStatusEnum,
})

export const bulkSalaryStatusSchema = z.object({
  ids: z.array(objectIdSchema).min(1, 'Select at least one salary record'),
  status: salaryStatusEnum,
})

export const generateMonthSchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
})

export const listSalariesQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().optional(),
  department: z.string().trim().optional(),
  status: salaryStatusEnum.optional(),
  employeeId: objectIdSchema.optional(),
  period: z.enum(['all', 'this_month', 'last_month']).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
})

export const salaryStatsQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
})

export const updatePayrollSettingsSchema = z.object({
  pf: z
    .object({
      enabled: z.boolean().optional(),
      employeePercent: z.coerce.number().min(0).max(100).optional(),
      employerPercent: z.coerce.number().min(0).max(100).optional(),
      base: z.enum(['basic', 'gross']).optional(),
    })
    .optional(),
  leavePolicy: z
    .object({
      excessLeaveMode: z
        .enum(['reject', 'deduct_from_salary', 'admin_can_waive'])
        .optional(),
      leaveDeductionDivisor: z.coerce.number().int().min(1).max(365).optional(),
      encashmentEnabled: z.boolean().optional(),
      encashmentDivisor: z.coerce.number().int().min(1).max(365).optional(),
    })
    .optional(),
  incrementPolicy: z
    .object({
      probationMonths: z.coerce.number().int().min(1).max(36).optional(),
      permanentMonths: z.coerce.number().int().min(1).max(60).optional(),
      eligibleFrom: z
        .enum(['join_date', 'confirmation_or_last_increment'])
        .optional(),
    })
    .optional(),
})

export const createCompensationEventSchema = z.object({
  effectiveFrom: z.coerce.date(),
  type: z.enum([
    'increment',
    'confirmation',
    'correction',
    'structure_change',
  ]),
  basic: money,
  allowances: z
    .object({
      HRA: money.optional(),
      UTILITY: money.optional(),
      CONVEYANCE: money.optional(),
    })
    .passthrough()
    .optional(),
  reason: z.string().trim().max(500).optional(),
  setPermanent: z.boolean().optional(),
  regeneratePending: z.boolean().optional(),
})

export const createAssignmentSchema = z
  .object({
    componentCode: z.string().trim().min(1).max(40),
    kind: z.enum(['earning', 'deduction']),
    amount: money,
    startMonth: z.coerce.number().int().min(1).max(12),
    startYear: z.coerce.number().int().min(2000).max(2100),
    endMonth: z.coerce.number().int().min(1).max(12).nullable().optional(),
    endYear: z.coerce.number().int().min(2000).max(2100).nullable().optional(),
    note: z.string().trim().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      (data.endMonth == null) !== (data.endYear == null)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide both end month and year, or neither',
        path: ['endMonth'],
      })
    }
  })

export const updateAssignmentSchema = z
  .object({
    componentCode: z.string().trim().min(1).max(40).optional(),
    kind: z.enum(['earning', 'deduction']).optional(),
    amount: money.optional(),
    startMonth: z.coerce.number().int().min(1).max(12).optional(),
    startYear: z.coerce.number().int().min(2000).max(2100).optional(),
    endMonth: z.coerce.number().int().min(1).max(12).nullable().optional(),
    endYear: z.coerce.number().int().min(2000).max(2100).nullable().optional(),
    note: z.string().trim().max(500).optional(),
    active: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  })

export const createLoanSchema = z.object({
  principal: money,
  installmentAmount: money,
  startMonth: z.coerce.number().int().min(1).max(12),
  startYear: z.coerce.number().int().min(2000).max(2100),
  issuedOn: z.coerce.date().optional(),
  issueInPayroll: z.boolean().optional(),
  note: z.string().trim().max(500).optional(),
})

export type CreateCompensationEventInput = z.infer<typeof createCompensationEventSchema>
export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>
export type CreateLoanInput = z.infer<typeof createLoanSchema>

export const createPayrollComponentSchema = z.object({
  code: z.string().trim().min(1).max(40).optional(),
  name: z.string().trim().min(1).max(80),
  kind: z.enum(['earning', 'deduction']),
  calcType: z.enum(['fixed', 'percent_of_basic']).optional(),
  defaultValue: money.optional(),
  active: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
})

export const updatePayrollComponentSchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    kind: z.enum(['earning', 'deduction']).optional(),
    calcType: z.enum(['fixed', 'percent_of_basic']).optional(),
    defaultValue: money.optional(),
    active: z.boolean().optional(),
    sortOrder: z.coerce.number().int().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  })

export type CreateSalaryInput = z.infer<typeof createSalarySchema>
export type UpdateSalaryInput = z.infer<typeof updateSalarySchema>
export type UpdateSalaryStatusInput = z.infer<typeof updateSalaryStatusSchema>
export type BulkSalaryStatusInput = z.infer<typeof bulkSalaryStatusSchema>
export type GenerateMonthInput = z.infer<typeof generateMonthSchema>
export type ListSalariesQuery = z.infer<typeof listSalariesQuerySchema>
export type SalaryStatsQuery = z.infer<typeof salaryStatsQuerySchema>
export type UpdatePayrollSettingsInput = z.infer<typeof updatePayrollSettingsSchema>
export type CreatePayrollComponentInput = z.infer<typeof createPayrollComponentSchema>
export type UpdatePayrollComponentInput = z.infer<typeof updatePayrollComponentSchema>
