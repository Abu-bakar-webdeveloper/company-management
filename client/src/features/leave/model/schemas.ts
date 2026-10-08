import { z } from 'zod'

const statusValues = ['active', 'inactive'] as const

export const leaveTypeFormSchema = z
  .object({
    name: z.string().min(1, 'Leave type name is required'),
    maxDays: z.coerce.number().min(0, 'Maximum days must be 0 or more'),
    unlimited: z.boolean().optional(),
    description: z.string().min(1, 'Description is required'),
    carryForward: z.boolean(),
    paidLeave: z.boolean(),
    status: z.enum(statusValues, { message: 'Select a status' }),
  })
  .superRefine((data, ctx) => {
    if (!data.paidLeave && data.carryForward) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Unpaid leave cannot carry forward or be encashed',
        path: ['carryForward'],
      })
    }
  })

export type LeaveTypeFormValues = z.infer<typeof leaveTypeFormSchema>

export const leaveRequestFormSchema = z
  .object({
    leaveTypeId: z.string().min(1, 'Select a leave type'),
    reason: z.string().min(1, 'Reason is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be on or after the start date',
        path: ['endDate'],
      })
    }
  })

export type LeaveRequestFormValues = z.infer<typeof leaveRequestFormSchema>
