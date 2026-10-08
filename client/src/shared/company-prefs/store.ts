import {
  DEFAULT_COMPANY_PREFS,
  type CompanyPrefs,
} from '@/shared/company-prefs/types'

let snapshot: CompanyPrefs = { ...DEFAULT_COMPANY_PREFS }

export function setCompanyPrefsSnapshot(prefs: CompanyPrefs): void {
  snapshot = prefs
}

export function getCompanyPrefs(): CompanyPrefs {
  return snapshot
}
