import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { ZodError } from 'zod'
import { env } from '../config/env.js'
import { AppError } from '../utils/AppError.js'
import { sendError } from '../utils/apiResponse.js'

function isDuplicateKeyError(err: unknown): err is { code: number; keyValue?: Record<string, unknown> } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: number }).code === 11000
  )
}

function normalizeError(err: unknown): {
  statusCode: number
  message: string
  code?: string
  details?: unknown
} {
  if (err instanceof AppError) {
    return {
      statusCode: err.statusCode,
      message: err.message,
      code: err.code,
      details: err.details,
    }
  }

  if (err instanceof ZodError) {
    return {
      statusCode: 400,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: err.flatten(),
    }
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.fromEntries(
      Object.entries(err.errors).map(([field, e]) => [field, e.message]),
    )
    return {
      statusCode: 400,
      message: 'Database validation failed',
      code: 'MONGOOSE_VALIDATION_ERROR',
      details,
    }
  }

  if (err instanceof mongoose.Error.CastError) {
    return {
      statusCode: 400,
      message: `Invalid ${err.path}: ${String(err.value)}`,
      code: 'INVALID_ID',
    }
  }

  if (isDuplicateKeyError(err)) {
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field'
    return {
      statusCode: 409,
      message: `Duplicate value for ${field}`,
      code: 'DUPLICATE_KEY',
      details: err.keyValue,
    }
  }

  if (err instanceof jwt.JsonWebTokenError) {
    return {
      statusCode: 401,
      message: 'Invalid token',
      code: 'INVALID_TOKEN',
    }
  }

  if (err instanceof jwt.TokenExpiredError) {
    return {
      statusCode: 401,
      message: 'Token expired',
      code: 'TOKEN_EXPIRED',
    }
  }

  if (err instanceof Error) {
    return {
      statusCode: 500,
      message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
      code: 'INTERNAL_ERROR',
      details: env.NODE_ENV === 'production' ? undefined : err.stack,
    }
  }

  return {
    statusCode: 500,
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
  }
}

export function notFoundHandler(req: Request, res: Response) {
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, {
    statusCode: 404,
    code: 'NOT_FOUND',
  })
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const normalized = normalizeError(err)

  if (normalized.statusCode >= 500) {
    console.error(err)
  }

  return sendError(res, normalized.message, {
    statusCode: normalized.statusCode,
    code: normalized.code,
    details: normalized.details,
  })
}
