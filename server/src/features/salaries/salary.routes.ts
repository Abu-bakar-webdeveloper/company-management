import { Router } from 'express'
import { protect } from '../../middleware/auth.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireActive } from '../../middleware/requireActive.js'
import { requirePermission } from '../../middleware/requirePermission.js'
import { requireCompanyHub } from '../../middleware/requireCompanyHub.js'
import { validate } from '../../middleware/validate.js'
import * as salaryController from './salary.controller.js'
import {
  bulkSalaryStatusSchema,
  createAssignmentSchema,
  createCompensationEventSchema,
  createLoanSchema,
  createPayrollComponentSchema,
  createSalarySchema,
  generateMonthSchema,
  listSalariesQuerySchema,
  salaryStatsQuerySchema,
  updateAssignmentSchema,
  updatePayrollComponentSchema,
  updatePayrollSettingsSchema,
  updateSalarySchema,
  updateSalaryStatusSchema,
} from './salary.validation.js'

const salaryRouter = Router()

salaryRouter.use(protect, requireActive, requireCompanyHub('finance'))

salaryRouter.get(
  '/',
  requirePermission('salaries:read', 'salaries:self'),
  validate(listSalariesQuerySchema, 'query'),
  asyncHandler(salaryController.listSalariesHandler),
)

salaryRouter.get(
  '/stats',
  requirePermission('salaries:read'),
  validate(salaryStatsQuerySchema, 'query'),
  asyncHandler(salaryController.getSalaryStatsHandler),
)

salaryRouter.get(
  '/me',
  requirePermission('salaries:self', 'salaries:read'),
  validate(listSalariesQuerySchema, 'query'),
  asyncHandler(salaryController.listMySalariesHandler),
)

salaryRouter.get(
  '/me/pf',
  requirePermission('salaries:self', 'salaries:read'),
  asyncHandler(salaryController.getMyPfHandler),
)

salaryRouter.get(
  '/settings',
  requirePermission('salaries:read', 'salaries:write'),
  asyncHandler(salaryController.getPayrollSettingsHandler),
)

salaryRouter.put(
  '/settings',
  requirePermission('salaries:write'),
  validate(updatePayrollSettingsSchema),
  asyncHandler(salaryController.updatePayrollSettingsHandler),
)

salaryRouter.post(
  '/settings/components',
  requirePermission('salaries:write'),
  validate(createPayrollComponentSchema),
  asyncHandler(salaryController.createPayrollComponentHandler),
)

salaryRouter.patch(
  '/settings/components/:id',
  requirePermission('salaries:write'),
  validate(updatePayrollComponentSchema),
  asyncHandler(salaryController.updatePayrollComponentHandler),
)

salaryRouter.delete(
  '/settings/components/:id',
  requirePermission('salaries:write'),
  asyncHandler(salaryController.deletePayrollComponentHandler),
)

salaryRouter.get(
  '/increment-due',
  requirePermission('salaries:read', 'salaries:write'),
  asyncHandler(salaryController.listIncrementDueHandler),
)

salaryRouter.get(
  '/employees/:employeeId/compensation',
  requirePermission('salaries:read', 'salaries:write'),
  asyncHandler(salaryController.getEmployeeCompensationHandler),
)

salaryRouter.post(
  '/employees/:employeeId/compensation',
  requirePermission('salaries:write'),
  validate(createCompensationEventSchema),
  asyncHandler(salaryController.createCompensationEventHandler),
)

salaryRouter.get(
  '/employees/:employeeId/assignments',
  requirePermission('salaries:read', 'salaries:write'),
  asyncHandler(salaryController.listAssignmentsHandler),
)

salaryRouter.post(
  '/employees/:employeeId/assignments',
  requirePermission('salaries:write'),
  validate(createAssignmentSchema),
  asyncHandler(salaryController.createAssignmentHandler),
)

salaryRouter.patch(
  '/employees/:employeeId/assignments/:assignmentId',
  requirePermission('salaries:write'),
  validate(updateAssignmentSchema),
  asyncHandler(salaryController.updateAssignmentHandler),
)

salaryRouter.delete(
  '/employees/:employeeId/assignments/:assignmentId',
  requirePermission('salaries:write'),
  asyncHandler(salaryController.deleteAssignmentHandler),
)

salaryRouter.get(
  '/employees/:employeeId/loans',
  requirePermission('salaries:read', 'salaries:write'),
  asyncHandler(salaryController.listLoansHandler),
)

salaryRouter.post(
  '/employees/:employeeId/loans',
  requirePermission('salaries:write'),
  validate(createLoanSchema),
  asyncHandler(salaryController.createLoanHandler),
)

salaryRouter.post(
  '/employees/:employeeId/loans/:loanId/cancel',
  requirePermission('salaries:write'),
  asyncHandler(salaryController.cancelLoanHandler),
)

salaryRouter.get(
  '/employee-defaults/:employeeId',
  requirePermission('salaries:write', 'salaries:read'),
  asyncHandler(salaryController.getEmployeeDefaultsHandler),
)

salaryRouter.get(
  '/pf/:employeeId',
  requirePermission('salaries:read', 'salaries:self'),
  asyncHandler(salaryController.getEmployeePfHandler),
)

salaryRouter.post(
  '/',
  requirePermission('salaries:write'),
  validate(createSalarySchema),
  asyncHandler(salaryController.createSalaryHandler),
)

salaryRouter.post(
  '/generate-month',
  requirePermission('salaries:write'),
  validate(generateMonthSchema),
  asyncHandler(salaryController.generateMonthHandler),
)

salaryRouter.patch(
  '/bulk-status',
  requirePermission('salaries:write'),
  validate(bulkSalaryStatusSchema),
  asyncHandler(salaryController.bulkSalaryStatusHandler),
)

salaryRouter.get(
  '/:id',
  requirePermission('salaries:read', 'salaries:self'),
  asyncHandler(salaryController.getSalaryHandler),
)

salaryRouter.patch(
  '/:id',
  requirePermission('salaries:write'),
  validate(updateSalarySchema),
  asyncHandler(salaryController.updateSalaryHandler),
)

salaryRouter.patch(
  '/:id/status',
  requirePermission('salaries:write'),
  validate(updateSalaryStatusSchema),
  asyncHandler(salaryController.updateSalaryStatusHandler),
)

salaryRouter.delete(
  '/:id',
  requirePermission('salaries:write'),
  asyncHandler(salaryController.deleteSalaryHandler),
)

salaryRouter.get(
  '/:id/slip',
  requirePermission('salaries:read', 'salaries:self'),
  asyncHandler(salaryController.downloadSalarySlipHandler),
)

export default salaryRouter
