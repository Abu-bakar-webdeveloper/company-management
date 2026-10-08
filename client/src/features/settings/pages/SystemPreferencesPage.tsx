import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/model/AuthContext'
import { applySystemPreferences } from '@/features/settings/lib/applyPreferences'
import {
  getLandingPageOptions,
  isValidHexColor,
  normalizeHexColor,
  normalizeSidebarStyle,
  normalizeTheme,
} from '@/features/settings/lib/preference-utils'
import type { SystemPreferences } from '@/features/settings/model/types'
import { useSystemPreferences } from '@/features/settings/model/SystemPreferencesContext'
import { companiesApi } from '@/features/platform/api/companiesApi'
import { queryKeys } from '@/shared/api/queryKeys'
import { useCompanyPrefs } from '@/shared/company-prefs/CompanyPrefsProvider'
import {
  CloudIcon,
  GearIcon,
  GlobeIcon,
  LayoutIcon,
  PaletteIcon,
} from '@/features/settings/ui/icons'
import {
  FieldLabel,
  SettingsFormFooter,
  SettingsPageShell,
  SettingsSectionCard,
} from '@/features/settings/ui/SettingsPageShell'
import { ToggleSwitch } from '@/features/settings/ui/ToggleSwitch'
import { ChevronSelect } from '@/shared/ui/ChevronSelect'
import { SelectField } from '@/shared/ui/SelectField'
import { TextField } from '@/shared/ui/TextField'
import { cn } from '@/shared/lib/cn'

const inputClass = '!h-11 rounded-lg border-[#e2e8f0] text-sm'

function ToggleSettingRow({
  title,
  description,
  checked,
  onChange,
  ariaLabel,
}: {
  title: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
  ariaLabel: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border-card py-4 last:border-b-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-heading">{title}</p>
        <p className="mt-0.5 text-xs text-text-muted">{description}</p>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} ariaLabel={ariaLabel} />
    </div>
  )
}

