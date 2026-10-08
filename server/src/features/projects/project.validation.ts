import { z } from 'zod'
import { paginationQuerySchema } from '../../utils/pagination.js'
import { quickCreateClientSchema } from '../clients/client.validation.js'

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id')

const statusEnum = z.enum(['in_progress', 'completed', 'delayed'])
const priorityEnum = z.enum(['low', 'medium', 'high'])
const sourceEnum = z.enum([
  'referral',
  'website',
  'rfp',
  'existing_client',
  'partner',
  'other',
])

const optionalObjectId = objectIdSchema.optional().or(z.literal('')).transform((v) => {
  if (!v) return undefined
  return v
})

const projectClientFields = {
  clientId: optionalObjectId,
  source: sourceEnum.optional(),
  sourceNote: z.string().trim().optional(),
  contractValue: z.coerce.number().min(0).optional(),
}

export const createProjectSchema = z
  .object({
    name: z.string().trim().min(1, 'Project name is required'),
    description: z.string().trim().min(1, 'Description is required'),
    managerId: objectIdSchema,
    teamMemberIds: z.array(objectIdSchema).default([]),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    priority: priorityEnum,
    status: statusEnum.default('in_progress'),
    clientMode: z.enum(['existing', 'new', 'company']).optional().default('existing'),
    newClient: quickCreateClientSchema.optional(),
    ...projectClientFields,
  })
  .superRefine((data, ctx) => {
    if (data.endDate < data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Deadline must be on or after the start date',
        path: ['endDate'],
      })
    }
    if (data.clientMode === 'new') {
      if (!data.newClient?.name?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Client name is required',
          path: ['newClient', 'name'],
        })
      }
    }
  })

export const updateProjectSchema = z
  .object({
    name: z.string().trim().min(1, 'Project name is required').optional(),
    description: z.string().trim().min(1, 'Description is required').optional(),
    managerId: objectIdSchema.optional(),
    teamMemberIds: z.array(objectIdSchema).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    priority: priorityEnum.optional(),
    status: statusEnum.optional(),
    progress: z.number().min(0).max(100).optional(),
    clientId: optionalObjectId.nullable(),
    source: sourceEnum.optional().nullable(),
    sourceNote: z.string().trim().optional().nullable(),
    contractValue: z.coerce.number().min(0).optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Deadline must be on or after the start date',
        path: ['endDate'],
      })
    }
  })

export const listProjectsQuerySchema = paginationQuerySchema.extend({
  status: statusEnum.optional(),
  search: z.string().trim().optional(),
  memberId: objectIdSchema.optional(),
  clientId: objectIdSchema.optional(),
})

export const projectOverviewQuerySchema = z.object({
  months: z
    .union([z.literal('3'), z.literal('6'), z.literal('12')])
    .optional()
    .default('6')
    .transform((v) => Number(v) as 3 | 6 | 12),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>
export type ProjectOverviewQuery = z.infer<typeof projectOverviewQuerySchema>
