import { Router } from 'express'
import { protect } from '../../middleware/auth.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireActive } from '../../middleware/requireActive.js'
import { requirePermission } from '../../middleware/requirePermission.js'
import { validate } from '../../middleware/validate.js'
import * as reportController from './report.controller.js'
import {
  downloadQuerySchema,
  generateReportSchema,
  listReportsQuerySchema,
  platformMonthQuerySchema,
  platformReportKeyParamSchema,
  reportIdParamSchema,
} from './report.validation.js'

const reportRouter = Router()

reportRouter.use(protect, requireActive)

reportRouter.get(
  '/overview',
  requirePermission('reports:read'),
  validate(listReportsQuerySchema, 'query'),
  asyncHandler(reportController.getOverviewStatsHandler),
)

reportRouter.get(
  '/overview/charts',
  requirePermission('reports:read'),
  validate(listReportsQuerySchema, 'query'),
  asyncHandler(reportController.getOverviewChartsHandler),
)

reportRouter.get(
  '/options',
  requirePermission('reports:read'),
  asyncHandler(reportController.getReportOptionsHandler),
)

reportRouter.get(
  '/platform/overview',
  requirePermission('reports:read'),
  validate(platformMonthQuerySchema, 'query'),
  asyncHandler(reportController.getPlatformOverviewHandler),
)

reportRouter.get(
  '/platform',
  requirePermission('reports:read'),
  validate(platformMonthQuerySchema, 'query'),
  asyncHandler(reportController.listPlatformReportsHandler),
)

reportRouter.get(
  '/platform/:reportKey/download',
  requirePermission('reports:read'),
  validate(platformReportKeyParamSchema, 'params'),
  validate(downloadQuerySchema, 'query'),
  asyncHandler(reportController.downloadPlatformReportHandler),
)

reportRouter.get(
  '/platform/:reportKey',
  requirePermission('reports:read'),
  validate(platformReportKeyParamSchema, 'params'),
  validate(platformMonthQuerySchema, 'query'),
  asyncHandler(reportController.getPlatformReportHandler),
)

reportRouter.get(
  '/',
  requirePermission('reports:read'),
  validate(listReportsQuerySchema, 'query'),
  asyncHandler(reportController.listReportsHandler),
)

reportRouter.post(
  '/',
  requirePermission('reports:read'),
  validate(generateReportSchema),
  asyncHandler(reportController.generateReportHandler),
)

reportRouter.get(
  '/:id/download',
  requirePermission('reports:read'),
  validate(reportIdParamSchema, 'params'),
  validate(downloadQuerySchema, 'query'),
  asyncHandler(reportController.downloadReportHandler),
)

reportRouter.get(
  '/:id',
  requirePermission('reports:read'),
  validate(reportIdParamSchema, 'params'),
  asyncHandler(reportController.getReportHandler),
)

export default reportRouter
