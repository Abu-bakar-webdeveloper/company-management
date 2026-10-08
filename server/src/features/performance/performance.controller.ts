import type { Request, Response } from 'express'
import { AppError } from '../../utils/AppError.js'
import { sendSuccess } from '../../utils/apiResponse.js'
import type { UserRole } from '../auth/auth.types.js'
import { enrichAuthUser } from '../auth/auth-user.helper.js'
import type { Permission } from '../auth/permissions.js'
import { User } from '../auth/user.model.js'
import {
  activateKpiTemplate,
  createKpiTemplate,
  getActiveKpiTemplateDto,
  getKpiTemplateById,
  listKpiTemplates,
  updateKpiTemplate,
} from './kpi-template.service.js'
import {
  createGoal,
  createReviewCycle,
  getCalibration,
  listGoals,
  listPerformanceAuditLog,
  listReviewCycles,
  updateGoal,
  updateReviewCycle,
} from './performance-extended.service.js'
import {
  buildPerformanceActor,
  createPerformanceReview,
  getEmployeeMetrics,
  getEmployeePerformanceDetail,
  getEmployeePerformanceSummary,
  getMyPerformance,
  getPerformanceAnalytics,
  getPerformanceOptions,
  getPerformanceStats,
  getReviewById,
  listEmployeeReviews,
  listPerformanceRecords,
  updatePerformanceReview,
} from './performance.service.js'
import type {
  CreateGoalInput,
  CreateKpiTemplateInput,
  CreatePerformanceReviewInput,
  CreateReviewCycleInput,
  ListPerformanceQuery,
  PerformanceAnalyticsQuery,
  UpdateGoalInput,
  UpdateKpiTemplateInput,
  UpdatePerformanceReviewInput,
  UpdateReviewCycleInput,
} from './performance.validation.js'

async function getPerformanceActor(req: Request) {
  const companyId = req.user!.companyId
  if (!companyId) {
    throw new AppError('Company context required', 403, 'FORBIDDEN')
  }

  const user = await User.findById(req.user!.id)
  if (!user) {
    throw new AppError('User not found', 401, 'UNAUTHORIZED')
  }

  const authUser = await enrichAuthUser(user)
  return buildPerformanceActor(
    req.user!.id,
    companyId,
    authUser.role as UserRole,
    (authUser.permissions ?? []) as Permission[],
  )
}

export async function listPerformanceHandler(req: Request, res: Response): Promise<void> {
  const result = await listPerformanceRecords(
    await getPerformanceActor(req),
    req.query as unknown as ListPerformanceQuery,
  )
  sendSuccess(res, result)
}

export async function getPerformanceStatsHandler(req: Request, res: Response): Promise<void> {
  const stats = await getPerformanceStats(
    await getPerformanceActor(req),
    req.query.periodStart as string | undefined,
  )
  sendSuccess(res, { stats })
}

export async function getPerformanceAnalyticsHandler(req: Request, res: Response): Promise<void> {
  const analytics = await getPerformanceAnalytics(
    await getPerformanceActor(req),
    req.query as unknown as PerformanceAnalyticsQuery,
  )
  sendSuccess(res, { analytics })
}

export async function getPerformanceOptionsHandler(req: Request, res: Response): Promise<void> {
  const options = await getPerformanceOptions(await getPerformanceActor(req))
  sendSuccess(res, { options })
}

export async function getEmployeePerformanceDetailHandler(req: Request, res: Response): Promise<void> {
  const detail = await getEmployeePerformanceDetail(
    await getPerformanceActor(req),
    req.params.employeeId as string,
    req.query.periodStart as string | undefined,
  )
  sendSuccess(res, { detail })
}

export async function getEmployeeMetricsHandler(req: Request, res: Response): Promise<void> {
  const metrics = await getEmployeeMetrics(
    await getPerformanceActor(req),
    req.params.employeeId as string,
    req.query.periodStart as string | undefined,
  )
  sendSuccess(res, { metrics })
}

export async function listEmployeeReviewsHandler(req: Request, res: Response): Promise<void> {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 20
  const result = await listEmployeeReviews(
    await getPerformanceActor(req),
    req.params.employeeId as string,
    page,
    limit,
  )
  sendSuccess(res, result)
}

export async function getReviewHandler(req: Request, res: Response): Promise<void> {
  const review = await getReviewById(await getPerformanceActor(req), req.params.reviewId as string)
  sendSuccess(res, { review })
}

export async function createReviewHandler(req: Request, res: Response): Promise<void> {
  const review = await createPerformanceReview(
    await getPerformanceActor(req),
    req.params.employeeId as string,
    req.body as CreatePerformanceReviewInput,
  )
  sendSuccess(res, { review }, { statusCode: 201, message: 'Review saved successfully' })
}

