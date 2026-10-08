import { z } from 'zod'
import { paginationQuerySchema } from '../../utils/pagination.js'
import { isValidCloudinaryUrl } from '../../services/cloudinary.service.js'
import { COMPANY_HUBS } from './company-hubs.js'

const enabledHubsSchema = z
  .array(z.enum(COMPANY_HUBS))
  .min(1, 'Select at least one product area')
  .transform((hubs) => [...new Set(hubs)])
  .refine((hubs) => hubs.length >= 1, 'Select at least one product area')

const logoUrlSchema = z
  .string()
  .url()
  .refine((value) => isValidCloudinaryUrl(value), 'Logo must be a Cloudinary URL')
  .optional()

export const createCompanySchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  phone: z.string().min(1, 'Phone number is required'),
  startingDate: z.coerce.date(),
  subscriptionPlan: z.enum(['basic', 'pro', 'enterprise']),
  startAs: z.enum(['active', 'trial', 'inactive']),
  adminFullName: z.string().min(1, 'Admin name is required'),
  adminEmail: z.string().min(1, 'Admin email is required').email('Enter a valid admin email'),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  addressLine: z.string().min(1, 'Address is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  primaryColor: z.string().min(4, 'Primary color is required'),
  secondaryColor: z.string().min(4, 'Secondary color is required'),
  timezone: z.string().min(1),
  currency: z.string().min(1),
  dateFormat: z.string().min(1),
  logoUrl: logoUrlSchema,
  users: z.coerce.number().int().min(0).optional(),
  userLimit: z.coerce.number().int().min(0).optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  enabledHubs: enabledHubsSchema.optional(),
})

const ratingFilterSchema = z
  .preprocess(
    (value) => (value === 'all' || value === '' ? undefined : value),
    z.coerce.number().min(0).max(5).optional(),
  )

export const listCompaniesQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['active', 'trial', 'inactive']).optional(),
  search: z.string().trim().optional(),
  rating: ratingFilterSchema,
})

export const companyGrowthQuerySchema = z.object({
  months: z
    .union([z.literal('3'), z.literal('6'), z.literal('12')])
    .optional()
    .default('6')
    .transform((v) => Number(v) as 3 | 6 | 12),
})

export const updateCompanySchema = z
  .object({
    companyName: z.string().min(1, 'Company name is required'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    phone: z.string().min(1, 'Phone number is required'),
    startingDate: z.coerce.date(),
    subscriptionPlan: z.enum(['basic', 'pro', 'enterprise']),
    status: z.enum(['active', 'trial', 'inactive']),
    adminFullName: z.string().min(1, 'Admin name is required'),
    users: z.coerce.number().int().min(0).optional(),
    userLimit: z.coerce.number().int().min(0).optional(),
    rating: z.coerce.number().min(0).max(5).optional(),
    country: z.string().min(1, 'Country is required'),
    city: z.string().min(1, 'City is required'),
    addressLine: z.string().min(1, 'Address is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    logoUrl: logoUrlSchema,
    primaryColor: z.string().min(4, 'Primary color is required'),
    secondaryColor: z.string().min(4, 'Secondary color is required'),
    timezone: z.string().min(1),
    currency: z.string().min(1),
    dateFormat: z.string().min(1),
    enabledHubs: enabledHubsSchema,
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  })

export const updateMyCompanyPreferencesSchema = z
  .object({
    companyName: z.string().min(1, 'Company name is required'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    phone: z.string().min(1, 'Phone number is required'),
    country: z.string().min(1, 'Country is required'),
    city: z.string().min(1, 'City is required'),
    addressLine: z.string().min(1, 'Address is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    logoUrl: logoUrlSchema,
    primaryColor: z.string().min(4, 'Primary color is required'),
    secondaryColor: z.string().min(4, 'Secondary color is required'),
    timezone: z.string().min(1),
    currency: z.string().min(1),
    dateFormat: z.string().min(1),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  })

export type CreateCompanyInput = z.infer<typeof createCompanySchema>
export type ListCompaniesQuery = z.infer<typeof listCompaniesQuerySchema>
export type CompanyGrowthQuery = z.infer<typeof companyGrowthQuerySchema>
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>
export type UpdateMyCompanyPreferencesInput = z.infer<typeof updateMyCompanyPreferencesSchema>
