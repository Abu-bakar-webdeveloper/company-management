import { env } from '../../config/env.js'
import { AppError } from '../../utils/AppError.js'
import { consumeInviteToken, createInviteToken } from '../../services/invite.service.js'
import { Company } from '../companies/company.model.js'
import {
  buildResetPasswordUrl,
  companyEmailBrand,
  platformEmailBrand,
  sendPasswordResetEmail,
} from '../../services/mail.service.js'
import type { AuthUser, LoginResult, RefreshResult, TokenMeta } from './auth.types.js'
import { assertCompanyNotSuspended } from './assertCompanyAccess.js'
import { enrichAuthUser } from './auth-user.helper.js'
import {
  generateOpaqueRefreshToken,
  hashRefreshToken,
  parseRefreshExpiresInMs,
  REMEMBER_ME_MAX_AGE_MS,
  signUserAccessToken,
} from './auth.tokens.js'
import { RefreshToken } from './refreshToken.model.js'
import { User, type IUser } from './user.model.js'
import { dispatchDomainEventSafe } from '../notifications/notification.service.js'
import type {
  AcceptInviteInput,
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
} from './auth.validation.js'

function refreshTtlMs(rememberMe: boolean): number {
  return rememberMe
    ? REMEMBER_ME_MAX_AGE_MS
    : parseRefreshExpiresInMs(env.JWT_REFRESH_EXPIRES_IN)
}

function tokenRememberMe(rememberMe: boolean | undefined): boolean {
  return rememberMe !== false
}

async function persistRefreshToken(
  userId: IUser['_id'],
  rawRefreshToken: string,
  meta: TokenMeta,
  rememberMe: boolean,
): Promise<void> {
  const expiresAt = new Date(Date.now() + refreshTtlMs(rememberMe))

  await RefreshToken.create({
    userId,
    tokenHash: hashRefreshToken(rawRefreshToken),
    expiresAt,
    rememberMe,
    userAgent: meta.userAgent,
    ip: meta.ip,
  })
}

async function createTokenPair(
  user: IUser,
  meta: TokenMeta,
  rememberMe: boolean,
): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = signUserAccessToken(user)
  const refreshToken = generateOpaqueRefreshToken()
  await persistRefreshToken(user._id, refreshToken, meta, rememberMe)
  return { accessToken, refreshToken }
}

async function revokeAllUserRefreshTokens(userId: IUser['_id']): Promise<void> {
  await RefreshToken.updateMany(
    { userId, revokedAt: null },
    { revokedAt: new Date() },
  )
}

export async function loginUser(
  credentials: LoginInput,
  meta: TokenMeta,
): Promise<LoginResult> {
  const user = await User.findOne({ email: credentials.email.toLowerCase() }).select('+password')

  if (!user || !(await user.comparePassword(credentials.password))) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS')
  }

  if (user.status === 'pending') {
    throw new AppError(
      'Account setup incomplete. Please accept your invitation email to set your password.',
      403,
      'ACCOUNT_PENDING',
    )
  }

  if (user.status === 'suspended') {
    throw new AppError(
      'Your account has been suspended. Contact your administrator.',
      403,
      'ACCOUNT_SUSPENDED',
    )
  }

  await assertCompanyNotSuspended(user.companyId?.toString())

  const rememberMe = tokenRememberMe(credentials.rememberMe)
  const { accessToken, refreshToken } = await createTokenPair(user, meta, rememberMe)

  return {
    user: await enrichAuthUser(user),
    accessToken,
    refreshToken,
  }
}

/** Concurrent multi-tab refreshes often hit the just-rotated cookie within this window. */
const REFRESH_REUSE_GRACE_MS = 15_000

