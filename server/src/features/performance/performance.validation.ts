import { z } from 'zod'
import { paginationQuerySchema } from '../../utils/pagination.js'

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id')
const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')

const kpiScoreSchema = z.object({
  subKpiId: z.string().trim().min(1),
  marksObtained: z.coerce.number().min(0),
  remarks: z.string().trim().optional().default(''),
})

const subKpiSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1),
  maxMarks: z.coerce.number().min(0),
})

const categorySchema = z.object({
  name: z.string().trim().min(1),
  weightPct: z.coerce.number().min(0).max(100),
  maxMarks: z.coerce.number().min(0),
  subKpis: z.array(subKpiSchema).min(1),
})

export const listPerformanceQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().optional(),
  rating: z.enum(['all', '4+', '3-4', 'below3']).optional(),
  status: z
    .enum(['all', 'excellent', 'good', 'average', 'critical', 'needs_improvement', 'poor'])
    .optional(),
  department: z.string().trim().optional(),
  managerId: z.string().trim().optional(),
  periodStart: dateStringSchema.optional(),
})

export const performanceAnalyticsQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().optional(),
  department: z.string().trim().optional(),
  managerId: z.string().trim().optional(),
  ratingRange: z.string().trim().optional(),
  periodStart: dateStringSchema.optional(),
})

export const periodQuerySchema = z.object({
  periodStart: dateStringSchema.optional(),
})

export const createPerformanceReviewSchema = z
  .object({
    periodStart: dateStringSchema,
    rating: z.coerce.number().min(1).max(5).optional(),
    feedback: z.string().trim().optional(),
    status: z.enum(['draft', 'submitted']).default('submitted'),
    cycleId: objectIdSchema.optional(),
    kpiScores: z.array(kpiScoreSchema).optional(),
    bonus: z.coerce.number().min(0).optional().default(0),
    penalty: z.coerce.number().min(0).optional().default(0),
    bonusPenaltyNote: z.string().trim().optional().default(''),
  })
  .superRefine((data, ctx) => {
    if ((data.bonus !== 0 || data.penalty !== 0) && !data.bonusPenaltyNote?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Bonus/penalty note is required when bonus or penalty is non-zero',
        path: ['bonusPenaltyNote'],
      })
    }
  })

export const updatePerformanceReviewSchema = z
  .object({
    periodStart: dateStringSchema.optional(),
    rating: z.coerce.number().min(1).max(5).optional(),
    feedback: z.string().trim().optional(),
    status: z.enum(['draft', 'submitted']).optional(),
    cycleId: objectIdSchema.nullable().optional(),
    kpiScores: z.array(kpiScoreSchema).optional(),
    bonus: z.coerce.number().min(0).optional(),
    penalty: z.coerce.number().min(0).optional(),
    bonusPenaltyNote: z.string().trim().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  })
  .superRefine((data, ctx) => {
    const bonus = data.bonus ?? 0
    const penalty = data.penalty ?? 0
    if (
      (data.bonus != null || data.penalty != null) &&
      (bonus !== 0 || penalty !== 0) &&
      data.bonusPenaltyNote !== undefined &&
      !data.bonusPenaltyNote.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Bonus/penalty note is required when bonus or penalty is non-zero',
        path: ['bonusPenaltyNote'],
      })
    }
  })

export const createKpiTemplateSchema = z.object({
  role: z.enum(['employee', 'manager']),
  name: z.string().trim().min(1),
  categories: z.array(categorySchema).min(1),
  isActive: z.boolean().optional().default(true),
})

export const updateKpiTemplateSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    categories: z.array(categorySchema).min(1).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  })

export const createReviewCycleSchema = z.object({
  name: z.string().trim().min(1),
  type: z.enum(['quarterly', 'annual', 'custom']),
  periodStart: dateStringSchema,
  periodEnd: dateStringSchema,
  status: z.enum(['draft', 'active', 'closed']).optional().default('draft'),
})

export const updateReviewCycleSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    type: z.enum(['quarterly', 'annual', 'custom']).optional(),
    periodStart: dateStringSchema.optional(),
    periodEnd: dateStringSchema.optional(),
    status: z.enum(['draft', 'active', 'closed']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  })

export const createGoalSchema = z.object({
  employeeId: objectIdSchema,
  cycleId: objectIdSchema.optional(),
  periodStart: dateStringSchema.optional(),
  periodEnd: dateStringSchema.optional(),
  title: z.string().trim().min(1),
  description: z.string().trim().optional().default(''),
  keyResults: z
    .array(
      z.object({
        id: z.string().trim().min(1),
        title: z.string().trim().min(1),
        target: z.coerce.number().min(0),
        current: z.coerce.number().min(0).optional().default(0),
        unit: z.string().trim().optional().default('%'),
      }),
    )
    .optional()
    .default([]),
})

export const updateGoalSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    description: z.string().trim().optional(),
    status: z.enum(['open', 'in_progress', 'completed', 'cancelled']).optional(),
    keyResults: z
      .array(
        z.object({
          id: z.string().trim().min(1),
          title: z.string().trim().min(1),
          target: z.coerce.number().min(0),
          current: z.coerce.number().min(0),
          unit: z.string().trim().optional().default('%'),
        }),
      )
      .optional(),
    managerConfirmed: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  })

export const employeeIdParamSchema = z.object({
  employeeId: objectIdSchema,
})

export const reviewIdParamSchema = z.object({
  reviewId: objectIdSchema,
})

export type ListPerformanceQuery = z.infer<typeof listPerformanceQuerySchema>
export type PerformanceAnalyticsQuery = z.infer<typeof performanceAnalyticsQuerySchema>
export type CreatePerformanceReviewInput = z.infer<typeof createPerformanceReviewSchema>
export type UpdatePerformanceReviewInput = z.infer<typeof updatePerformanceReviewSchema>
export type CreateKpiTemplateInput = z.infer<typeof createKpiTemplateSchema>
export type UpdateKpiTemplateInput = z.infer<typeof updateKpiTemplateSchema>
export type CreateReviewCycleInput = z.infer<typeof createReviewCycleSchema>
export type UpdateReviewCycleInput = z.infer<typeof updateReviewCycleSchema>
export type CreateGoalInput = z.infer<typeof createGoalSchema>
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>
