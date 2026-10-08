import { getCompanyPrefs } from '@/shared/company-prefs/store'
import type { CompanyPrefs } from '@/shared/company-prefs/types'

const CURRENCY_CODES: Record<string, string> = {
  pkr: 'PKR',
  usd: 'USD',
  gbp: 'GBP',
  aed: 'AED',
  eur: 'EUR',
}

const TIMEZONE_MAP: Record<string, string> = {
  'gmt+5': 'Asia/Karachi',
  'gmt+0': 'Europe/London',
  'gmt-5': 'America/New_York',
  'gmt+4': 'Asia/Dubai',
}

function resolveCurrencyCode(currency: string): string {
  const key = currency.trim().toLowerCase()
  if (CURRENCY_CODES[key]) return CURRENCY_CODES[key]
  const prefix = key.split(/[\s-]/)[0]?.toUpperCase()
  if (prefix && prefix.length === 3) return prefix
  return 'PKR'
}

function resolveTimeZone(timezone: string): string | undefined {
  const key = timezone.trim().toLowerCase()
  return TIMEZONE_MAP[key]
}

function getDateLocale(dateFormat: string): string {
  return dateFormat === 'MM/DD/YYYY' ? 'en-US' : 'en-GB'
}

function zonedDate(iso: string, prefs: CompanyPrefs): Date {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return date
  const timeZone = resolveTimeZone(prefs.timezone)
  if (!timeZone) return date

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '00'

  return new Date(
    Number(get('year')),
    Number(get('month')) - 1,
    Number(get('day')),
    Number(get('hour')) % 24,
    Number(get('minute')),
    Number(get('second')),
  )
}

/** Numeric date per company dateFormat (DD/MM/YYYY | MM/DD/YYYY | YYYY-MM-DD). */
export function formatCompanyDate(
  iso: string,
  prefs: CompanyPrefs = getCompanyPrefs(),
): string {
  const date = zonedDate(iso, prefs)
  if (Number.isNaN(date.getTime())) return iso

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = String(date.getFullYear())

  switch (prefs.dateFormat) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`
    case 'DD/MM/YYYY':
    default:
      return `${day}/${month}/${year}`
  }
}

export function formatCompanyLongDate(
  iso: string,
  prefs: CompanyPrefs = getCompanyPrefs(),
): string {
  const date = zonedDate(iso, prefs)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString(getDateLocale(prefs.dateFormat), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatCompanyShortDate(
  iso: string,
  prefs: CompanyPrefs = getCompanyPrefs(),
): string {
  const date = zonedDate(iso, prefs)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString(getDateLocale(prefs.dateFormat), {
    month: 'short',
    day: 'numeric',
  })
}

export function formatCompanyMediumDate(
  iso: string,
  prefs: CompanyPrefs = getCompanyPrefs(),
): string {
  const date = zonedDate(iso, prefs)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString(getDateLocale(prefs.dateFormat), {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatCompanyMonthYear(
  iso: string,
  prefs: CompanyPrefs = getCompanyPrefs(),
): string {
  const date = zonedDate(iso, prefs)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString(getDateLocale(prefs.dateFormat), {
    month: 'long',
    year: 'numeric',
  })
}

export function formatCompanyDateRange(
  start: string,
  end: string,
  prefs: CompanyPrefs = getCompanyPrefs(),
): string {
  const startDate = zonedDate(start, prefs)
  const endDate = zonedDate(end, prefs)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return `${start} – ${end}`
  }

  const sameYear = startDate.getFullYear() === endDate.getFullYear()
  const sameMonth = sameYear && startDate.getMonth() === endDate.getMonth()
  const locale = getDateLocale(prefs.dateFormat)

  if (start === end || (sameMonth && startDate.getDate() === endDate.getDate())) {
    return formatCompanyMediumDate(start, prefs)
  }

  const startStr = startDate.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
  const endStr = endDate.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  return `${startStr} – ${endStr}`
}

export function formatCompanyDateTime(
  iso: string,
  prefs: CompanyPrefs = getCompanyPrefs(),
  options?: { hour12?: boolean },
): string {
  const date = zonedDate(iso, prefs)
  if (Number.isNaN(date.getTime())) return iso
  const dateStr = formatCompanyMediumDate(iso, prefs)
  const timeStr = date.toLocaleTimeString(getDateLocale(prefs.dateFormat), {
    hour: '2-digit',
    minute: '2-digit',
    hour12: options?.hour12 ?? true,
  })
  return `${dateStr} • ${timeStr}`
}

export function formatCompanyMoney(
  amount: number,
  prefs: CompanyPrefs = getCompanyPrefs(),
): string {
  const currency = resolveCurrencyCode(prefs.currency)
  return new Intl.NumberFormat(getDateLocale(prefs.dateFormat), {
    style: 'currency',
    currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatCompactNumber(amount: number): string {
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  const trim = (value: number) =>
    value.toFixed(value >= 10 ? 0 : 1).replace(/\.0$/, '')

  if (abs >= 1_000_000_000) return `${sign}${trim(abs / 1_000_000_000)}B`
  if (abs >= 1_000_000) return `${sign}${trim(abs / 1_000_000)}M`
  if (abs >= 1_000) return `${sign}${trim(abs / 1_000)}k`
  return `${sign}${Math.round(abs)}`
}

/** Short money for tight UI (charts): `PKR 21k`, `USD 1.5M`. */
export function formatCompanyMoneyCompact(
  amount: number,
  prefs: CompanyPrefs = getCompanyPrefs(),
): string {
  const currency = resolveCurrencyCode(prefs.currency)
  return `${currency} ${formatCompactNumber(amount)}`
}
