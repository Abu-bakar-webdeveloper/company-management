import {
  normalizeHexColor,
  normalizeSidebarStyle,
  normalizeTheme,
} from '@/features/settings/lib/preference-utils'
import { systemPreferences } from '@/features/settings/model/settingsData'
import type { SystemPreferences } from '@/features/settings/model/types'

export const PREFERENCES_STORAGE_KEY = 'bizflow_system_preferences'

export function sanitizeSystemPreferences(
  prefs: Partial<SystemPreferences> & Record<string, unknown>,
): SystemPreferences {
  return {
    ...systemPreferences,
    ...prefs,
    theme: normalizeTheme(prefs.theme as string | undefined),
    primaryColor: normalizeHexColor(prefs.primaryColor as string | undefined),
    sidebarStyle: normalizeSidebarStyle(prefs.sidebarStyle as string | undefined),
  } as SystemPreferences
}

export function loadSystemPreferences(): SystemPreferences {
  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY)
    if (!raw) return { ...systemPreferences }

    const parsed = JSON.parse(raw) as Partial<SystemPreferences>
    const sanitized = sanitizeSystemPreferences(parsed)

    const wasCorrupt =
      normalizeTheme(parsed.theme) !== parsed.theme ||
      normalizeHexColor(parsed.primaryColor) !== parsed.primaryColor ||
      normalizeSidebarStyle(parsed.sidebarStyle) !== parsed.sidebarStyle

    if (wasCorrupt) {
      saveSystemPreferencesToStorage(sanitized)
    }

    return sanitized
  } catch {
    return { ...systemPreferences }
  }
}

export function saveSystemPreferencesToStorage(prefs: SystemPreferences): void {
  localStorage.setItem(
    PREFERENCES_STORAGE_KEY,
    JSON.stringify(sanitizeSystemPreferences(prefs)),
  )
}
