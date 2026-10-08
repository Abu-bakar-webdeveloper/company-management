import type { Response } from 'express'

export type ApiErrorBody = {
  message: string
  code?: string
  details?: unknown
}

export type ApiSuccessBody<T> = {
  success: true
  data: T
  message?: string
}

export type ApiFailureBody = {
  success: false
  error: ApiErrorBody
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  options: { message?: string; statusCode?: number } = {},
): Response {
  const { message, statusCode = 200 } = options
  const body: ApiSuccessBody<T> = { success: true, data }
  if (message) body.message = message
  return res.status(statusCode).json(body)
}

export function sendError(
  res: Response,
  message: string,
  options: { statusCode?: number; code?: string; details?: unknown } = {},
): Response {
  const { statusCode = 500, code, details } = options
  const body: ApiFailureBody = {
    success: false,
    error: { message, ...(code && { code }), ...(details !== undefined && { details }) },
  }
  return res.status(statusCode).json(body)
}
