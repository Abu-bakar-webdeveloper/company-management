import { z } from 'zod'
import { COMPANY_HUBS } from '@/features/auth/model/companyHubs'

const enabledHubsSchema = z
  .array(z.enum(COMPANY_HUBS))
  .min(1, 'Select at least one product area')

const logoFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= 2 * 1024 * 1024, 'Logo must be 2MB or smaller')
  .refine((file) => {
    const typeOk = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'].includes(file.type)
    const ext = file.name.split('.').pop()?.toLowerCase()
    const extOk = Boolean(ext && ['png', 'jpg', 'jpeg', 'svg'].includes(ext))
    return typeOk || extOk
  }, 'Logo must be PNG, JPG, or SVG')
  .optional()

export const companyFormSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(1, 'Phone number is required'),
  startingDate: z.string().min(1, 'Starting date is required'),
  subscriptionPlan: z.enum(['basic', 'pro', 'enterprise']),
  startAs: z.enum(['active', 'trial', 'inactive']),
  adminFullName: z.string().min(1, 'Admin name is required'),
  adminEmail: z.string().email('Enter a valid admin email'),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  addressLine: z.string().min(1, 'Address is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  primaryColor: z.string().min(4, 'Primary color is required'),
  secondaryColor: z.string().min(4, 'Secondary color is required'),
  timezone: z.string().min(1),
  currency: z.string().min(1),
  dateFormat: z.string().min(1),
  logo: logoFileSchema,
  enabledHubs: enabledHubsSchema,
})

export type CompanyFormValues = z.infer<typeof companyFormSchema>

export const companyEditFormSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(1, 'Phone number is required'),
  startingDate: z.string().min(1, 'Starting date is required'),
  subscriptionPlan: z.enum(['basic', 'pro', 'enterprise']),
  status: z.enum(['active', 'trial', 'inactive']),
  adminFullName: z.string().min(1, 'Admin name is required'),
  users: z.coerce.number().int().min(0),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  addressLine: z.string().min(1, 'Address is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  primaryColor: z.string().min(4, 'Primary color is required'),
  secondaryColor: z.string().min(4, 'Secondary color is required'),
  timezone: z.string().min(1),
  currency: z.string().min(1),
  dateFormat: z.string().min(1),
  enabledHubs: enabledHubsSchema,
})

export type CompanyEditFormValues = z.infer<typeof companyEditFormSchema>
