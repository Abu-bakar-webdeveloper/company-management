import { z } from 'zod'

const statusValues = ['in_progress', 'completed', 'delayed'] as const
const priorityValues = ['low', 'medium', 'high'] as const
const sourceValues = [
  'referral',
  'website',
  'rfp',
  'existing_client',
  'partner',
  'other',
] as const

export const projectSourceLabels: Record<(typeof sourceValues)[number], string> = {
  referral: 'Referral',
  website: 'Website',
  rfp: 'RFP',
  existing_client: 'Existing client',
  partner: 'Partner',
  other: 'Other',
}

export const projectFormSchema = z
  .object({
    name: z.string().min(1, 'Project name is required'),
    description: z.string().min(1, 'Description is required'),
    managerId: z.string().min(1, 'Select a project manager'),
    teamMemberIds: z.array(z.string()),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'Deadline is required'),
    priority: z.enum(priorityValues, { message: 'Select a priority' }),
    status: z.enum(statusValues, { message: 'Select a status' }),
    clientMode: z.enum(['existing', 'new', 'company']),
    clientId: z.string().optional(),
    newClientName: z.string().optional(),
    newClientEmail: z.string().email('Invalid email').optional().or(z.literal('')),
    newClientPhone: z.string().optional(),
    source: z.union([z.enum(sourceValues), z.literal('')]).optional(),
    sourceNote: z.string().optional(),
    contractValue: z.union([z.string(), z.number()]).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.clientMode === 'new' && !data.newClientName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Client name is required',
        path: ['newClientName'],
      })
    }
  })

export type ProjectFormValues = z.infer<typeof projectFormSchema>
