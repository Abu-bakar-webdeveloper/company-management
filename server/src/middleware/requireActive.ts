import type { NextFunction, Request, Response } from 'express'
import { assertCompanyNotSuspended } from '../features/auth/assertCompanyAccess.js'
import { User } from '../features/auth/user.model.js'
import { AppError } from '../utils/AppError.js'

export async function requireActive(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'))
  }

  try {
    const user = await User.findById(req.user.id).select('status companyId')
    if (!user) {
      return next(new AppError('User not found', 404, 'USER_NOT_FOUND'))
    }

    if (user.status === 'pending') {
      return next(
        new AppError(
          'Account setup incomplete. Please accept your invitation email to set your password.',
          403,
          'ACCOUNT_PENDING',
        ),
      )
    }

    if (user.status === 'suspended') {
      return next(
        new AppError(
          'Your account has been suspended. Contact your administrator.',
          403,
          'ACCOUNT_SUSPENDED',
        ),
      )
    }

    await assertCompanyNotSuspended(user.companyId?.toString())
    next()
  } catch (error) {
    next(error)
  }
}
