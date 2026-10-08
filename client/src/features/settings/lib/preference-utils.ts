import type { UserRole } from '@/features/auth/model/types'
import {
  isCompanyHubEnabled,
  type CompanyHub,
} from '@/features/auth/model/companyHubs'
import { loadSystemPreferences } from '@/features/settings/lib/preferences-storage'
import { getCompanyPrefs } from '@/shared/company-prefs/store'
import { formatCompanyDate, formatCompanyDateTime } from '@/shared/lib/format'

const LANGUAGE_CODES: Record<string, string> = {
  English: 'en',
  Urdu: 'ur',
  Arabic: 'ar',
}

const LANDING_PATHS: Record<string, string> = {
  Dashboard: '/dashboard',
  Projects: '/projects',
  Performance: '/performance',
}

const LANDING_PAGES: { label: string; hub: CompanyHub | null }[] = [
  { label: 'Dashboard', hub: null },
  { label: 'Projects', hub: 'work' },
  { label: 'Performance', hub: 'people' },
]

export function getLandingPageOptions(hubs?: readonly string[] | null): string[] {
  return LANDING_PAGES.filter(
    (page) => page.hub == null || isCompanyHubEnabled(hubs, page.hub),
  ).map((page) => page.label)
}

export function getLanguageCode(language: string): string {
  return LANGUAGE_CODES[language] ?? 'en'
}

export function getLandingPath(page: string, hubs?: readonly string[] | null): string {
  const allowed = getLandingPageOptions(hubs)
  const resolved = allowed.includes(page) ? page : 'Dashboard'
  return LANDING_PATHS[resolved] ?? '/dashboard'
}

const ADMIN_DASHBOARD_VIEWS = {
  Admin: 'admin',
  Manager: 'manager',
  Employee: 'employee',
} as const

export type AdminDashboardView =
  (typeof ADMIN_DASHBOARD_VIEWS)[keyof typeof ADMIN_DASHBOARD_VIEWS]

/** Admin-only preference for which dashboard variant to show at `/dashboard`. */
export function getAdminDashboardView(preference: string): AdminDashboardView {
  return ADMIN_DASHBOARD_VIEWS[preference as keyof typeof ADMIN_DASHBOARD_VIEWS] ?? 'admin'
}

export function getDefaultLandingForRole(
  role: UserRole,
  hubs?: readonly string[] | null,
): string {
  if (role === 'employee' && isCompanyHubEnabled(hubs, 'work')) return '/tasks'
  return '/dashboard'
}

export function parseMinutes(value: string): number {
  const match = value.match(/(\d+)/)
  return match ? Number(match[1]) : 30
}

/** @deprecated Prefer company dateFormat via formatCompanyDate. */
export function getDateLocale(dateFormat: string): string {
  return dateFormat === 'MM/DD/YYYY' ? 'en-US' : 'en-GB'
}

/** Uses company dateFormat (System Preferences dateFormat is ignored). */
export function formatPreferenceDate(iso: string): string {
  return formatCompanyDate(iso, getCompanyPrefs())
}

/** Uses company dateFormat; timeFormat still comes from System Preferences when available. */
export function formatPreferenceDateTime(iso: string): string {
  const hour12 = loadSystemPreferences().timeFormat !== '24h'
  return formatCompanyDateTime(iso, getCompanyPrefs(), { hour12 }).replace(' • ', ' ')
}

export const DEFAULT_PRIMARY_COLOR = '#136DEC'

const HEX_COLOR_RE = /^#([0-9a-fA-F]{6})$/

export function isValidHexColor(value: string | null | undefined): boolean {
  return typeof value === 'string' && HEX_COLOR_RE.test(value.trim())
}

/** Returns a safe #RRGGBB value for color inputs and CSS variables. */
export function normalizeHexColor(
  value: string | null | undefined,
  fallback = DEFAULT_PRIMARY_COLOR,
): string {
  if (!value) return fallback
  const trimmed = value.trim()
  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`
  if (!HEX_COLOR_RE.test(withHash)) return fallback
  return `#${withHash.slice(1).toUpperCase()}`
}

export function normalizeTheme(value: string | null | undefined): 'light' | 'dark' {
  return String(value ?? '').toLowerCase() === 'dark' ? 'dark' : 'light'
}

export function normalizeSidebarStyle(value: string | null | undefined): 'Expanded' | 'Collapsed' {
  return String(value ?? '').toLowerCase() === 'collapsed' ? 'Collapsed' : 'Expanded'
}

export function hexToRgba(hex: string, alpha: number): string {
  const normalized = normalizeHexColor(hex).replace('#', '')
  const r = Number.parseInt(normalized.slice(0, 2), 16)
  const g = Number.parseInt(normalized.slice(2, 4), 16)
  const b = Number.parseInt(normalized.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
