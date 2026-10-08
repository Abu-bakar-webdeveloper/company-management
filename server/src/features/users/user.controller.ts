import type { Request, Response } from 'express'
import { AppError } from '../../utils/AppError.js'
import { sendSuccess } from '../../utils/apiResponse.js'
import {
  createUserByAdmin,
  deleteUserByAdmin,
  getUserById,
  listManagerOptions,
  listUsers,
  resendUserInvite,
  updateUserByAdmin,
} from './user.service.js'
import type { UserRole } from '../auth/auth.types.js'
import type { CreateUserInput, ListUsersQuery, UpdateUserInput } from './user.validation.js'

function getActingAdmin(req: Request) {
  const companyId = req.user!.companyId
  if (!companyId) {
    throw new AppError('Company context required', 403, 'FORBIDDEN')
  }

  return {
    id: req.user!.id,
    companyId,
    role: req.user!.role as UserRole,
  }
}

export async function createUser(req: Request, res: Response): Promise<void> {
  const result = await createUserByAdmin(req.body as CreateUserInput, getActingAdmin(req))
  sendSuccess(res, result, { statusCode: 201, message: 'User created successfully' })
}

export async function listUsersHandler(req: Request, res: Response): Promise<void> {
  const result = await listUsers(req.validatedQuery as ListUsersQuery, getActingAdmin(req))
  sendSuccess(res, result)
}

export async function listManagersHandler(req: Request, res: Response): Promise<void> {
  const result = await listManagerOptions(getActingAdmin(req))
  sendSuccess(res, result)
}

export async function getUser(req: Request, res: Response): Promise<void> {
  const user = await getUserById(req.params.id as string, getActingAdmin(req))
  sendSuccess(res, { user })
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  const user = await updateUserByAdmin(
    req.params.id as string,
    req.body as UpdateUserInput,
    getActingAdmin(req),
  )
  sendSuccess(res, { user }, { message: 'User updated successfully' })
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  await deleteUserByAdmin(req.params.id as string, getActingAdmin(req))
  sendSuccess(res, { message: 'User deleted successfully' })
}

export async function resendInvite(req: Request, res: Response): Promise<void> {
  const result = await resendUserInvite(req.params.id as string, getActingAdmin(req))
  sendSuccess(res, result, { message: 'Invitation email sent' })
}
