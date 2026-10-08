import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { getAccessToken } from '@/features/auth/lib/auth-storage'
import { ApiError, isTerminalAuthFailure } from '@/shared/api/errors'
import { refreshSession } from '@/shared/api/token-refresh'
import { notifyUnauthorized } from '@/shared/api/unauthorized'
import type { ApiEnvelope, ApiFailureBody } from '@/shared/api/types'

const AUTH_EXEMPT_PATHS = [
  '/auth/login',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/accept-invite',
  '/auth/refresh',
  '/auth/logout',
] as const

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

function isAuthExemptUrl(url: string | undefined): boolean {
  if (!url) return false
  return AUTH_EXEMPT_PATHS.some((path) => url.includes(path))
}

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

function toApiError(error: AxiosError): ApiError {
  const status = error.response?.status
  const payload = error.response?.data

  if (isApiFailureBody(payload)) {
    return new ApiError(
      payload.error.message,
      status,
      payload.error.code,
      payload.error.details,
    )
  }

  return new ApiError(error.message || 'Network error', status, undefined, error)
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => {
    if (response.config.responseType === 'blob' || response.data instanceof Blob) {
      return response
    }

    const payload = response.data
    if (isApiFailureBody(payload)) {
      throw new ApiError(
        payload.error.message,
        response.status,
        payload.error.code,
        payload.error.details,
      )
    }
    response.data = unwrapEnvelope(payload)
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !isAuthExemptUrl(originalRequest.url)
    ) {
      if (originalRequest._retry) {
        notifyUnauthorized()
        return Promise.reject(toApiError(error))
      }

      originalRequest._retry = true

      try {
        const session = await refreshSession()
        originalRequest.headers.Authorization = `Bearer ${session.accessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        if (isTerminalAuthFailure(refreshError)) {
          notifyUnauthorized()
        }
        return Promise.reject(
          refreshError instanceof ApiError ? refreshError : toApiError(error),
        )
      }
    }

    return Promise.reject(toApiError(error))
  },
)
