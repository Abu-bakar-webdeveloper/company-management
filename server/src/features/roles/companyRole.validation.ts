import { z } from 'zod'
import { PERMISSIONS } from '../auth/permissions.js'

const permissionSchema = z.enum(PERMISSIONS)

export const createCompanyRoleSchema = z.object({
  name: z.string().trim().min(1, 'Role name is required').max(80),
  description: z.string().trim().max(240).optional(),
  baseRole: z.enum(['manager', 'hr', 'employee']),
  permissions: z.array(permissionSchema).min(1, 'At least one permission is required'),
})

/** Roles are locked after create; updates are not used for permission editing. */
export const updateCompanyRoleSchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    description: z.string().trim().max(240).optional(),
    permissions: z.array(permissionSchema).min(1).optional(),
    isLocked: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  })

export type CreateCompanyRoleInput = z.infer<typeof createCompanyRoleSchema>
export type UpdateCompanyRoleInput = z.infer<typeof updateCompanyRoleSchema>
