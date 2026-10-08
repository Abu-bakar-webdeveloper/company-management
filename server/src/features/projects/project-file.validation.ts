import { z } from 'zod'
import {
  MAX_PROJECT_FILE_BYTES,
} from './project-file.model.js'
import { isValidCloudinaryUrl } from '../../services/cloudinary.service.js'

const httpUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .url('Enter a valid URL')
  .refine((v) => /^https?:\/\//i.test(v), {
    message: 'URL must start with http:// or https://',
  })

const cloudinaryProjectUrlSchema = z
  .string()
  .trim()
  .refine((v) => isValidCloudinaryUrl(v), {
    message: 'Invalid upload URL',
  })

export const createProjectFileSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('file'),
    title: z.string().trim().min(1).max(200).optional(),
    url: cloudinaryProjectUrlSchema,
    publicId: z.string().trim().min(1).max(512).nullable().optional(),
    fileName: z.string().trim().min(1).max(255),
    mimeType: z.string().trim().min(1).max(128),
    sizeBytes: z.number().int().positive().max(MAX_PROJECT_FILE_BYTES),
  }),
  z.object({
    kind: z.literal('link'),
    title: z.string().trim().min(1, 'Title is required').max(200),
    url: httpUrlSchema,
  }),
])

export type CreateProjectFileInput = z.infer<typeof createProjectFileSchema>
