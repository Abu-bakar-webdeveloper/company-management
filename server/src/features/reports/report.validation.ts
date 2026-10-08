import { z } from 'zod'

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id')

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')

export const listReportsQuerySchema = z.object({
  module: z.string().trim().optional(),
  department: z.string().trim().optional(),
  dateRange: z.string().trim().optional(),
})

export const generateReportSchema = z.object({
  cycle: z.enum(['monthly', 'weekly']).default('monthly'),
  reportType: z.enum(['employees', 'projects', 'leaves', 'performance', 'expenses']),
  startDate: dateStringSchema,
  endDate: dateStringSchema,
  department: z.string().trim().default('All Departments'),
  employee: z.string().trim().default('All Employee'),
  status: z.string().trim().default('All Status'),
  project: z.string().trim().default('All Projects'),
  rating: z.string().trim().default('All Ratings'),
  exportFormat: z.enum(['pdf', 'excel', 'csv']).default('pdf'),
  includeCharts: z.boolean().default(true),
  includeSummary: z.boolean().default(true),
  groupBy: z.string().trim().default('Department'),
})

export const reportIdParamSchema = z.object({
  id: objectIdSchema,
})

export const downloadQuerySchema = z.object({
  format: z.enum(['pdf', 'excel', 'csv']).default('csv'),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Invalid month').optional(),
})

export const platformMonthQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Invalid month').optional(),
})

export const platformReportKeyParamSchema = z.object({
  reportKey: z.enum([
    'platform-performance',
    'revenue-summary',
    'admin-activity',
    'subscription-overview',
  ]),
})

export type ListReportsQuery = z.infer<typeof listReportsQuerySchema>
export type GenerateReportInput = z.infer<typeof generateReportSchema>
export type DownloadQuery = z.infer<typeof downloadQuerySchema>
export type PlatformMonthQuery = z.infer<typeof platformMonthQuerySchema>
