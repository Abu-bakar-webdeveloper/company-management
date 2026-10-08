import { z } from 'zod'
import { paginationQuerySchema } from '../../utils/pagination.js'

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id')

const statusEnum = z.enum(['active', 'inactive'])

const addressSchema = z
  .object({
    country: z.string().trim().optional(),
    city: z.string().trim().optional(),
    addressLine: z.string().trim().optional(),
    postalCode: z.string().trim().optional(),
  })
  .optional()

const primaryContactSchema = z
  .object({
    name: z.string().trim().optional(),
    email: z.string().trim().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().trim().optional(),
  })
  .optional()

const optionalEmail = z
  .string()
  .trim()
  .email('Invalid email')
  .optional()
  .or(z.literal(''))
  .transform((v) => (v === '' ? undefined : v))

export const createClientSchema = z.object({
  name: z.string().trim().min(1, 'Client name is required'),
  email: optionalEmail,
  phone: z.string().trim().optional(),
  website: z.string().trim().optional(),
  industry: z.string().trim().optional(),
  address: addressSchema,
  primaryContact: primaryContactSchema,
  status: statusEnum.default('active'),
  notes: z.string().trim().optional(),
})

export const updateClientSchema = z
  .object({
    name: z.string().trim().min(1, 'Client name is required').optional(),
    email: optionalEmail,
    phone: z.string().trim().optional(),
    website: z.string().trim().optional(),
    industry: z.string().trim().optional(),
    address: addressSchema,
    primaryContact: primaryContactSchema,
    status: statusEnum.optional(),
    notes: z.string().trim().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  })

export const listClientsQuerySchema = paginationQuerySchema.extend({
  status: statusEnum.optional(),
  search: z.string().trim().optional(),
})

export const quickCreateClientSchema = z.object({
  name: z.string().trim().min(1, 'Client name is required'),
  email: optionalEmail,
  phone: z.string().trim().optional(),
})

export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
export type ListClientsQuery = z.infer<typeof listClientsQuerySchema>
export type QuickCreateClientInput = z.infer<typeof quickCreateClientSchema>

export { objectIdSchema }