export async function refreshAccessToken(
  rawRefreshToken: string,
  meta: TokenMeta,
): Promise<RefreshResult> {
  const tokenHash = hashRefreshToken(rawRefreshToken)
  const record = await RefreshToken.findOne({ tokenHash })

  if (!record) {
    throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN')
  }

  if (record.revokedAt) {
    const revokedAgo = Date.now() - record.revokedAt.getTime()
    // Grace for legitimate multi-tab races — issue a new pair without revoke-all.
    if (revokedAgo <= REFRESH_REUSE_GRACE_MS) {
      const user = await User.findById(record.userId)
      if (!user) {
        throw new AppError('User not found', 401, 'INVALID_REFRESH_TOKEN')
      }
      if (user.status === 'pending') {
        throw new AppError('Account setup incomplete', 403, 'ACCOUNT_PENDING')
      }
      if (user.status === 'suspended') {
        throw new AppError('Account suspended', 403, 'ACCOUNT_SUSPENDED')
      }
      await assertCompanyNotSuspended(user.companyId?.toString())
      const rememberMe = tokenRememberMe(record.rememberMe)
      const { accessToken, refreshToken } = await createTokenPair(user, meta, rememberMe)
      return {
        user: await enrichAuthUser(user),
        accessToken,
        refreshToken,
        rememberMe,
      }
    }

    await revokeAllUserRefreshTokens(record.userId)
    throw new AppError('Refresh token reuse detected', 401, 'REFRESH_TOKEN_REUSE')
  }

  if (record.expiresAt.getTime() <= Date.now()) {
    record.revokedAt = new Date()
    await record.save()
    throw new AppError('Refresh token expired', 401, 'REFRESH_TOKEN_EXPIRED')
  }

  const user = await User.findById(record.userId)
  if (!user) {
    throw new AppError('User not found', 401, 'INVALID_REFRESH_TOKEN')
  }

  if (user.status === 'pending') {
    throw new AppError('Account setup incomplete', 403, 'ACCOUNT_PENDING')
  }

  if (user.status === 'suspended') {
    throw new AppError('Account suspended', 403, 'ACCOUNT_SUSPENDED')
  }

  await assertCompanyNotSuspended(user.companyId?.toString())

  record.revokedAt = new Date()
  await record.save()

  const rememberMe = tokenRememberMe(record.rememberMe)
  const { accessToken, refreshToken } = await createTokenPair(user, meta, rememberMe)

  return {
    user: await enrichAuthUser(user),
    accessToken,
    refreshToken,
    rememberMe,
  }
}

export async function logoutUser(rawRefreshToken: string | null): Promise<void> {
  if (!rawRefreshToken) return

  const tokenHash = hashRefreshToken(rawRefreshToken)
  await RefreshToken.deleteOne({ tokenHash })
}

export async function getUserById(userId: string): Promise<AuthUser> {
  const user = await User.findById(userId)
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  }
  await assertCompanyNotSuspended(user.companyId?.toString())
  return enrichAuthUser(user)
}

export async function acceptInvite(payload: AcceptInviteInput): Promise<AuthUser> {
  const userId = await consumeInviteToken(payload.token, 'invite')
  const user = await User.findById(userId).select('+password')

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  }

  await assertCompanyNotSuspended(user.companyId?.toString())

  user.password = payload.password
  user.status = 'active'
  await user.save()

  await revokeAllUserRefreshTokens(user._id)

  if (user.companyId) {
    await dispatchDomainEventSafe({
      type: 'user.invite_accepted',
      actor: {
        id: user._id.toString(),
        fullName: user.fullName,
        companyId: user.companyId.toString(),
      },
      entityId: user._id.toString(),
      subjectUserId: user._id.toString(),
      context: { subjectName: user.fullName },
    })
  }

  return enrichAuthUser(user)
}

export async function requestPasswordReset(payload: ForgotPasswordInput): Promise<void> {
  const user = await User.findOne({ email: payload.email.toLowerCase() })

  if (!user || user.status === 'pending') {
    return
  }

  const rawToken = await createInviteToken(user._id.toString(), 'password_reset')
  const resetUrl = buildResetPasswordUrl(rawToken)

  let brand = platformEmailBrand()
  let companyName: string | undefined
  if (user.companyId) {
    const company = await Company.findById(user.companyId).select(
      'name logoUrl primaryColor secondaryColor email phone addressLine city country postalCode',
    )
    if (company) {
      brand = companyEmailBrand(company)
      companyName = company.name
    }
  }

  await sendPasswordResetEmail({
    to: user.email,
    resetUrl,
    recipientName: user.fullName,
    brand,
    companyName,
  })
}

export async function resetPassword(payload: ResetPasswordInput): Promise<void> {
  const userId = await consumeInviteToken(payload.token, 'password_reset')
  const user = await User.findById(userId).select('+password')

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  }

  user.password = payload.password
  await user.save()

  await revokeAllUserRefreshTokens(user._id)
}
