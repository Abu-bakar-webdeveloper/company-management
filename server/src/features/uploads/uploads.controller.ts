import type { Request, Response } from 'express'
import { AppError } from '../../utils/AppError.js'
import { sendSuccess } from '../../utils/apiResponse.js'
import type { UserRole } from '../auth/auth.types.js'
import { hasPermission, type Permission } from '../auth/permissions.js'
import { enrichAuthUser } from '../auth/auth-user.helper.js'
import { User } from '../auth/user.model.js'
import {
  createUploadSignatureForPurpose,
  type CloudinaryUploadPurpose,
} from '../../services/cloudinary.service.js'

function resolvePurpose(raw: unknown): CloudinaryUploadPurpose {
  if (raw === 'task') return 'task'
  if (raw === 'logo') return 'logo'
  if (raw === 'project') return 'project'
  if (raw === 'expense') return 'expense'
  return 'avatar'
}

export async function signCloudinaryUpload(req: Request, res: Response): Promise<void> {
  const purpose = resolvePurpose(req.body?.purpose ?? req.query?.purpose)

  const user = await User.findById(req.user!.id)
  if (!user) {
    throw new AppError('User not found', 401, 'UNAUTHORIZED')
  }

  const authUser = await enrichAuthUser(user)
  const role = authUser.role as UserRole
  const perms = authUser.permissions as Permission[] | undefined

  if (purpose === 'task') {
    if (!hasPermission(role, 'tasks:write', perms) && !hasPermission(role, 'projects:write', perms)) {
      throw new AppError('Insufficient permissions', 403, 'FORBIDDEN')
    }
  } else if (purpose === 'project') {
    if (!hasPermission(role, 'projects:write', perms)) {
      throw new AppError('Insufficient permissions', 403, 'FORBIDDEN')
    }
  } else if (purpose === 'expense') {
    if (!hasPermission(role, 'expenses:write', perms)) {
      throw new AppError('Insufficient permissions', 403, 'FORBIDDEN')
    }
  } else if (purpose === 'logo') {
    if (role !== 'superadmin' && !hasPermission(role, 'settings:admin', perms)) {
      throw new AppError('Insufficient permissions', 403, 'FORBIDDEN')
    }
  } else if (!hasPermission(role, 'employees:write', perms)) {
    throw new AppError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  const signature = createUploadSignatureForPurpose(purpose)
  sendSuccess(res, signature)
}
