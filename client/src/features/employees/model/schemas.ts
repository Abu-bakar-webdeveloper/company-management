import { z } from 'zod'

const departmentValues = [
  'engineering',
  'design',
  'marketing',
  'hr',
  'finance',
  'operations',
] as const

const statusValues = ['active', 'pending', 'suspended'] as const

const phoneSchema = z
  .string()
  .min(1, 'Phone is required')
  .regex(/^[\d\s+()-]{7,}$/, 'Enter a valid phone number')

const cnicSchema = z.union([
  z.literal(''),
  z.string().min(1, 'CNIC is required'),
])

/** Empty number inputs stay undefined instead of coercing "" → 0. */
const moneyOptional = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) return undefined
  if (typeof value === 'number' && Number.isNaN(value)) return undefined
  return value
}, z.coerce.number().min(0, 'Must be 0 or more').optional())

export const employeeFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  phone: phoneSchema,
  cnic: cnicSchema,
  role: z.string().min(1, 'Select a role').optional(),
  jobTitle: z.string().trim().min(1, 'Job title is required').max(120, 'Job title is too long'),
  department: z.enum(departmentValues, { message: 'Select a department' }),
  homeAddress: z.string().optional(),
  status: z.enum(statusValues, { message: 'Select a status' }),
  joinDate: z.string().min(1, 'Join date is required'),
  managerId: z.string().optional(),
  sendInviteEmail: z.boolean().optional(),
  basicSalary: moneyOptional,
  hra: moneyOptional,
  utilityAllowance: moneyOptional,
  conveyanceAllowance: moneyOptional,
  bankName: z.string().trim().max(120).optional(),
  bankAccountNo: z.string().trim().max(64).optional(),
  employmentStage: z.enum(['probation', 'permanent']),
  confirmationDate: z.string().optional(),
  photo: z
    .instanceof(File)
    .refine((file) => file.size <= 2 * 1024 * 1024, 'Photo must be 2MB or smaller')
    .refine((file) => {
      const typeOk = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'].includes(file.type)
      const ext = file.name.split('.').pop()?.toLowerCase()
      const extOk = Boolean(ext && ['png', 'jpg', 'jpeg', 'svg'].includes(ext))
      return typeOk || extOk
    }, 'Photo must be PNG, JPG, or SVG')
    .optional(),
})

export const employeeCreateFormSchema = employeeFormSchema
  .omit({ status: true, cnic: true })
  .extend({
    role: z.string().min(1, 'Select a role'),
    cnic: z.string().min(1, 'CNIC is required'),
    photo: z
      .instanceof(File)
      .refine((file) => file.size <= 2 * 1024 * 1024, 'Photo must be 2MB or smaller')
      .refine((file) => {
        const typeOk = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'].includes(file.type)
        const ext = file.name.split('.').pop()?.toLowerCase()
        const extOk = Boolean(ext && ['png', 'jpg', 'jpeg', 'svg'].includes(ext))
        return typeOk || extOk
      }, 'Photo must be PNG, JPG, or SVG')
      .optional(),
  })

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>
export type EmployeeCreateFormValues = z.infer<typeof employeeCreateFormSchema>