export function SystemPreferencesPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { prefs: companyPrefs } = useCompanyPrefs()
  const {
    preferences,
    isLoading,
    saving,
    savePreferences,
    reloadPreferences,
    runBackup,
  } = useSystemPreferences()
  const [draft, setDraft] = useState<SystemPreferences | null>(null)
  const [backupMessage, setBackupMessage] = useState<string | null>(null)
  const prefs = draft
  const isSuperadmin = user?.role === 'superadmin'
  const savedPreferencesRef = useRef(preferences)
  savedPreferencesRef.current = preferences

  useEffect(() => {
    if (!isLoading) {
      const allowed = getLandingPageOptions(user?.enabledHubs)
      setDraft({
        ...preferences,
        defaultLandingPage: allowed.includes(preferences.defaultLandingPage)
          ? preferences.defaultLandingPage
          : 'Dashboard',
      })
    }
  }, [preferences, isLoading, user?.enabledHubs])

  // Live-preview draft appearance; revert to last saved prefs only on leave.
  useEffect(() => {
    if (!prefs) return
    applySystemPreferences(prefs)
  }, [prefs])

  useEffect(() => {
    return () => {
      applySystemPreferences(savedPreferencesRef.current)
    }
  }, [])

  const persistAppearanceColor = async (primaryColor: string) => {
    if (!user?.companyId || isSuperadmin) return
    const color = normalizeHexColor(primaryColor)
    try {
      await companiesApi.updateMine({ primaryColor: color })
      await queryClient.invalidateQueries({ queryKey: queryKeys.companies.me() })
    } catch {
      // Appearance still applies locally via system preferences.
    }
  }

  const set = <K extends keyof SystemPreferences>(key: K, value: SystemPreferences[K]) => {
    if (!prefs) return

    if (key === 'primaryColor') {
      const raw = String(value ?? '')
      if (!isValidHexColor(raw)) {
        // Keep draft text while incomplete (e.g. "#13") — don't autosave invalid colors.
        const next = { ...prefs, primaryColor: raw }
        setDraft(next)
        applySystemPreferences({
          ...next,
          primaryColor: normalizeHexColor(prefs.primaryColor),
        })
        return
      }
      const color = normalizeHexColor(raw)
      const next = { ...prefs, primaryColor: color }
      setDraft(next)
      if (next.enableAutoSave) {
        void savePreferences(next).then(() => {
          void persistAppearanceColor(color)
        })
      }
      return
    }

    let nextValue = value
    if (key === 'theme') nextValue = normalizeTheme(String(value)) as SystemPreferences[K]
    if (key === 'sidebarStyle') {
      nextValue = normalizeSidebarStyle(String(value)) as SystemPreferences[K]
    }

    const next = { ...prefs, [key]: nextValue }
    setDraft(next)
    if (next.enableAutoSave) {
      void savePreferences(next)
    }
  }

  const handleSave = async () => {
    if (!prefs) return
    const payload = {
      ...prefs,
      theme: normalizeTheme(prefs.theme),
      primaryColor: normalizeHexColor(prefs.primaryColor),
      sidebarStyle: normalizeSidebarStyle(prefs.sidebarStyle),
    }
    setDraft(payload)
    await savePreferences(payload)
    if (payload.primaryColor !== companyPrefs.primaryColor) {
      await persistAppearanceColor(payload.primaryColor)
    }
  }

  const handleBackup = async () => {
    await runBackup()
    setBackupMessage(`Backup completed at ${new Date().toLocaleTimeString()}`)
    window.setTimeout(() => setBackupMessage(null), 4000)
  }

  if (isLoading || !prefs) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <p className="text-sm text-text-muted">Loading…</p>
      </div>
    )
  }

  return (
    <SettingsPageShell
      title="System Preferences"
      subtitle="Configure application behavior & defaults."
      onSave={() => void handleSave()}
      saving={saving}
    >
      <SettingsSectionCard title="General Settings" icon={<GlobeIcon className="text-primary" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {([
            ['language', 'Language', ['English', 'Urdu', 'Arabic']],
            ['timeFormat', 'Time Format', ['12h', '24h']],
          ] as const).map(([key, label, options]) => (
            <div key={key}>
              <FieldLabel>{label}</FieldLabel>
              <SelectField
                value={prefs[key]}
                onChange={(e) => set(key, e.target.value)}
                className={inputClass}
              >
                {options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </SelectField>
            </div>
          ))}
        </div>
      </SettingsSectionCard>

      {!isSuperadmin ? (
        <SettingsSectionCard title="Appearance" icon={<PaletteIcon className="text-primary" />}>
          <div className="space-y-5">
            <div>
              <FieldLabel>Theme Mode</FieldLabel>
              <div className="inline-flex w-full max-w-xs rounded-lg border border-border bg-surface-muted p-1 sm:w-auto">
                {(['light', 'dark'] as const).map((theme) => {
                  const active = normalizeTheme(prefs.theme) === theme
                  return (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => set('theme', theme)}
                      className={cn(
                        'min-w-24 flex-1 rounded-md px-4 py-2 text-sm font-semibold capitalize transition-colors',
                        active
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-transparent text-heading hover:bg-surface',
                      )}
                    >
                      {theme}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Primary Color</FieldLabel>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={normalizeHexColor(prefs.primaryColor)}
                    onChange={(e) => set('primaryColor', e.target.value)}
                    className="size-10 shrink-0 cursor-pointer rounded-lg border border-border bg-surface p-0.5"
                    aria-label="Primary color"
                  />
                  <TextField
                    value={prefs.primaryColor}
                    onChange={(e) => set('primaryColor', e.target.value)}
                    placeholder="#136DEC"
                    inputClassName={inputClass}
                  />
                </div>
              </div>
              <div>
                <FieldLabel>Sidebar Style</FieldLabel>
                <SelectField
                  value={normalizeSidebarStyle(prefs.sidebarStyle)}
                  onChange={(e) => set('sidebarStyle', e.target.value)}
                  className={inputClass}
                >
                  <option value="Expanded">Expanded</option>
                  <option value="Collapsed">Collapsed</option>
                </SelectField>
              </div>
            </div>
          </div>
        </SettingsSectionCard>
      ) : null}

      <SettingsSectionCard title="Dashboard Preferences" icon={<LayoutIcon className="text-primary" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>Default Dashboard</FieldLabel>
            <SelectField
              value={prefs.defaultDashboard}
              onChange={(e) => set('defaultDashboard', e.target.value)}
              className={inputClass}
            >
              <option>Admin</option>
              <option>Manager</option>
              <option>Employee</option>
            </SelectField>
          </div>
          <div>
            <FieldLabel>Default Landing Page</FieldLabel>
            <SelectField
              value={prefs.defaultLandingPage}
              onChange={(e) => set('defaultLandingPage', e.target.value)}
              className={inputClass}
            >
              {getLandingPageOptions(user?.enabledHubs).map((page) => (
                <option key={page}>{page}</option>
              ))}
            </SelectField>
          </div>
        </div>
        <div className="mt-2">
          <ToggleSettingRow
            title="Show Quick Stats"
            description="Display key metrics on dashboard"
            checked={prefs.showQuickStats}
            onChange={(v) => set('showQuickStats', v)}
            ariaLabel="Show quick stats"
          />
          <ToggleSettingRow
            title="Enable Charts"
            description="Show visual analytics on dashboard"
            checked={prefs.enableCharts}
            onChange={(v) => set('enableCharts', v)}
            ariaLabel="Enable charts"
          />
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard title="System Behavior" icon={<GearIcon className="text-primary" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>Auto Logout Time</FieldLabel>
            <SelectField
              value={prefs.autoLogoutTime}
              onChange={(e) => set('autoLogoutTime', e.target.value)}
              className={inputClass}
            >
              <option>15 mins</option>
              <option>30 mins</option>
              <option>60 mins</option>
            </SelectField>
          </div>
          <div>
            <FieldLabel>Session Timeout</FieldLabel>
            <SelectField
              value={prefs.sessionTimeout}
              onChange={(e) => set('sessionTimeout', e.target.value)}
              className={inputClass}
            >
              <option>30 mins</option>
              <option>60 mins</option>
            </SelectField>
          </div>
        </div>
        <div className="mt-2">
          <ToggleSettingRow
            title="Enable Auto Save"
            description="Automatically save changes as you work"
            checked={prefs.enableAutoSave}
            onChange={(v) => set('enableAutoSave', v)}
            ariaLabel="Enable auto save"
          />
          <ToggleSettingRow
            title="Enable Notifications"
            description="Receive in-app and email alerts"
            checked={prefs.enableNotifications}
            onChange={(v) => set('enableNotifications', v)}
            ariaLabel="Enable notifications"
          />
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Data & Backup"
        icon={<CloudIcon className="text-primary" />}
        action={
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-3.5 text-xs font-semibold text-primary hover:opacity-90"
            onClick={() => void handleBackup()}
          >
            <CloudIcon className="size-3.5" />
            Backup Now
          </button>
        }
      >
        <div className="space-y-4">
          {backupMessage && (
            <p className="rounded-lg bg-success-muted px-3 py-2 text-sm text-success">{backupMessage}</p>
          )}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex min-w-0 items-center justify-between gap-4">
              <div className="min-w-0">
                <FieldLabel>Auto Backup</FieldLabel>
                <p className="text-xs text-text-muted">Automatic cloud synchronization of system state</p>
              </div>
              <ToggleSwitch
                checked={prefs.autoBackup}
                onChange={(v) => set('autoBackup', v)}
                ariaLabel="Auto backup"
              />
            </div>
            <div className="min-w-0">
              <FieldLabel>Backup Frequency</FieldLabel>
              <ChevronSelect
                value={prefs.backupFrequency}
                onChange={(e) => set('backupFrequency', e.target.value)}
                className={inputClass}
              >
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </ChevronSelect>
            </div>
          </div>
        </div>
      </SettingsSectionCard>

      <SettingsFormFooter
        onCancel={() => void reloadPreferences()}
        onSave={() => void handleSave()}
        saving={saving}
      />
    </SettingsPageShell>
  )
}
