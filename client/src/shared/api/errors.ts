export class ApiError extends Error {
  readonly status?: number
  readonly code?: string
  readonly details?: unknown

  constructor(message: string, status?: number, code?: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

/** Codes that mean the refresh cookie is permanently unusable — clear local session. */
const TERMINAL_AUTH_CODES = new Set([
  'INVALID_REFRESH_TOKEN',
  'REFRESH_TOKEN_EXPIRED',
  'REFRESH_TOKEN_REUSE',
])

/**
 * True when the session must be cleared (invalid/expired/reused refresh).
 * False for rate limits, network blips, and other transient failures.
 */
export function isTerminalAuthFailure(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false
  if (error.status === 429 || error.code === 'RATE_LIMITED') return false
  if (error.code && TERMINAL_AUTH_CODES.has(error.code)) return true
  if (error.status === 401) return true
  if (error.status === 403 && error.code === 'ACCOUNT_PENDING') return true
  return false
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error && error.message) return error.message
  return fallback
}
