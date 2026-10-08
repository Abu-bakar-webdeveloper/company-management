import type { Request, Response } from 'express'
import { AppError } from '../../utils/AppError.js'
import { sendSuccess } from '../../utils/apiResponse.js'
import type { UserRole } from '../auth/auth.types.js'
import { enrichAuthUser } from '../auth/auth-user.helper.js'
import type { Permission } from '../auth/permissions.js'
import { User } from '../auth/user.model.js'
import {
  downloadPlatformReport,
  getPlatformOverviewStats,
  getPlatformReportDetail,
  listPlatformReports,
} from './platform-report.service.js'
import {
  buildReportActor,
  downloadReport,
  generateReport,
  getOverviewCharts,
  getOverviewStats,
  getReportById,
  getReportOptions,
  listReports,
} from './report.service.js'
import type {
  DownloadQuery,
  GenerateReportInput,
  ListReportsQuery,
  PlatformMonthQuery,
} from './report.validation.js'
import type { ExportFormat } from './report.model.js'

async function getReportActor(req: Request) {
  const companyId = req.user!.companyId
  if (!companyId) {
    throw new AppError('Company context required', 403, 'FORBIDDEN')
  }

  const user = await User.findById(req.user!.id)
  if (!user) {
    throw new AppError('User not found', 401, 'UNAUTHORIZED')
  }

  const authUser = await enrichAuthUser(user)
  return buildReportActor(
    req.user!.id,
    companyId,
    authUser.role as UserRole,
    (authUser.permissions ?? []) as Permission[],
  )
}

function assertSuperadmin(req: Request): void {
  if (req.user?.role !== 'superadmin') {
    throw new AppError('Superadmin access required', 403, 'FORBIDDEN')
  }
}

function sendFile(
  res: Response,
  file: { buffer: Buffer; filename: string; contentType: string },
): void {
  res.setHeader('Content-Type', file.contentType)
  res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`)
  res.setHeader('Content-Length', String(file.buffer.length))
  res.status(200).send(file.buffer)
}

export async function getOverviewStatsHandler(req: Request, res: Response): Promise<void> {
  const stats = await getOverviewStats(
    await getReportActor(req),
    req.validatedQuery as ListReportsQuery | undefined,
  )
  sendSuccess(res, { stats })
}

export async function getOverviewChartsHandler(req: Request, res: Response): Promise<void> {
  const charts = await getOverviewCharts(
    await getReportActor(req),
    req.validatedQuery as ListReportsQuery | undefined,
  )
  sendSuccess(res, { charts })
}

export async function getReportOptionsHandler(req: Request, res: Response): Promise<void> {
  const options = await getReportOptions(await getReportActor(req))
  sendSuccess(res, { options })
}

export async function listReportsHandler(req: Request, res: Response): Promise<void> {
  const reports = await listReports(
    await getReportActor(req),
    req.validatedQuery as ListReportsQuery,
  )
  sendSuccess(res, { reports })
}

export async function getReportHandler(req: Request, res: Response): Promise<void> {
  const report = await getReportById(await getReportActor(req), req.params.id as string)
  sendSuccess(res, { report })
}

export async function generateReportHandler(req: Request, res: Response): Promise<void> {
  const result = await generateReport(
    await getReportActor(req),
    req.body as GenerateReportInput,
  )
  sendSuccess(res, result, { statusCode: 201, message: 'Report generated' })
}

export async function downloadReportHandler(req: Request, res: Response): Promise<void> {
  const { format } = req.validatedQuery as DownloadQuery
  const file = await downloadReport(
    await getReportActor(req),
    req.params.id as string,
    format as ExportFormat,
  )
  sendFile(res, file)
}

export async function getPlatformOverviewHandler(req: Request, res: Response): Promise<void> {
  assertSuperadmin(req)
  const { month } = (req.validatedQuery ?? {}) as PlatformMonthQuery
  const result = await getPlatformOverviewStats(month)
  sendSuccess(res, result)
}

export async function listPlatformReportsHandler(req: Request, res: Response): Promise<void> {
  assertSuperadmin(req)
  const { month } = (req.validatedQuery ?? {}) as PlatformMonthQuery
  const reports = await listPlatformReports(month)
  sendSuccess(res, { reports })
}

export async function getPlatformReportHandler(req: Request, res: Response): Promise<void> {
  assertSuperadmin(req)
  const { month } = (req.validatedQuery ?? {}) as PlatformMonthQuery
  const report = await getPlatformReportDetail(req.params.reportKey as string, month)
  sendSuccess(res, { report })
}

export async function downloadPlatformReportHandler(req: Request, res: Response): Promise<void> {
  assertSuperadmin(req)
  const { format, month } = req.validatedQuery as DownloadQuery
  const file = await downloadPlatformReport(
    req.params.reportKey as string,
    format as ExportFormat,
    month,
  )
  sendFile(res, file)
}
