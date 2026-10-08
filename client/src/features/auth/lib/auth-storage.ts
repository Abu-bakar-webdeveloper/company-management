import type { AuthSession } from '@/features/auth/model/types'

export const AUTH_STORAGE_KEY = 'bizflow_auth'

export function loadAuthSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

export function saveAuthSession(session: AuthSession): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

export function getAccessToken(): string | null {
  return loadAuthSession()?.accessToken ?? null
}
