import { apiClient } from '@/shared/api/axios'
import { refreshSession } from '@/shared/api/token-refresh'
import type {
  AcceptInvitePayload,
  AuthSession,
  AuthUser,
  ForgotPasswordPayload,
  LoginCredentials,
  RegisterPayload,
  ResetPasswordPayload,
} from '@/features/auth/model/types'
import { MOCK_USERS, type MockUserRecord } from '@/features/auth/model/mockUsers'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

let usersStore: MockUserRecord[] = [...MOCK_USERS]

function toPublicUser(user: MockUserRecord): AuthUser {
  const { password: _password, ...publicUser } = user
  void _password
  return publicUser
}

function nextUserId(): string {
  const max = usersStore.reduce((acc, u) => Math.max(acc, parseInt(u.id, 10)), 0)
  return String(max + 1)
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const { data } = await apiClient.post<{ user: AuthUser; accessToken: string }>(
      '/auth/login',
      credentials,
    )
    return { user: data.user, accessToken: data.accessToken }
  },

  async refresh(): Promise<AuthSession> {
    return refreshSession()
  },

  async getMe(): Promise<AuthUser> {
    const { data } = await apiClient.get<{ user: AuthUser }>('/auth/me')
    return data.user
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  },

  async acceptInvite(payload: AcceptInvitePayload): Promise<AuthUser> {
    const { data } = await apiClient.post<{ user: AuthUser }>('/auth/accept-invite', payload)
    return data.user
  },

  async requestPasswordReset(payload: ForgotPasswordPayload): Promise<void> {
    await apiClient.post('/auth/forgot-password', payload)
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await apiClient.post('/auth/reset-password', payload)
  },

  // Self-service registration is not yet exposed by the backend (users are
  // onboarded via invite). Kept as a mock so the Register UI stays functional.
  async register(payload: RegisterPayload): Promise<AuthUser> {
    await delay(800)

    const exists = usersStore.some(
      (u) => u.email.toLowerCase() === payload.email.toLowerCase(),
    )
    if (exists) {
      throw new Error('An account with this email already exists')
    }

    const user: MockUserRecord = {
      id: nextUserId(),
      email: payload.email,
      password: payload.password,
      fullName: payload.fullName,
      role: 'employee',
      status: 'pending',
      companyId: null,
    }

    usersStore = [...usersStore, user]
    return toPublicUser(user)
  },

  async resendVerificationEmail(payload: { email: string }): Promise<void> {
    await delay(500)
    void payload
  },
}
