import { createHash, randomBytes } from 'node:crypto'
import { env } from '../config/env.js'
import { InviteToken, type InviteTokenType } from '../features/auth/inviteToken.model.js'
import { AppError } from '../utils/AppError.js'

export function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex')
}

function getExpiryMs(type: InviteTokenType): number {
  const hours =
    type === 'password_reset' ? env.RESET_TOKEN_EXPIRES_HOURS : env.INVITE_TOKEN_EXPIRES_HOURS
  return hours * 60 * 60 * 1000
}

export async function createInviteToken(
  userId: string,
  type: InviteTokenType,
): Promise<string> {
  const rawToken = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + getExpiryMs(type))

  await InviteToken.updateMany({ userId, type, usedAt: null }, { usedAt: new Date() })

  await InviteToken.create({
    userId,
    tokenHash: hashToken(rawToken),
    type,
    expiresAt,
  })

  return rawToken
}

export async function consumeInviteToken(
  rawToken: string,
  type: InviteTokenType,
): Promise<string> {
  const tokenHash = hashToken(rawToken)
  const record = await InviteToken.findOne({ tokenHash, type, usedAt: null })

  if (!record) {
    throw new AppError('Invalid or expired token', 400, 'INVALID_TOKEN')
  }

  if (record.expiresAt.getTime() <= Date.now()) {
    record.usedAt = new Date()
    await record.save()
    throw new AppError('Token has expired', 400, 'TOKEN_EXPIRED')
  }

  record.usedAt = new Date()
  await record.save()

  return record.userId.toString()
}
