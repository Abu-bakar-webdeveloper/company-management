import { Router } from 'express'
import { protect } from '../../middleware/auth.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireActive } from '../../middleware/requireActive.js'
import { requirePermission } from '../../middleware/requirePermission.js'
import { requireCompanyHub } from '../../middleware/requireCompanyHub.js'
import { validate } from '../../middleware/validate.js'
import * as attendanceController from './attendance.controller.js'
import {
  dashboardQuerySchema,
  exportAttendanceQuerySchema,
  listAttendanceQuerySchema,
  punchSchema,
  updateAttendanceDaySchema,
  updateAttendanceSettingsSchema,
} from './attendance.validation.js'

const attendanceRouter = Router()

attendanceRouter.use(protect, requireActive, requireCompanyHub('people'))

attendanceRouter.post(
  '/punch',
  requirePermission('attendance:self'),
  validate(punchSchema),
  asyncHandler(attendanceController.punchHandler),
)

attendanceRouter.get(
  '/me/today',
  requirePermission('attendance:self'),
  asyncHandler(attendanceController.getTodayHandler),
)

attendanceRouter.get(
  '/me',
  requirePermission('attendance:self'),
  validate(listAttendanceQuerySchema, 'query'),
  asyncHandler(attendanceController.listMineHandler),
)

attendanceRouter.get(
  '/dashboard',
  requirePermission('attendance:manage', 'attendance:team'),
  validate(dashboardQuerySchema, 'query'),
  asyncHandler(attendanceController.dashboardHandler),
)

attendanceRouter.get(
  '/settings',
  requirePermission('attendance:settings', 'attendance:manage'),
  asyncHandler(attendanceController.getSettingsHandler),
)

attendanceRouter.put(
  '/settings',
  requirePermission('attendance:settings'),
  validate(updateAttendanceSettingsSchema),
  asyncHandler(attendanceController.updateSettingsHandler),
)

attendanceRouter.get(
  '/export',
  requirePermission('attendance:self', 'attendance:manage', 'attendance:team'),
  validate(exportAttendanceQuerySchema, 'query'),
  asyncHandler(attendanceController.exportHandler),
)

attendanceRouter.patch(
  '/days/:id',
  requirePermission('attendance:manage'),
  validate(updateAttendanceDaySchema),
  asyncHandler(attendanceController.updateDayHandler),
)

attendanceRouter.get(
  '/employees/:employeeId',
  requirePermission('attendance:self', 'attendance:manage', 'attendance:team'),
  validate(listAttendanceQuerySchema, 'query'),
  asyncHandler(attendanceController.listEmployeeHandler),
)

export default attendanceRouter
