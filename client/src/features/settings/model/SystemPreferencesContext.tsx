import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { settingsApi } from '@/features/settings/api/settingsApi'
import { applySystemPreferences } from '@/features/settings/lib/applyPreferences'
import {
  loadSystemPreferences,
  sanitizeSystemPreferences,
} from '@/features/settings/lib/preferences-storage'
import type { SystemPreferences } from '@/features/settings/model/types'

type SystemPreferencesContextValue = {
  preferences: SystemPreferences
  isLoading: boolean
  saving: boolean
  updatePreference: <K extends keyof SystemPreferences>(
    key: K,
    value: SystemPreferences[K],
  ) => void
  updatePreferences: (patch: Partial<SystemPreferences>) => void
  savePreferences: (next?: SystemPreferences) => Promise<void>
  reloadPreferences: () => Promise<void>
  runBackup: () => Promise<void>
}

const SystemPreferencesContext = createContext<SystemPreferencesContextValue | null>(null)

export function SystemPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<SystemPreferences>(() => loadSystemPreferences())
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    void settingsApi.getSystemPreferences().then((prefs) => {
      const sanitized = sanitizeSystemPreferences(prefs)
      setPreferences(sanitized)
      applySystemPreferences(sanitized)
      setIsLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!isLoading) {
      applySystemPreferences(preferences)
    }
  }, [preferences, isLoading])

  const updatePreference = useCallback(
    <K extends keyof SystemPreferences>(key: K, value: SystemPreferences[K]) => {
      setPreferences((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  const updatePreferences = useCallback((patch: Partial<SystemPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...patch }))
  }, [])

  const savePreferences = useCallback(async (next?: SystemPreferences) => {
    const payload = sanitizeSystemPreferences(next ?? preferences)
    setSaving(true)
    try {
      await settingsApi.saveSystemPreferences(payload)
      setPreferences(payload)
      applySystemPreferences(payload)
    } finally {
      setSaving(false)
    }
  }, [preferences])

  const reloadPreferences = useCallback(async () => {
    const prefs = sanitizeSystemPreferences(await settingsApi.getSystemPreferences())
    setPreferences(prefs)
    applySystemPreferences(prefs)
  }, [])

  const runBackup = useCallback(async () => {
    await settingsApi.runBackup()
  }, [])

  const value = useMemo<SystemPreferencesContextValue>(
    () => ({
      preferences,
      isLoading,
      saving,
      updatePreference,
      updatePreferences,
      savePreferences,
      reloadPreferences,
      runBackup,
    }),
    [
      preferences,
      isLoading,
      saving,
      updatePreference,
      updatePreferences,
      savePreferences,
      reloadPreferences,
      runBackup,
    ],
  )

  return (
    <SystemPreferencesContext.Provider value={value}>
      {children}
    </SystemPreferencesContext.Provider>
  )
}

export function useSystemPreferences(): SystemPreferencesContextValue {
  const ctx = useContext(SystemPreferencesContext)
  if (!ctx) {
    throw new Error('useSystemPreferences must be used within SystemPreferencesProvider')
  }
  return ctx
}