export async function updateReviewHandler(req: Request, res: Response): Promise<void> {
  const review = await updatePerformanceReview(
    await getPerformanceActor(req),
    req.params.reviewId as string,
    req.body as UpdatePerformanceReviewInput,
  )
  sendSuccess(res, { review }, { message: 'Review updated successfully' })
}

export async function getEmployeeSummaryHandler(req: Request, res: Response): Promise<void> {
  const summary = await getEmployeePerformanceSummary(
    await getPerformanceActor(req),
    req.params.employeeId as string,
    req.query.periodStart as string | undefined,
  )
  sendSuccess(res, { summary })
}

export async function getMyPerformanceHandler(req: Request, res: Response): Promise<void> {
  const performance = await getMyPerformance(
    await getPerformanceActor(req),
    req.query.periodStart as string | undefined,
  )
  sendSuccess(res, { performance })
}

export async function listKpiTemplatesHandler(req: Request, res: Response): Promise<void> {
  const acting = await getPerformanceActor(req)
  const role = req.query.role as 'employee' | 'manager' | undefined
  const templates = await listKpiTemplates(
    acting.companyId,
    acting.role,
    acting.permissions,
    role,
  )
  sendSuccess(res, { templates })
}

export async function getActiveKpiTemplateHandler(req: Request, res: Response): Promise<void> {
  const acting = await getPerformanceActor(req)
  const role = (req.query.role as 'employee' | 'manager' | undefined) ?? 'employee'
  const template = await getActiveKpiTemplateDto(acting.companyId, role)
  sendSuccess(res, { template })
}

export async function getKpiTemplateHandler(req: Request, res: Response): Promise<void> {
  const acting = await getPerformanceActor(req)
  const template = await getKpiTemplateById(acting.companyId, req.params.templateId as string)
  sendSuccess(res, { template })
}

export async function createKpiTemplateHandler(req: Request, res: Response): Promise<void> {
  const acting = await getPerformanceActor(req)
  const template = await createKpiTemplate(
    acting.companyId,
    acting.role,
    acting.permissions,
    req.body as CreateKpiTemplateInput,
  )
  sendSuccess(res, { template }, { statusCode: 201, message: 'KPI template created' })
}

export async function updateKpiTemplateHandler(req: Request, res: Response): Promise<void> {
  const acting = await getPerformanceActor(req)
  const template = await updateKpiTemplate(
    acting.companyId,
    acting.role,
    acting.permissions,
    req.params.templateId as string,
    req.body as UpdateKpiTemplateInput,
  )
  sendSuccess(res, { template }, { message: 'KPI template updated' })
}

export async function activateKpiTemplateHandler(req: Request, res: Response): Promise<void> {
  const acting = await getPerformanceActor(req)
  const template = await activateKpiTemplate(
    acting.companyId,
    acting.role,
    acting.permissions,
    req.params.templateId as string,
  )
  sendSuccess(res, { template }, { message: 'KPI template activated' })
}

export async function listAuditLogHandler(req: Request, res: Response): Promise<void> {
  const acting = await getPerformanceActor(req)
  const entries = await listPerformanceAuditLog(acting, Number(req.query.limit) || 50)
  sendSuccess(res, { entries })
}

export async function listCyclesHandler(req: Request, res: Response): Promise<void> {
  const cycles = await listReviewCycles(await getPerformanceActor(req))
  sendSuccess(res, { cycles })
}

export async function createCycleHandler(req: Request, res: Response): Promise<void> {
  const cycle = await createReviewCycle(
    await getPerformanceActor(req),
    req.body as CreateReviewCycleInput,
  )
  sendSuccess(res, { cycle }, { statusCode: 201, message: 'Review cycle created' })
}

export async function updateCycleHandler(req: Request, res: Response): Promise<void> {
  const cycle = await updateReviewCycle(
    await getPerformanceActor(req),
    req.params.cycleId as string,
    req.body as UpdateReviewCycleInput,
  )
  sendSuccess(res, { cycle }, { message: 'Review cycle updated' })
}

export async function listGoalsHandler(req: Request, res: Response): Promise<void> {
  const goals = await listGoals(
    await getPerformanceActor(req),
    req.query.employeeId as string | undefined,
  )
  sendSuccess(res, { goals })
}

export async function createGoalHandler(req: Request, res: Response): Promise<void> {
  const goal = await createGoal(await getPerformanceActor(req), req.body as CreateGoalInput)
  sendSuccess(res, { goal }, { statusCode: 201, message: 'Goal created' })
}

export async function updateGoalHandler(req: Request, res: Response): Promise<void> {
  const goal = await updateGoal(
    await getPerformanceActor(req),
    req.params.goalId as string,
    req.body as UpdateGoalInput,
  )
  sendSuccess(res, { goal }, { message: 'Goal updated' })
}

export async function getCalibrationHandler(req: Request, res: Response): Promise<void> {
  const calibration = await getCalibration(
    await getPerformanceActor(req),
    req.query.periodStart as string | undefined,
  )
  sendSuccess(res, { calibration })
}
