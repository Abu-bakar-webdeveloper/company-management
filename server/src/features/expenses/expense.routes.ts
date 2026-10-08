import { Router } from 'express'
import { protect } from '../../middleware/auth.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireActive } from '../../middleware/requireActive.js'
import { requirePermission } from '../../middleware/requirePermission.js'
import { requireCompanyHub } from '../../middleware/requireCompanyHub.js'
import { validate } from '../../middleware/validate.js'
import * as expenseController from './expense.controller.js'
import {
  approvedTotalQuerySchema,
  createExpenseSchema,
  listExpensesQuerySchema,
  updateExpenseSchema,
  updateExpenseStatusSchema,
} from './expense.validation.js'

const expenseRouter = Router()

expenseRouter.use(protect, requireActive, requireCompanyHub('finance'))

expenseRouter.get(
  '/',
  requirePermission('expenses:read'),
  validate(listExpensesQuerySchema, 'query'),
  asyncHandler(expenseController.listExpensesHandler),
)

expenseRouter.get(
  '/stats',
  requirePermission('expenses:read'),
  asyncHandler(expenseController.getExpenseStatsHandler),
)

expenseRouter.get(
  '/approved-total',
  requirePermission('expenses:read', 'salaries:write', 'salaries:read'),
  validate(approvedTotalQuerySchema, 'query'),
  asyncHandler(expenseController.getApprovedTotalHandler),
)

expenseRouter.post(
  '/',
  requirePermission('expenses:write'),
  validate(createExpenseSchema),
  asyncHandler(expenseController.createExpenseHandler),
)

expenseRouter.get(
  '/:id',
  requirePermission('expenses:read'),
  asyncHandler(expenseController.getExpenseHandler),
)

expenseRouter.patch(
  '/:id',
  requirePermission('expenses:write'),
  validate(updateExpenseSchema),
  asyncHandler(expenseController.updateExpenseHandler),
)

expenseRouter.patch(
  '/:id/status',
  requirePermission('expenses:write'),
  validate(updateExpenseStatusSchema),
  asyncHandler(expenseController.updateExpenseStatusHandler),
)

expenseRouter.delete(
  '/:id',
  requirePermission('expenses:write'),
  asyncHandler(expenseController.deleteExpenseHandler),
)

export default expenseRouter
