import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/model/AuthContext'
import { isCompanyHubEnabled, type CompanyHub } from '@/features/auth/model/companyHubs'
import { notificationsApi } from '@/features/notifications/api/notificationsApi'
import type { NotificationPreferences } from '@/features/notifications/model/types'
import {
  disableWebPush,
  enableWebPush,
  isWebPushSupported,
} from '@/features/notifications/lib/web-push'
import { BellIcon } from '@/features/settings/ui/icons'
import {
  FieldLabel,
  SettingsFormFooter,
  SettingsPageShell,
  SettingsSectionCard,
} from '@/features/settings/ui/SettingsPageShell'
import { ToggleSwitch } from '@/features/settings/ui/ToggleSwitch'
import { SelectField } from '@/shared/ui/SelectField'
import { Checkbox } from '@/shared/ui/Checkbox'
import { ApiError } from '@/shared/api/errors'

const emailItems: { key: 'newUser' | 'leaveRequest' | 'leaveDecision' | 'expenseSubmitted' | 'expenseApproved'; label: string; hub?: CompanyHub }[] = [
  { key: 'newUser', label: 'New User Created' },
  { key: 'leaveRequest', label: 'Leave Request Submitted', hub: 'people' },
  { key: 'leaveDecision', label: 'Leave Approved/Rejected', hub: 'people' },
  { key: 'expenseSubmitted', label: 'Expense Submitted', hub: 'finance' },
  { key: 'expenseApproved', label: 'Expense Approved', hub: 'finance' },
]

const systemItems: { key: 'taskAssigned' | 'projectUpdated' | 'performanceReview'; label: string; hub: CompanyHub }[] = [
  { key: 'taskAssigned', label: 'Task Assigned', hub: 'work' },
  { key: 'projectUpdated', label: 'Project Updated', hub: 'work' },
  { key: 'performanceReview', label: 'Performance Review Due', hub: 'people' },
]

const reminderItems: { key: 'leaveExpiry' | 'reviewDeadline' | 'projectDeadline'; label: string; hub: CompanyHub }[] = [
  { key: 'leaveExpiry', label: 'Leave Expiry', hub: 'people' },
  { key: 'reviewDeadline', label: 'Review Deadline', hub: 'people' },
  { key: 'projectDeadline', label: 'Project Deadline', hub: 'work' },
]

const channelItems = [
  { key: 'email', label: 'Email Notifications', desc: 'Daily digest and critical alerts via email' },
  { key: 'inApp', label: 'In-App Notifications', desc: 'Live activity updates within the platform' },
  {
    key: 'push',
    label: 'Browser Push Notifications',
    desc: 'Desktop alerts even when Bizflow is closed or in another tab',
  },
  { key: 'sms', label: 'SMS Notifications', desc: 'Coming soon — SMS delivery is not enabled yet' },
] as const

