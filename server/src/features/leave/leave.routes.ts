import { Router } from 'express'
import { protect } from '../../middleware/auth.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireActive } from '../../middleware/requireActive.js'
import { requirePermission } from '../../middleware/requirePermission.js'
import { requireCompanyHub } from '../../middleware/requireCompanyHub.js'
import { validate } from '../../middleware/validate.js'
import * as leaveController from './leave.controller.js'
import {
  createLeaveRequestSchema,
  createLeaveTypeSchema,
  leaveEncashmentSchema,
  listLeaveRequestsQuerySchema,
  updateLeaveRequestStatusSchema,
  updateLeaveTypeSchema,
} from './leave.validation.js'

const leaveRouter = Router()

leaveRouter.use(protect, requireActive, requireCompanyHub('people'))

leaveRouter.get(
  '/types',
  requirePermission('leave:manage', 'leave:request', 'leave:approve'),
  asyncHandler(leaveController.listLeaveTypesHandler),
)

leaveRouter.get(
  '/types/:id',
  requirePermission('leave:manage', 'leave:request', 'leave:approve'),
  asyncHandler(leaveController.getLeaveTypeHandler),
)

leaveRouter.post(
  '/types',
  requirePermission('leave:manage'),
  validate(createLeaveTypeSchema),
  asyncHandler(leaveController.createLeaveTypeHandler),
)

leaveRouter.patch(
  '/types/:id',
  requirePermission('leave:manage'),
  validate(updateLeaveTypeSchema),
  asyncHandler(leaveController.updateLeaveTypeHandler),
)

leaveRouter.delete(
  '/types/:id',
  requirePermission('leave:manage'),
  asyncHandler(leaveController.deleteLeaveTypeHandler),
)

leaveRouter.get(
  '/requests',
  requirePermission('leave:manage', 'leave:approve', 'leave:request'),
  validate(listLeaveRequestsQuerySchema, 'query'),
  asyncHandler(leaveController.listLeaveRequestsHandler),
)

leaveRouter.get(
  '/requests/stats',
  requirePermission('leave:manage', 'leave:approve', 'leave:request'),
  asyncHandler(leaveController.getLeaveRequestStatsHandler),
)

leaveRouter.get(
  '/requests/:id',
  requirePermission('leave:manage', 'leave:approve', 'leave:request'),
  asyncHandler(leaveController.getLeaveRequestHandler),
)

leaveRouter.post(
  '/requests',
  requirePermission('leave:request'),
  validate(createLeaveRequestSchema),
  asyncHandler(leaveController.createLeaveRequestHandler),
)

leaveRouter.patch(
  '/requests/:id/status',
  requirePermission('leave:approve', 'leave:manage'),
  validate(updateLeaveRequestStatusSchema),
  asyncHandler(leaveController.updateLeaveRequestStatusHandler),
)

leaveRouter.get(
  '/employees/:userId/summary',
  requirePermission('leave:manage', 'leave:approve', 'leave:request', 'employees:read'),
  asyncHandler(leaveController.getEmployeeLeaveSummaryHandler),
)

leaveRouter.post(
  '/encashment',
  requirePermission('leave:manage'),
  validate(leaveEncashmentSchema),
  asyncHandler(leaveController.runLeaveEncashmentHandler),
)

export default leaveRouter
