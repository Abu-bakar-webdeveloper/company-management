import type { NextFunction, Request, Response } from 'express'
import type { ZodType } from 'zod'
import { AppError } from '../utils/AppError.js'

type ValidationTarget = 'body' | 'query' | 'params'

export function validate(schema: ZodType, target: ValidationTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target])

    if (!result.success) {
      return next(
        new AppError('Validation failed', 400, 'VALIDATION_ERROR', result.error.flatten()),
      )
    }

    if (target === 'query') {
      req.validatedQuery = result.data
    } else {
      req[target] = result.data
    }
    next()
  }
}
