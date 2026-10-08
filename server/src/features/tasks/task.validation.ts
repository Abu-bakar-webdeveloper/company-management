import { z } from 'zod'
import { isValidCloudinaryTaskUrl } from '../../services/cloudinary.service.js'
import { MAX_TASK_ATTACHMENT_BYTES } from './task.model.js'

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id')

const subtaskInputSchema = z.object({
  text: z.string().trim().min(1, 'Subtask text is required'),
  done: z.boolean().optional(),
})

const cloudinaryTaskUrlSchema = z
  .string()
  .url()
  .refine((value) => isValidCloudinaryTaskUrl(value), {
    message: 'Attachment must be a Cloudinary URL from the tasks upload folder',
  })

export const createColumnSchema = z.object({
  name: z.string().trim().min(1, 'Column name is required'),
  wipLimit: z.number().int().positive().nullable().optional(),
  columnKind: z.enum(['todo', 'in_progress', 'done', 'custom']).optional(),
})

export const updateColumnSchema = z
  .object({
    name: z.string().trim().min(1, 'Column name is required').optional(),
    wipLimit: z.number().int().positive().nullable().optional(),
    sortOrder: z.number().int().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  })

export const deleteColumnSchema = z.object({
  moveToColumnId: objectIdSchema.optional(),
})

export const reorderColumnsSchema = z.object({
  orderedIds: z.array(objectIdSchema).min(1),
})

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().optional(),
  columnId: objectIdSchema,
  assigneeId: objectIdSchema.nullable().optional(),
  milestoneId: objectIdSchema.nullable().optional(),
  priority: z.enum(['urgent', 'high', 'medium', 'low']).optional(),
  dueDate: z.coerce.date().nullable().optional(),
  subtasks: z.array(subtaskInputSchema).optional(),
  status: z.enum(['todo', 'in_progress', 'done', 'hold']).optional(),
})

export const quickCreateTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  columnId: objectIdSchema,
})

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    description: z.string().trim().optional(),
    assigneeId: objectIdSchema.nullable().optional(),
    milestoneId: objectIdSchema.nullable().optional(),
    priority: z.enum(['urgent', 'high', 'medium', 'low']).optional(),
    dueDate: z.coerce.date().nullable().optional(),
    status: z.enum(['todo', 'in_progress', 'done', 'hold']).optional(),
    subtasks: z
      .array(
        z.object({
          id: objectIdSchema.optional(),
          text: z.string().trim().min(1),
          done: z.boolean(),
        }),
      )
      .optional(),
    image: z.string().url().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  })

export const createAttachmentSchema = z.object({
  url: cloudinaryTaskUrlSchema,
  publicId: z.string().trim().min(1).max(512).nullable().optional(),
  fileName: z.string().trim().min(1).max(255),
  mimeType: z
    .string()
    .trim()
    .refine(
      (v) => ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'].includes(v),
      { message: 'Only PNG, JPG, WebP, or GIF images are allowed' },
    ),
  sizeBytes: z.number().int().positive().max(MAX_TASK_ATTACHMENT_BYTES),
})

export const moveTaskSchema = z.object({
  columnId: objectIdSchema,
  sortOrder: z.number().int().min(0).optional(),
})

export const listMyTasksQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().trim().optional(),
  status: z
    .enum(['todo', 'in_progress', 'done', 'hold', 'overdue', 'completed', 'all'])
    .optional(),
  progress: z.enum(['all', 'in_progress', 'completed', 'overdue']).optional(),
})

export const taskStatsQuerySchema = z.object({
  scope: z.enum(['mine', 'project', 'company']).default('mine'),
  projectId: objectIdSchema.optional(),
  limit: z.coerce.number().int().positive().max(20).optional(),
})

export type CreateColumnInput = z.infer<typeof createColumnSchema>
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>
export type DeleteColumnInput = z.infer<typeof deleteColumnSchema>
export type ReorderColumnsInput = z.infer<typeof reorderColumnsSchema>
export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type QuickCreateTaskInput = z.infer<typeof quickCreateTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type CreateAttachmentInput = z.infer<typeof createAttachmentSchema>
export type MoveTaskInput = z.infer<typeof moveTaskSchema>
export type ListMyTasksQuery = z.infer<typeof listMyTasksQuerySchema>
export type TaskStatsQuery = z.infer<typeof taskStatsQuerySchema>
