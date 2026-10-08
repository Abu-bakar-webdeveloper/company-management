import { z } from 'zod'

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id')

export const createMilestoneSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  dueDate: z.coerce.date().optional(),
})

export const updateMilestoneSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').optional(),
    dueDate: z.coerce.date().nullable().optional(),
    status: z.enum(['pending', 'completed']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  })

export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>

export { objectIdSchema }
