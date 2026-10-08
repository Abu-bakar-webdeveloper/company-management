import { z } from 'zod'

const expenseTypeValues = ['monthly', 'event', 'employee', 'other'] as const
const categoryValues = ['equipment', 'travel', 'food', 'software', 'office', 'other'] as const
const statusValues = ['pending', 'approved', 'rejected'] as const

export const expenseFormSchema = z
  .object({
    title: z.string().min(1, 'Expense title is required'),
    expenseType: z.enum(expenseTypeValues, { message: 'Select an expense type' }),
    category: z.enum(categoryValues, { message: 'Select a category' }),
    amount: z.coerce.number().positive('Amount must be greater than zero'),
    date: z.string().min(1, 'Date is required'),
    employeeId: z.string().optional(),
    projectId: z.string().optional(),
    billingPeriodMonth: z.coerce.number().int().min(1).max(12).optional().or(z.literal('')),
    billingPeriodYear: z.coerce.number().int().min(2000).max(2100).optional().or(z.literal('')),
    eventName: z.string().optional(),
    eventDate: z.string().optional(),
    status: z.enum(statusValues, { message: 'Select a status' }),
    description: z.string().optional(),
  })
  .superRefine((data, ctx) => {
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
  })

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>
