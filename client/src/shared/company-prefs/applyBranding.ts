import { normalizeHexColor } from '@/features/settings/lib/preference-utils'
import type { CompanyPrefs } from '@/shared/company-prefs/types'

/**
 * Company branding owns secondary color.
 * Primary accent + theme are applied by System Preferences → Appearance.
 */
export function applyCompanyBranding(prefs: CompanyPrefs): void {
  const root = document.documentElement
  const secondaryColor = normalizeHexColor(prefs.secondaryColor, '#136DEC')
  root.style.setProperty('--color-secondary', secondaryColor)
}
