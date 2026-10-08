import jwt, { type SignOptions } from 'jsonwebtoken'
import { env } from '../config/env.js'

export type TokenPayload = {
  id: string
  email: string
  role: string
  companyId: string | null
}

export function signAccessToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
  }
  return jwt.sign(payload, env.JWT_SECRET, options)
}

/** @deprecated Use signAccessToken — kept for compatibility during migration */
export function signToken(payload: TokenPayload): string {
  return signAccessToken(payload)
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload
}
