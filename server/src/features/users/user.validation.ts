import { z } from 'zod'
import { env } from '../../config/env.js'
import { isValidCloudinaryAvatarUrl } from '../../services/cloudinary.service.js'
import { paginationQuerySchema } from '../../utils/pagination.js'

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id')

const avatarSchema = z.string().superRefine((value, ctx) => {
  if (isValidCloudinaryAvatarUrl(value) && value.length <= 2048) return
  // Legacy base64 avatars still accepted until migrated
  if (
    value.startsWith('data:image/') &&
    value.includes(';base64,') &&
    value.length <= 3_000_000
  ) {
    return
  }
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: `Avatar must be a Cloudinary URL${
      env.CLOUDINARY_CLOUD_NAME ? ` (res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/…)` : ''
    }`,
  })
})

const moneyField = z.coerce.number().min(0, 'Must be 0 or more').optional()

export const createUserSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required').optional(),
    lastName: z.string().min(1, 'Last name is required').optional(),
    fullName: z.string().min(2, 'Name is too short').optional(),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    phone: z.string().trim().min(1).optional(),
    cnic: z.string().trim().min(1).optional(),
    role: z.enum(['manager', 'hr', 'employee'], {
      errorMap: () => ({ message: 'Role must be manager, hr or employee' }),
    }),
    customRoleId: objectIdSchema.optional(),
    managerId: objectIdSchema.optional(),
    department: z.string().trim().min(1).optional(),
    jobTitle: z.string().trim().min(1).max(120).optional(),
    homeAddress: z.string().trim().min(1).optional(),
    joinDate: z.coerce.date().optional(),
    avatar: avatarSchema.optional(),
    sendInviteEmail: z.boolean().default(true),
    basicSalary: moneyField,
    hra: moneyField,
    utilityAllowance: moneyField,
    conveyanceAllowance: moneyField,
    providentFund: moneyField,
    bankName: z.string().trim().min(1).max(120).optional(),
    bankAccountNo: z.string().trim().min(1).max(64).optional(),
    employmentStage: z.enum(['probation', 'permanent']).optional(),
    probationEndDate: z.coerce.date().optional(),
    confirmationDate: z.coerce.date().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'employee') {
      const requiredFields: Array<[keyof typeof data, string]> = [
        ['firstName', 'First name is required'],
        ['lastName', 'Last name is required'],
        ['phone', 'Phone number is required'],
        ['cnic', 'CNIC is required'],
        ['department', 'Department is required'],
        ['jobTitle', 'Job title is required'],
        ['joinDate', 'Join date is required'],
      ]
      for (const [field, message] of requiredFields) {
        if (data[field] === undefined) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message, path: [field] })
        }
      }
    } else if (!data.fullName && !(data.firstName && data.lastName)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Full name is required',
        path: ['fullName'],
      })
    }
  })

export const updateUserSchema = z
  .object({
    fullName: z.string().min(2, 'Name is too short').optional(),
    firstName: z.string().min(1, 'First name is required').optional(),
    lastName: z.string().min(1, 'Last name is required').optional(),
    phone: z.string().trim().min(1).optional(),
    cnic: z.string().trim().min(1).optional(),
    department: z.string().trim().min(1).optional(),
    jobTitle: z.string().trim().min(1).max(120).optional(),
    homeAddress: z.string().trim().min(1).optional(),
    joinDate: z.coerce.date().optional(),
    avatar: avatarSchema.optional(),
    role: z.enum(['manager', 'hr', 'employee']).optional(),
    customRoleId: objectIdSchema.nullable().optional(),
    managerId: objectIdSchema.nullable().optional(),
    status: z.enum(['active', 'pending', 'suspended']).optional(),
    basicSalary: moneyField,
    hra: moneyField,
    utilityAllowance: moneyField,
    conveyanceAllowance: moneyField,
    providentFund: moneyField,
    bankName: z.string().trim().min(1).max(120).optional().or(z.literal('')),
    bankAccountNo: z.string().trim().min(1).max(64).optional().or(z.literal('')),
    employmentStage: z.enum(['probation', 'permanent']).optional(),
    probationEndDate: z.coerce.date().nullable().optional(),
    confirmationDate: z.coerce.date().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  })

export const listUsersQuerySchema = paginationQuerySchema.extend({
  role: z.enum(['manager', 'hr', 'employee']).optional(),
  status: z.enum(['active', 'pending', 'suspended']).optional(),
  search: z.string().trim().optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>
