import { z } from 'zod'
import { paginationQuerySchema } from '../../utils/pagination.js'

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id')

const leaveTypeIconEnum = z.enum(['sick', 'casual', 'annual', 'unpaid'])
const leaveTypeStatusEnum = z.enum(['active', 'inactive'])
const leaveRequestStatusEnum = z.enum(['pending', 'approved', 'rejected', 'overdue'])

const unpaidCannotCarryForward = <T extends { paidLeave?: boolean; carryForward?: boolean }>(
  schema: z.ZodType<T>,
) =>
  schema.superRefine((data, ctx) => {
    if (data.paidLeave === false && data.carryForward === true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Unpaid leave cannot carry forward or be encashed',
        path: ['carryForward'],
      })
    }
  })

export const createLeaveTypeSchema = unpaidCannotCarryForward(
  z.object({
    name: z.string().trim().min(1, 'Leave type name is required'),
    maxDays: z.coerce.number().min(0, 'Maximum days must be 0 or more').nullable().optional(),
    unlimited: z.boolean().optional(),
    description: z.string().trim().min(1, 'Description is required'),
    icon: leaveTypeIconEnum.optional(),
    carryForward: z.boolean().default(false),
    paidLeave: z.boolean().default(true),
    status: leaveTypeStatusEnum.default('active'),
  }),
)

export const updateLeaveTypeSchema = unpaidCannotCarryForward(
  z
    .object({
      name: z.string().trim().min(1, 'Leave type name is required').optional(),
      maxDays: z.coerce.number().min(0, 'Maximum days must be 0 or more').nullable().optional(),
      unlimited: z.boolean().optional(),
      description: z.string().trim().min(1, 'Description is required').optional(),
      icon: leaveTypeIconEnum.optional(),
      carryForward: z.boolean().optional(),
      paidLeave: z.boolean().optional(),
      status: leaveTypeStatusEnum.optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field is required',
    }),
)

export const createLeaveRequestSchema = z
  .object({
    leaveTypeId: objectIdSchema,
    reason: z.string().trim().min(1, 'Reason is required'),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .superRefine((data, ctx) => {
    if (data.endDate < data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be on or after the start date',
        path: ['endDate'],
      })
    }
  })

export const updateLeaveRequestStatusSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  adminComment: z.string().trim().optional(),
  excessDisposition: z.enum(['waived', 'unpaid_deduct', 'none']).optional(),
})

export const leaveEncashmentSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  targetMonth: z.coerce.number().int().min(1).max(12).optional(),
  targetYear: z.coerce.number().int().min(2000).max(2100).optional(),
})

export const listLeaveRequestsQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().optional(),
  leaveTypeId: objectIdSchema.optional(),
  status: leaveRequestStatusEnum.optional(),
  month: z.string().trim().optional(),
  scope: z.enum(['mine', 'team', 'company']).optional(),
})

export type CreateLeaveTypeInput = z.infer<typeof createLeaveTypeSchema>
export type UpdateLeaveTypeInput = z.infer<typeof updateLeaveTypeSchema>
export type CreateLeaveRequestInput = z.infer<typeof createLeaveRequestSchema>
export type UpdateLeaveRequestStatusInput = z.infer<typeof updateLeaveRequestStatusSchema>
export type ListLeaveRequestsQuery = z.infer<typeof listLeaveRequestsQuerySchema>
export type LeaveEncashmentInput = z.infer<typeof leaveEncashmentSchema>
