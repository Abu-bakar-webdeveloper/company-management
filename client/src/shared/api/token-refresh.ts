import axios, { type AxiosError } from 'axios'
import { applyRefreshedSession } from '@/features/auth/lib/auth-session-sync'
import type { AuthSession, AuthUser } from '@/features/auth/model/types'
import { ApiError } from '@/shared/api/errors'
import type { ApiEnvelope, ApiFailureBody } from '@/shared/api/types'

const REFRESH_LOCK_NAME = 'bizflow-auth-refresh'

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

function isApiFailureBody(data: unknown): data is ApiFailureBody {
  return (
    typeof data === 'object' &&
    data !== null &&
    'success' in data &&
    (data as ApiFailureBody).success === false
  )
}

function unwrapEnvelope<T>(data: unknown): T {
  if (
    typeof data === 'object' &&
    data !== null &&
    'success' in data &&
    (data as ApiEnvelope<T>).success === true &&
    'data' in data
  ) {
    return (data as ApiEnvelope<T> & { success: true }).data
  }
  return data as T
}

function toRefreshError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  const axiosError = error as AxiosError
  const status = axiosError.response?.status
  const payload = axiosError.response?.data

  if (isApiFailureBody(payload)) {
    return new ApiError(
      payload.error.message,
      status,
      payload.error.code,
      payload.error.details,
    )
  }

  return new ApiError(
    axiosError.message || 'Unable to refresh session',
    status,
    undefined,
    error,
  )
}

async function performRefresh(): Promise<AuthSession> {
  try {
    const response = await refreshClient.post('/auth/refresh')
    const data = unwrapEnvelope<{ user: AuthUser; accessToken: string }>(response.data)
    const session: AuthSession = { user: data.user, accessToken: data.accessToken }
    applyRefreshedSession(session)
    return session
  } catch (error) {
    throw toRefreshError(error)
  }
}

async function refreshWithCrossTabLock(): Promise<AuthSession> {
  const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined
  if (locks?.request) {
    return locks.request(REFRESH_LOCK_NAME, () => performRefresh())
  }
  return performRefresh()
}

let refreshInFlight: Promise<AuthSession> | null = null

export function refreshSession(): Promise<AuthSession> {
  if (!refreshInFlight) {
    refreshInFlight = refreshWithCrossTabLock().finally(() => {
      refreshInFlight = null
    })
  }

  return refreshInFlight
}
