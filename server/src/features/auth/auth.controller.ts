import type { Request, Response } from 'express'
import { AppError } from '../../utils/AppError.js'
import { sendSuccess } from '../../utils/apiResponse.js'
import { clearRefreshCookie, getRefreshTokenFromCookie, setRefreshCookie } from './auth.cookies.js'
import {
  acceptInvite,
  getUserById,
  loginUser,
  logoutUser,
  refreshAccessToken,
  requestPasswordReset,
  resetPassword,
} from './auth.service.js'
import type {
  AcceptInviteInput,
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
} from './auth.validation.js'

function extractMeta(req: Request) {
  return {
    userAgent: req.get('user-agent'),
    ip: req.ip,
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const body = req.body as LoginInput
  const result = await loginUser(body, extractMeta(req))

  setRefreshCookie(res, result.refreshToken, { rememberMe: body.rememberMe })

  sendSuccess(res, {
    user: result.user,
    accessToken: result.accessToken,
  })
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const rawToken = getRefreshTokenFromCookie(req.cookies as Record<string, string | undefined>)

  if (!rawToken) {
    throw new AppError('Refresh token required', 401, 'INVALID_REFRESH_TOKEN')
  }

  const result = await refreshAccessToken(rawToken, extractMeta(req))
  setRefreshCookie(res, result.refreshToken, { rememberMe: result.rememberMe })

  sendSuccess(res, {
    user: result.user,
    accessToken: result.accessToken,
  })
}

export async function logout(req: Request, res: Response): Promise<void> {
  const rawToken = getRefreshTokenFromCookie(req.cookies as Record<string, string | undefined>)
  await logoutUser(rawToken)
  clearRefreshCookie(res)
  sendSuccess(res, { message: 'Logged out successfully' })
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await getUserById(req.user!.id)
  sendSuccess(res, { user })
}

export async function acceptInviteHandler(req: Request, res: Response): Promise<void> {
  const user = await acceptInvite(req.body as AcceptInviteInput)
  sendSuccess(res, { user }, { message: 'Account activated successfully' })
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  await requestPasswordReset(req.body as ForgotPasswordInput)
  sendSuccess(res, {
    message: 'If an account exists for that email, a reset link has been sent.',
  })
}

export async function resetPasswordHandler(req: Request, res: Response): Promise<void> {
  await resetPassword(req.body as ResetPasswordInput)
  sendSuccess(res, { message: 'Password reset successfully' })
}
