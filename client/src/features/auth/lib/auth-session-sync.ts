import { saveAuthSession } from '@/features/auth/lib/auth-storage'
import type { AuthSession } from '@/features/auth/model/types'

type SessionListener = (session: AuthSession) => void

let sessionListener: SessionListener | null = null

export function registerSessionListener(listener: SessionListener | null): void {
  sessionListener = listener
}

export function applyRefreshedSession(session: AuthSession): void {
  saveAuthSession(session)
  sessionListener?.(session)
}
