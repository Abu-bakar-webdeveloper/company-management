export type CompanyPrefs = {
  id: string | null
  name: string
  email: string
  phone: string
  country: string
  city: string
  addressLine: string
  postalCode: string
  timezone: string
  currency: string
  dateFormat: string
  primaryColor: string
  secondaryColor: string
  logoUrl?: string
}

export const DEFAULT_COMPANY_PREFS: CompanyPrefs = {
  id: null,
  name: '',
  email: '',
  phone: '',
  country: 'pakistan',
  city: '',
  addressLine: '',
  postalCode: '',
  timezone: 'gmt+5',
  currency: 'pkr',
  dateFormat: 'DD/MM/YYYY',
  primaryColor: '#0f52BA',
  secondaryColor: '#136DEC',
}
