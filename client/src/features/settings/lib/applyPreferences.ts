import {
  getLanguageCode,
  hexToRgba,
  normalizeHexColor,
  normalizeTheme,
} from '@/features/settings/lib/preference-utils'
import type { SystemPreferences } from '@/features/settings/model/types'

/** Applies theme, language, sidebar, and accent color to the document. */
export function applySystemPreferences(prefs: SystemPreferences): void {
  const root = document.documentElement
  const theme = normalizeTheme(prefs.theme)
  const primaryColor = normalizeHexColor(prefs.primaryColor)

  root.classList.toggle('dark', theme === 'dark')
  root.lang = getLanguageCode(prefs.language)
  root.dataset.sidebarStyle = prefs.sidebarStyle

  root.style.setProperty('--color-primary', primaryColor)
  root.style.setProperty('--color-primary-muted', hexToRgba(primaryColor, 0.1))
}
