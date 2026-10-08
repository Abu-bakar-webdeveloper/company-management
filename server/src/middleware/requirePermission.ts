import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../utils/AppError.js'
import type { Permission } from '../features/auth/permissions.js'
import { hasPermission } from '../features/auth/permissions.js'
import type { UserRole } from '../features/auth/auth.types.js'
import { enrichAuthUser } from '../features/auth/auth-user.helper.js'
import { User } from '../features/auth/user.model.js'

export function requirePermission(...required: Permission[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.id) {
      next(new AppError('Authentication required', 401, 'UNAUTHORIZED'))
      return
    }

    const user = await User.findById(req.user.id)
    if (!user) {
      next(new AppError('User not found', 401, 'UNAUTHORIZED'))
      return
    }

    const authUser = await enrichAuthUser(user)
    const role = authUser.role as UserRole

    const allowed = required.some((permission) =>
      hasPermission(role, permission, authUser.permissions),
    )

    if (!allowed) {
      next(new AppError('You do not have permission to perform this action', 403, 'FORBIDDEN'))
      return
    }

    next()
  }
}