export function NotificationSettingsPage() {
  const { user } = useAuth()
  const hubs = user?.enabledHubs
  const visibleEmailItems = emailItems.filter(
    (item) => !item.hub || isCompanyHubEnabled(hubs, item.hub),
  )
  const visibleSystemItems = systemItems.filter((item) => isCompanyHubEnabled(hubs, item.hub))
  const visibleReminderItems = reminderItems.filter((item) => isCompanyHubEnabled(hubs, item.hub))
  const [settings, setSettings] = useState<NotificationPreferences | null>(null)
  const [saving, setSaving] = useState(false)
  const [pushBusy, setPushBusy] = useState(false)
  const pushSupported = isWebPushSupported()

  useEffect(() => {
    void notificationsApi.getPreferences().then(setSettings)
  }, [])

  const handlePushChannelChange = async (enabled: boolean) => {
    if (!settings) return

    if (!enabled) {
      setPushBusy(true)
      try {
        await disableWebPush()
        const nextSettings = { ...settings, channels: { ...settings.channels, push: false } }
        const saved = await notificationsApi.savePreferences(nextSettings)
        setSettings(saved)
        toast.success('Browser push notifications disabled')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to disable push')
      } finally {
        setPushBusy(false)
      }
      return
    }

    if (!pushSupported) {
      toast.error('Push notifications are not supported in this browser')
      return
    }

    setPushBusy(true)
    try {
      await enableWebPush()
      const nextSettings = { ...settings, channels: { ...settings.channels, push: true } }
      const saved = await notificationsApi.savePreferences(nextSettings)
      setSettings(saved)
      toast.success('Browser push notifications enabled')
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Failed to enable push'
      toast.error(message)
    } finally {
      setPushBusy(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    try {
      if (settings.channels.push) {
        try {
          await enableWebPush()
        } catch (error) {
          const message =
            error instanceof ApiError
              ? error.message
              : error instanceof Error
                ? error.message
                : 'Push subscription failed'
          toast.error(message)
          setSaving(false)
          return
        }
      }

      const saved = await notificationsApi.savePreferences(settings)
      setSettings(saved)
      toast.success('Notification preferences saved')
    } finally {
      setSaving(false)
    }
  }

  if (!settings) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <p className="text-sm text-text-muted">Loading…</p>
      </div>
    )
  }

  return (
    <SettingsPageShell
      title="Notification Settings"
      subtitle="Configure how and when you want to be alerted across the platform."
      onSave={() => void handleSave()}
      saving={saving}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {visibleEmailItems.length > 0 && (
        <SettingsSectionCard title="Email Notifications" icon={<BellIcon className="text-primary" />}>
          <ul className="divide-y divide-border-card">
            {visibleEmailItems.map(({ key, label }) => (
              <li key={key} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <span className="text-sm font-medium text-heading">{label}</span>
                <ToggleSwitch
                  checked={settings.email[key]}
                  onChange={(v) => setSettings({ ...settings, email: { ...settings.email, [key]: v } })}
                  ariaLabel={label}
                />
              </li>
            ))}
          </ul>
        </SettingsSectionCard>
        )}

        {visibleSystemItems.length > 0 && (
        <SettingsSectionCard title="System Notifications" icon={<BellIcon className="text-primary" />}>
          <ul className="divide-y divide-border-card">
            {visibleSystemItems.map(({ key, label }) => (
              <li key={key} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <span className="text-sm font-medium text-heading">{label}</span>
                <ToggleSwitch
                  checked={settings.system[key]}
                  onChange={(v) => setSettings({ ...settings, system: { ...settings.system, [key]: v } })}
                  ariaLabel={label}
                />
              </li>
            ))}
          </ul>
        </SettingsSectionCard>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {visibleReminderItems.length > 0 && (
        <SettingsSectionCard title="Reminders" icon={<BellIcon className="text-primary" />}>
          <div className="space-y-4">
            {visibleReminderItems.map(({ key, label }) => (
              <div key={key} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <FieldLabel>{label}</FieldLabel>
                <SelectField
                  value={settings.reminders[key]}
                  onChange={(e) =>
                    setSettings({ ...settings, reminders: { ...settings.reminders, [key]: e.target.value } })
                  }
                  className="!h-10 w-full rounded-lg border-[#e2e8f0] text-sm sm:w-40"
                >
                  <option>1 Day</option>
                  <option>2 Days</option>
                  <option>3 Days</option>
                  <option>1 Week</option>
                </SelectField>
              </div>
            ))}
          </div>
        </SettingsSectionCard>
        )}

        <SettingsSectionCard title="Channels" icon={<BellIcon className="text-primary" />}>
          <ul className="divide-y divide-border-card">
            {channelItems.map(({ key, label, desc }) => {
              const isPush = key === 'push'
              const isSms = key === 'sms'
              const checked = settings.channels[key]
              const disabled = (isPush && (!pushSupported || pushBusy)) || isSms

              return (
                <li key={key} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <label className="flex flex-1 cursor-pointer items-start gap-3">
                    <Checkbox
                      checked={checked}
                      disabled={disabled}
                      onChange={(e) => {
                        if (isPush) {
                          void handlePushChannelChange(e.target.checked)
                          return
                        }
                        if (isSms) return
                        setSettings({
                          ...settings,
                          channels: { ...settings.channels, [key]: e.target.checked },
                        })
                      }}
                      aria-label={label}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-semibold text-heading">{label}</p>
                      <p className="mt-0.5 text-xs text-text-muted">
                        {isPush && !pushSupported
                          ? 'Not supported in this browser (use Chrome, Edge, or Firefox on HTTPS/localhost).'
                          : isPush && Notification.permission === 'denied'
                            ? 'Blocked in browser settings — reset site permissions for localhost, then try again.'
                            : isSms
                              ? 'Coming soon — preference is saved but messages are not sent yet.'
                              : desc}
                      </p>
                    </div>
                  </label>
                </li>
              )
            })}
          </ul>
        </SettingsSectionCard>
      </div>
      <SettingsFormFooter
        onCancel={() => void notificationsApi.getPreferences().then(setSettings)}
        onSave={() => void handleSave()}
        saving={saving}
      />
    </SettingsPageShell>
  )
}
