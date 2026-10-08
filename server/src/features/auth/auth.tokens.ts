import { createHash, randomBytes } from 'node:crypto'
import { signAccessToken, type TokenPayload } from '../../utils/jwt.js'
import type { IUser } from './user.model.js'

export function generateOpaqueRefreshToken(): string {
  return randomBytes(32).toString('hex')
}

export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function signUserAccessToken(user: IUser): string {
  const payload: TokenPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    companyId: user.companyId ? user.companyId.toString() : null,
  }
  return signAccessToken(payload)
}

/** Matches the login "Remember for 30 days" cookie lifetime. */
export const REMEMBER_ME_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000

export function parseRefreshExpiresInMs(expiresIn: string): number {
  const match = /^(\d+)([dhms])$/.exec(expiresIn.trim())
  if (!match) return 7 * 24 * 60 * 60 * 1000

  const value = Number.parseInt(match[1], 10)
  const unit = match[2]

  switch (unit) {
    case 'd':
      return value * 24 * 60 * 60 * 1000
    case 'h':
      return value * 60 * 60 * 1000
    case 'm':
      return value * 60 * 1000
    case 's':
      return value * 1000
    default:
      return 7 * 24 * 60 * 60 * 1000
  }
}
