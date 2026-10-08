import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  countryOptions,
  currencyOptions,
  dateFormatOptions,
  timezoneOptions,
} from '@/features/platform/model/companiesFormData'
import { LogoUploadField } from '@/features/platform/ui/CompanyFormControls'
import { settingsApi } from '@/features/settings/api/settingsApi'
import { useSystemPreferences } from '@/features/settings/model/SystemPreferencesContext'
import type { CompanySettings } from '@/features/settings/model/types'
import { CompanyIcon } from '@/features/settings/ui/icons'
import {
  FieldLabel,
  SettingsFormFooter,
  SettingsPageShell,
  SettingsSectionCard,
} from '@/features/settings/ui/SettingsPageShell'
import { getErrorMessage } from '@/shared/api/errors'
import { queryKeys } from '@/shared/api/queryKeys'
import { uploadLogoToCloudinary } from '@/shared/lib/uploadAvatar'
import { SelectField } from '@/shared/ui/SelectField'
import { TextField } from '@/shared/ui/TextField'

const inputClass = '!h-11 rounded-lg border-[#e2e8f0] text-sm'

export function CompanySettingsPage() {
  const queryClient = useQueryClient()
  const { preferences, savePreferences } = useSystemPreferences()
  const [settings, setSettings] = useState<CompanySettings | null>(null)
  const [logoFile, setLogoFile] = useState<File | undefined>()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void settingsApi
      .getCompanySettings()
      .then(setSettings)
      .catch((err) => setError(getErrorMessage(err, 'Unable to load company settings.')))
  }, [])

  const set = <K extends keyof CompanySettings>(key: K, value: CompanySettings[K]) =>
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev))

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    setError(null)
    try {
      let nextSettings = settings
      if (logoFile) {
        const logoUrl = await uploadLogoToCloudinary(logoFile)
        nextSettings = { ...settings, logoUrl }
      }
      const saved = await settingsApi.saveCompanySettings(nextSettings)
      setSettings(saved)
      setLogoFile(undefined)
      await queryClient.invalidateQueries({ queryKey: queryKeys.companies.me() })
      // Keep Appearance primary color in sync with company branding.
      if (saved.primaryColor !== preferences.primaryColor) {
        await savePreferences({ ...preferences, primaryColor: saved.primaryColor })
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to save company settings.'))
    } finally {
      setSaving(false)
    }
  }

  if (!settings && !error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <p className="text-sm text-text-muted">Loading…</p>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <p className="text-sm text-danger">{error}</p>
      </div>
    )
  }

  return (
    <SettingsPageShell
      title="Company Settings"
      subtitle="Manage your company information, branding & system preferences."
      onSave={() => void handleSave()}
      saving={saving}
    >
      <SettingsSectionCard title="Company Information" icon={<CompanyIcon className="text-primary" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>Company Name</FieldLabel>
            <TextField
              value={settings.companyName}
              onChange={(e) => set('companyName', e.target.value)}
              inputClassName={inputClass}
            />
          </div>
          <div>
            <FieldLabel>Email Address</FieldLabel>
            <TextField
              value={settings.email}
              onChange={(e) => set('email', e.target.value)}
              inputClassName={inputClass}
            />
          </div>
          <div>
            <FieldLabel>Phone Number</FieldLabel>
            <TextField
              value={settings.phone}
              onChange={(e) => set('phone', e.target.value)}
              inputClassName={inputClass}
            />
          </div>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard title="Address Details">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>Country</FieldLabel>
            <SelectField
              value={settings.country}
              onChange={(e) => set('country', e.target.value)}
              className={inputClass}
            >
              {countryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
          </div>
          <div>
            <FieldLabel>City</FieldLabel>
            <TextField
              value={settings.city}
              onChange={(e) => set('city', e.target.value)}
              inputClassName={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel>Address Line</FieldLabel>
            <TextField
              value={settings.addressLine}
              onChange={(e) => set('addressLine', e.target.value)}
              placeholder="Enter street address ..."
              inputClassName={inputClass}
            />
          </div>
          <div>
            <FieldLabel>Postal Code</FieldLabel>
            <TextField
              value={settings.postalCode}
              onChange={(e) => set('postalCode', e.target.value)}
              inputClassName={inputClass}
            />
          </div>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard title="Branding">
        <div className="mb-5">
          <FieldLabel>Company Logo</FieldLabel>
          <LogoUploadField
            value={logoFile}
            previewUrl={settings.logoUrl}
            onChange={setLogoFile}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>Secondary Color</FieldLabel>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.secondaryColor}
                onChange={(e) => set('secondaryColor', e.target.value)}
                className="size-10 shrink-0 cursor-pointer rounded-lg border border-border"
              />
              <TextField
                value={settings.secondaryColor}
                onChange={(e) => set('secondaryColor', e.target.value)}
                inputClassName={inputClass}
              />
            </div>
          </div>
          <div>
            <FieldLabel>Primary Color</FieldLabel>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => set('primaryColor', e.target.value)}
                className="size-10 shrink-0 cursor-pointer rounded-lg border border-border"
              />
              <TextField
                value={settings.primaryColor}
                onChange={(e) => set('primaryColor', e.target.value)}
                inputClassName={inputClass}
              />
            </div>
          </div>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard title="System Settings">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <FieldLabel>Timezone</FieldLabel>
            <SelectField
              value={settings.timezone}
              onChange={(e) => set('timezone', e.target.value)}
              className={inputClass}
            >
              {timezoneOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
          </div>
          <div>
            <FieldLabel>Currency</FieldLabel>
            <SelectField
              value={settings.currency}
              onChange={(e) => set('currency', e.target.value)}
              className={inputClass}
            >
              {currencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
          </div>
          <div>
            <FieldLabel>Date Format</FieldLabel>
            <SelectField
              value={settings.dateFormat}
              onChange={(e) => set('dateFormat', e.target.value)}
              className={inputClass}
            >
              {dateFormatOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
          </div>
        </div>
        <p className="mt-4 text-xs text-text-muted">Settings apply to all users in this workspace.</p>
      </SettingsSectionCard>

      {error && (
        <p className="rounded-lg bg-[#fef2f2] px-4 py-3 text-sm text-danger">{error}</p>
      )}

      <SettingsFormFooter
        onCancel={() => {
          setLogoFile(undefined)
          void settingsApi
            .getCompanySettings()
            .then(setSettings)
            .catch((err) => setError(getErrorMessage(err, 'Unable to reload company settings.')))
        }}
        onSave={() => void handleSave()}
        saving={saving}
      />
    </SettingsPageShell>
  )
}
