import { z } from 'zod'
import { paginationQuerySchema } from '../../utils/pagination.js'

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id')
const money = z.coerce.number().positive('Amount must be greater than zero')
const expenseStatusEnum = z.enum(['pending', 'approved', 'rejected'])
const expenseTypeEnum = z.enum(['monthly', 'event', 'employee', 'other'])
const expenseCategoryEnum = z.enum([
  'equipment',
  'travel',
  'food',
  'software',
  'office',
  'other',
])

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')

const receiptSchema = z.object({
  url: z.string().url('Invalid receipt URL'),
  publicId: z.string().trim().optional(),
  filename: z.string().trim().min(1).max(255),
  size: z.string().trim().min(1).max(50),
  mimeType: z.string().trim().min(1).max(100),
})

const optionalObjectId = z
  .union([objectIdSchema, z.literal('')])
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined))

const optionalDate = z
  .union([dateStringSchema, z.literal('')])
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined))

type ExpenseTypeFields = {
  expenseType: 'monthly' | 'event' | 'employee' | 'other'
  employeeId?: string
  billingPeriodMonth?: number
  billingPeriodYear?: number
  eventName?: string
}

function refineExpenseTypeFields(data: ExpenseTypeFields, ctx: z.RefinementCtx) {
  if (data.expenseType === 'employee' && !data.employeeId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Select an employee',
      path: ['employeeId'],
    })
  }
  if (data.expenseType === 'monthly') {
    if (!data.billingPeriodMonth) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select billing month',
        path: ['billingPeriodMonth'],
      })
    }
    if (!data.billingPeriodYear) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select billing year',
        path: ['billingPeriodYear'],
      })
    }
  }
  if (data.expenseType === 'event' && !data.eventName?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Event name is required',
      path: ['eventName'],
    })
  }
}

export const createExpenseSchema = z
  .object({
    title: z.string().trim().min(1, 'Expense title is required').max(200),
    expenseType: expenseTypeEnum.default('employee'),
    category: expenseCategoryEnum,
    amount: money,
    date: dateStringSchema,
    employeeId: optionalObjectId,
    projectId: optionalObjectId,
    billingPeriodMonth: z.coerce.number().int().min(1).max(12).optional(),
    billingPeriodYear: z.coerce.number().int().min(2000).max(2100).optional(),
    eventName: z.string().trim().max(200).optional(),
    eventDate: optionalDate,
    status: expenseStatusEnum.default('pending'),
    description: z.string().trim().max(2000).optional(),
    receipt: receiptSchema.optional(),
  })
  .superRefine(refineExpenseTypeFields)

export const updateExpenseSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    expenseType: expenseTypeEnum.optional(),
    category: expenseCategoryEnum.optional(),
    amount: money.optional(),
    date: dateStringSchema.optional(),
    employeeId: optionalObjectId.nullable(),
    projectId: optionalObjectId.nullable(),
    billingPeriodMonth: z.coerce.number().int().min(1).max(12).nullable().optional(),
    billingPeriodYear: z.coerce.number().int().min(2000).max(2100).nullable().optional(),
    eventName: z.string().trim().max(200).nullable().optional(),
    eventDate: optionalDate.nullable(),
    description: z.string().trim().max(2000).optional(),
    receipt: receiptSchema.nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  })

export const updateExpenseStatusSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  note: z.string().trim().max(1000).optional(),
})

export const listExpensesQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().optional(),
  expenseType: expenseTypeEnum.optional(),
  category: expenseCategoryEnum.optional(),
  status: expenseStatusEnum.optional(),
  employeeId: objectIdSchema.optional(),
  projectId: objectIdSchema.optional(),
  period: z.enum(['all', 'this_month', 'last_month']).optional(),
})

export const approvedTotalQuerySchema = z.object({
  employeeId: objectIdSchema,
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
})

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>
export type UpdateExpenseStatusInput = z.infer<typeof updateExpenseStatusSchema>
export type ListExpensesQuery = z.infer<typeof listExpensesQuerySchema>
export type ApprovedTotalQuery = z.infer<typeof approvedTotalQuerySchema>
