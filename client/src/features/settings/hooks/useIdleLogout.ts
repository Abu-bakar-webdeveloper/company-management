import { useEffect, useRef } from 'react'
import { useAuth } from '@/features/auth/model/AuthContext'
import { parseMinutes } from '@/features/settings/lib/preference-utils'
import { useSystemPreferences } from '@/features/settings/model/SystemPreferencesContext'
import { refreshSession } from '@/shared/api/token-refresh'

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart'] as const

/**
 * If a timeout fires this much later than scheduled, the machine slept or the
 * tab was frozen. Do not treat that as idle — it would wipe "remember 30 days".
 */
const SLEEP_SLACK_MS = 2 * 60 * 1000

export function useIdleLogout() {
  const { isAuthenticated, logout } = useAuth()
  const { preferences } = useSystemPreferences()
  const logoutRef = useRef(logout)
  logoutRef.current = logout

  useEffect(() => {
    if (!isAuthenticated) return

    const timeoutMs = parseMinutes(preferences.sessionTimeout) * 60 * 1000
    let timer: number | undefined
    let scheduledAt = 0

    const clearTimer = () => {
      if (timer !== undefined) window.clearTimeout(timer)
      timer = undefined
    }

    const arm = () => {
      clearTimer()
      scheduledAt = Date.now()
      timer = window.setTimeout(() => {
        const lateness = Date.now() - scheduledAt - timeoutMs
        if (lateness > SLEEP_SLACK_MS) {
          void refreshSession().catch(() => {})
          arm()
          return
        }
        logoutRef.current()
      }, timeoutMs)
    }

    const onActivity = () => {
      arm()
    }

    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return
      if (Date.now() - scheduledAt > timeoutMs + SLEEP_SLACK_MS) {
        void refreshSession().catch(() => {})
        arm()
      }
    }

    arm()

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, onActivity, { passive: true })
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      clearTimer()
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, onActivity)
      }
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [isAuthenticated, preferences.sessionTimeout])
}
