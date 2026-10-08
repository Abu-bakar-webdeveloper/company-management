import { z } from 'zod'

const punchClientLocationSchema = z
  .object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    accuracyMeters: z.number().min(0).max(100_000).optional(),
    label: z.string().trim().max(200).optional(),
  })
  .strict()

export const punchSchema = z.object({
  type: z.enum(['clock_in', 'break_start', 'break_end', 'clock_out']),
  location: punchClientLocationSchema.optional(),
})

export const listAttendanceQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z
    .enum(['present', 'late', 'absent', 'on_leave', 'half_day', 'weekend', 'holiday', 'not_arrived'])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  scope: z.enum(['mine', 'team', 'company']).optional(),
})

export const dashboardQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  scope: z.enum(['mine', 'team', 'company']).optional(),
  department: z.string().optional(),
  weekFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export const updateAttendanceDaySchema = z.object({
  status: z
    .enum(['present', 'late', 'absent', 'on_leave', 'half_day'])
    .optional(),
  clockInAt: z.string().datetime().nullable().optional(),
  clockOutAt: z.string().datetime().nullable().optional(),
  notes: z.string().max(500).optional(),
  totalWorkMinutes: z.number().int().min(0).optional(),
})

const officeSiteSchema = z.object({
  name: z.string().trim().min(1).max(100),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radiusMeters: z.number().int().min(50).max(5000).default(200),
})

export const updateAttendanceSettingsSchema = z.object({
  timezone: z.string().min(1).max(64).optional(),
  workDays: z.array(z.number().int().min(0).max(6)).min(1).max(7).optional(),
  defaultShift: z
    .object({
      start: z.string().regex(/^\d{2}:\d{2}$/),
      end: z.string().regex(/^\d{2}:\d{2}$/),
      breakMinutes: z.number().int().min(0).max(480),
      graceMinutes: z.number().int().min(0).max(180),
    })
    .optional(),
  halfDayHours: z.number().min(0).max(12).optional(),
  fullDayHours: z.number().min(0).max(24).optional(),
  officeSites: z.array(officeSiteSchema).max(20).optional(),
})

export const exportAttendanceQuerySchema = z.object({
  employeeId: z.string().optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export type PunchInput = z.infer<typeof punchSchema>
export type ListAttendanceQuery = z.infer<typeof listAttendanceQuerySchema>
export type DashboardQuery = z.infer<typeof dashboardQuerySchema>
export type UpdateAttendanceDayInput = z.infer<typeof updateAttendanceDaySchema>
export type UpdateAttendanceSettingsInput = z.infer<typeof updateAttendanceSettingsSchema>
export type ExportAttendanceQuery = z.infer<typeof exportAttendanceQuerySchema>
