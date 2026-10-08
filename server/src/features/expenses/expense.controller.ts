import type { Request, Response } from 'express'
import { AppError } from '../../utils/AppError.js'
import { sendSuccess } from '../../utils/apiResponse.js'
import type { UserRole } from '../auth/auth.types.js'
import { enrichAuthUser } from '../auth/auth-user.helper.js'
import type { Permission } from '../auth/permissions.js'
import { User } from '../auth/user.model.js'
import {
  buildExpenseActor,
  createExpense,
  deleteExpense,
  getApprovedExpensesTotal,
  getExpenseById,
  getExpenseStats,
  listExpenses,
  updateExpense,
  updateExpenseStatus,
} from './expense.service.js'
import type {
  ApprovedTotalQuery,
  CreateExpenseInput,
  ListExpensesQuery,
  UpdateExpenseInput,
  UpdateExpenseStatusInput,
} from './expense.validation.js'

async function getExpenseActor(req: Request) {
  const companyId = req.user!.companyId
  if (!companyId) {
    throw new AppError('Company context required', 403, 'FORBIDDEN')
  }

  const user = await User.findById(req.user!.id)
  if (!user) {
    throw new AppError('User not found', 401, 'UNAUTHORIZED')
  }

  const authUser = await enrichAuthUser(user)
  return buildExpenseActor(
    req.user!.id,
    companyId,
    authUser.role as UserRole,
    authUser.fullName,
    (authUser.permissions ?? []) as Permission[],
  )
}

export async function listExpensesHandler(req: Request, res: Response): Promise<void> {
  const result = await listExpenses(
    req.validatedQuery as ListExpensesQuery,
    await getExpenseActor(req),
  )
  sendSuccess(res, result)
}

export async function getExpenseStatsHandler(req: Request, res: Response): Promise<void> {
  const result = await getExpenseStats(await getExpenseActor(req))
  sendSuccess(res, result)
}

export async function getApprovedTotalHandler(req: Request, res: Response): Promise<void> {
  const result = await getApprovedExpensesTotal(
    req.validatedQuery as ApprovedTotalQuery,
    await getExpenseActor(req),
  )
  sendSuccess(res, result)
}

export async function getExpenseHandler(req: Request, res: Response): Promise<void> {
  const expense = await getExpenseById(req.params.id as string, await getExpenseActor(req))
  sendSuccess(res, { expense })
}

export async function createExpenseHandler(req: Request, res: Response): Promise<void> {
  const expense = await createExpense(req.body as CreateExpenseInput, await getExpenseActor(req))
  sendSuccess(res, { expense }, { statusCode: 201, message: 'Expense created successfully' })
}

export async function updateExpenseHandler(req: Request, res: Response): Promise<void> {
  const expense = await updateExpense(
    req.params.id as string,
    req.body as UpdateExpenseInput,
    await getExpenseActor(req),
  )
  sendSuccess(res, { expense }, { message: 'Expense updated successfully' })
}

export async function updateExpenseStatusHandler(req: Request, res: Response): Promise<void> {
  const expense = await updateExpenseStatus(
    req.params.id as string,
    req.body as UpdateExpenseStatusInput,
    await getExpenseActor(req),
  )
  sendSuccess(res, { expense }, { message: 'Expense status updated successfully' })
}

export async function deleteExpenseHandler(req: Request, res: Response): Promise<void> {
  await deleteExpense(req.params.id as string, await getExpenseActor(req))
  sendSuccess(res, null, { message: 'Expense deleted successfully' })
}
