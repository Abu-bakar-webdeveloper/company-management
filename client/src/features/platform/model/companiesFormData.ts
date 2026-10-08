export const subscriptionPlanOptions = [
  { value: 'basic', label: 'Basic - $29/mo' },
  { value: 'pro', label: 'Pro - $79/mo' },
  { value: 'enterprise', label: 'Enterprise - $199/mo' },
] as const

export const startAsOptions = [
  { value: 'active', label: 'Active' },
  { value: 'trial', label: 'Trial' },
  { value: 'inactive', label: 'Inactive' },
] as const

export const countryOptions = [
  { value: 'pakistan', label: 'Pakistan' },
  { value: 'uae', label: 'United Arab Emirates' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'us', label: 'United States' },
] as const

export const timezoneOptions = [
  { value: 'gmt+5', label: 'GMT+5 (Karachi)' },
  { value: 'gmt+0', label: 'GMT+0 (London)' },
  { value: 'gmt-5', label: 'GMT-5 (New York)' },
  { value: 'gmt+4', label: 'GMT+4 (Dubai)' },
] as const

export const currencyOptions = [
  { value: 'pkr', label: 'PKR - Rupee' },
  { value: 'usd', label: 'USD - Dollar' },
  { value: 'gbp', label: 'GBP - Pound' },
  { value: 'aed', label: 'AED - Dirham' },
] as const

export const dateFormatOptions = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
] as const

export const companyFormDefaults = {
  companyName: '',
  email: '',
  phone: '',
  startingDate: '',
  // subscriptionPlan: 'basic' as const,
  // startAs: 'active' as const,
  adminFullName: '',
  adminEmail: '',
  // country: 'pakistan',
  // city: 'Lahore',
  addressLine: '',
  // postalCode: '54000',
  primaryColor: '#00284F',
  secondaryColor: '#136DEC',
  timezone: 'gmt+5',
  currency: 'pkr',
  dateFormat: 'DD/MM/YYYY',
  enabledHubs: ['people', 'finance', 'work'] as Array<'people' | 'finance' | 'work'>,
}
