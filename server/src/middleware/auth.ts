import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../utils/AppError.js'
import { verifyToken } from '../utils/jwt.js'

export function protect(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization

  if (!header?.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'))
  }

  const token = header.slice(7)

  try {
    req.user = verifyToken(token)
    next()
  } catch {
    next(new AppError('Invalid or expired token', 401, 'UNAUTHORIZED'))
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'))
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403, 'FORBIDDEN'))
    }

    next()
  }
}
