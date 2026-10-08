import { z } from 'zod'

const statusValues = ['active', 'inactive'] as const

export const clientFormSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().optional(),
  industry: z.string().optional(),
  address: z
    .object({
      country: z.string().optional(),
      city: z.string().optional(),
      addressLine: z.string().optional(),
      postalCode: z.string().optional(),
    })
    .optional(),
  primaryContact: z
    .object({
      name: z.string().optional(),
      email: z.string().email('Invalid email').optional().or(z.literal('')),
      phone: z.string().optional(),
    })
    .optional(),
  status: z.enum(statusValues),
  notes: z.string().optional(),
})

export type ClientFormValues = z.infer<typeof clientFormSchema>

export const clientStatusLabels: Record<(typeof statusValues)[number], string> = {
  active: 'Active',
  inactive: 'Inactive',
}
