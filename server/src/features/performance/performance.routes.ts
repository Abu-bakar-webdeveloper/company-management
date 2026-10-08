import { Router } from 'express'
import { protect } from '../../middleware/auth.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireActive } from '../../middleware/requireActive.js'
import { requirePermission } from '../../middleware/requirePermission.js'
import { requireCompanyHub } from '../../middleware/requireCompanyHub.js'
import { validate } from '../../middleware/validate.js'
import * as performanceController from './performance.controller.js'
import {
  createGoalSchema,
  createKpiTemplateSchema,
  createPerformanceReviewSchema,
  createReviewCycleSchema,
  listPerformanceQuerySchema,
  performanceAnalyticsQuerySchema,
  updateGoalSchema,
  updateKpiTemplateSchema,
  updatePerformanceReviewSchema,
  updateReviewCycleSchema,
} from './performance.validation.js'

const performanceRouter = Router()

performanceRouter.use(protect, requireActive, requireCompanyHub('people'))

performanceRouter.get(
  '/',
  requirePermission('performance:read'),
  validate(listPerformanceQuerySchema, 'query'),
  asyncHandler(performanceController.listPerformanceHandler),
)

performanceRouter.get(
  '/stats',
  requirePermission('performance:read'),
  asyncHandler(performanceController.getPerformanceStatsHandler),
)

performanceRouter.get(
  '/analytics',
  requirePermission('performance:read'),
  validate(performanceAnalyticsQuerySchema, 'query'),
  asyncHandler(performanceController.getPerformanceAnalyticsHandler),
)

performanceRouter.get(
  '/options',
  requirePermission('performance:read'),
  asyncHandler(performanceController.getPerformanceOptionsHandler),
)

performanceRouter.get(
  '/me',
  requirePermission('performance:read'),
  asyncHandler(performanceController.getMyPerformanceHandler),
)

performanceRouter.get(
  '/kpi-templates/active',
  requirePermission('performance:write'),
  asyncHandler(performanceController.getActiveKpiTemplateHandler),
)

performanceRouter.get(
  '/kpi-templates',
  requirePermission('performance:read'),
  asyncHandler(performanceController.listKpiTemplatesHandler),
)

performanceRouter.get(
  '/kpi-templates/:templateId',
  requirePermission('performance:read'),
  asyncHandler(performanceController.getKpiTemplateHandler),
)

performanceRouter.post(
  '/kpi-templates',
  requirePermission('performance:kpi-setup'),
  validate(createKpiTemplateSchema),
  asyncHandler(performanceController.createKpiTemplateHandler),
)

performanceRouter.patch(
  '/kpi-templates/:templateId',
  requirePermission('performance:kpi-setup'),
  validate(updateKpiTemplateSchema),
  asyncHandler(performanceController.updateKpiTemplateHandler),
)

performanceRouter.post(
  '/kpi-templates/:templateId/activate',
  requirePermission('performance:kpi-setup'),
  asyncHandler(performanceController.activateKpiTemplateHandler),
)

performanceRouter.get(
  '/audit-log',
  requirePermission('performance:read'),
  asyncHandler(performanceController.listAuditLogHandler),
)

performanceRouter.get(
  '/cycles',
  requirePermission('performance:read'),
  asyncHandler(performanceController.listCyclesHandler),
)

performanceRouter.post(
  '/cycles',
  requirePermission('performance:read'),
  validate(createReviewCycleSchema),
  asyncHandler(performanceController.createCycleHandler),
)

performanceRouter.patch(
  '/cycles/:cycleId',
  requirePermission('performance:read'),
  validate(updateReviewCycleSchema),
  asyncHandler(performanceController.updateCycleHandler),
)

performanceRouter.get(
  '/goals',
  requirePermission('performance:read'),
  asyncHandler(performanceController.listGoalsHandler),
)

performanceRouter.post(
  '/goals',
  requirePermission('performance:read'),
  validate(createGoalSchema),
  asyncHandler(performanceController.createGoalHandler),
)

performanceRouter.patch(
  '/goals/:goalId',
  requirePermission('performance:read'),
  validate(updateGoalSchema),
  asyncHandler(performanceController.updateGoalHandler),
)

performanceRouter.get(
  '/calibration',
  requirePermission('performance:read'),
  asyncHandler(performanceController.getCalibrationHandler),
)

performanceRouter.get(
  '/employees/:employeeId',
  requirePermission('performance:read'),
  asyncHandler(performanceController.getEmployeePerformanceDetailHandler),
)

performanceRouter.get(
  '/employees/:employeeId/metrics',
  requirePermission('performance:read'),
  asyncHandler(performanceController.getEmployeeMetricsHandler),
)

performanceRouter.get(
  '/employees/:employeeId/reviews',
  requirePermission('performance:read'),
  asyncHandler(performanceController.listEmployeeReviewsHandler),
)

performanceRouter.get(
  '/employees/:employeeId/summary',
  requirePermission('performance:read'),
  asyncHandler(performanceController.getEmployeeSummaryHandler),
)

performanceRouter.get(
  '/reviews/:reviewId',
  requirePermission('performance:read'),
  asyncHandler(performanceController.getReviewHandler),
)

performanceRouter.post(
  '/employees/:employeeId/reviews',
  requirePermission('performance:write'),
  validate(createPerformanceReviewSchema),
  asyncHandler(performanceController.createReviewHandler),
)

performanceRouter.patch(
  '/reviews/:reviewId',
  requirePermission('performance:write'),
  validate(updatePerformanceReviewSchema),
  asyncHandler(performanceController.updateReviewHandler),
)

export default performanceRouter
