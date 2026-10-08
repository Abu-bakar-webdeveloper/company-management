import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/model/AuthContext'
import {
  companiesApi,
  type CompanyPreferencesDto,
} from '@/features/platform/api/companiesApi'
import { applyCompanyBranding } from '@/shared/company-prefs/applyBranding'
import { setCompanyPrefsSnapshot } from '@/shared/company-prefs/store'
import {
  DEFAULT_COMPANY_PREFS,
  type CompanyPrefs,
} from '@/shared/company-prefs/types'
import { queryKeys } from '@/shared/api/queryKeys'

type CompanyPrefsContextValue = {
  prefs: CompanyPrefs
  isLoading: boolean
  isError: boolean
}

const CompanyPrefsContext = createContext<CompanyPrefsContextValue | null>(null)

function toCompanyPrefs(dto: CompanyPreferencesDto): CompanyPrefs {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    phone: dto.phone,
    country: dto.country,
    city: dto.city,
    addressLine: dto.addressLine,
    postalCode: dto.postalCode,
    timezone: dto.timezone,
    currency: dto.currency,
    dateFormat: dto.dateFormat,
    primaryColor: dto.primaryColor,
    secondaryColor: dto.secondaryColor,
    logoUrl: dto.logoUrl,
  }
}

export function CompanyPrefsProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const companyId = user?.companyId ?? null

  const query = useQuery({
    queryKey: queryKeys.companies.me(),
    queryFn: () => companiesApi.getMine(),
    enabled: isAuthenticated && Boolean(companyId) && !authLoading,
    staleTime: 60_000,
  })

  const prefs = useMemo<CompanyPrefs>(() => {
    if (query.data) return toCompanyPrefs(query.data)
    return DEFAULT_COMPANY_PREFS
  }, [query.data])

  useEffect(() => {
    setCompanyPrefsSnapshot(prefs)
    // Secondary brand only — theme / primary accent come from System Preferences.
    applyCompanyBranding(prefs)
  }, [prefs])

  useEffect(() => {
    if (!isAuthenticated || !companyId) {
      setCompanyPrefsSnapshot(DEFAULT_COMPANY_PREFS)
      applyCompanyBranding(DEFAULT_COMPANY_PREFS)
    }
  }, [isAuthenticated, companyId])

  const value = useMemo<CompanyPrefsContextValue>(
    () => ({
      prefs,
      isLoading: Boolean(companyId) && (authLoading || query.isLoading),
      isError: query.isError,
    }),
    [prefs, companyId, authLoading, query.isLoading, query.isError],
  )

  return (
    <CompanyPrefsContext.Provider value={value}>{children}</CompanyPrefsContext.Provider>
  )
}

export function useCompanyPrefs(): CompanyPrefsContextValue {
  const ctx = useContext(CompanyPrefsContext)
  if (!ctx) {
    return {
      prefs: DEFAULT_COMPANY_PREFS,
      isLoading: false,
      isError: false,
    }
  }
  return ctx
}
