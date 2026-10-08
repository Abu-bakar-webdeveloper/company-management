import type { Response } from 'express'
import { env } from '../../config/env.js'
import { REMEMBER_ME_MAX_AGE_MS } from './auth.tokens.js'

const REFRESH_COOKIE_PATH = '/api/v1/auth'

type CookieOptions = {
  rememberMe?: boolean
}

export function setRefreshCookie(res: Response, token: string, options: CookieOptions = {}) {
  const { rememberMe = true } = options

  res.cookie(env.REFRESH_TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: REFRESH_COOKIE_PATH,
    ...(rememberMe ? { maxAge: REMEMBER_ME_MAX_AGE_MS } : {}),
  })
}

export function clearRefreshCookie(res: Response) {
  res.cookie(env.REFRESH_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: REFRESH_COOKIE_PATH,
    maxAge: 0,
  })
}

export function getRefreshTokenFromCookie(cookies: Record<string, string | undefined>): string | null {
  const token = cookies[env.REFRESH_TOKEN_COOKIE_NAME]
  return token && token.length > 0 ? token : null
}
