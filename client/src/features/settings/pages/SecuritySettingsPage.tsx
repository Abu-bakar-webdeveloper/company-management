import {
  activeSessions,
  securityLogs,
  securitySettings,
} from '@/features/settings/model/settingsData'
import { ShieldCheckIcon } from '@/features/settings/ui/icons'
import {
  FieldLabel,
  SettingsPageShell,
  SettingsSectionCard,
} from '@/features/settings/ui/SettingsPageShell'
import { ToggleSwitch } from '@/features/settings/ui/ToggleSwitch'
import { SelectField } from '@/shared/ui/SelectField'
import { cn } from '@/shared/lib/cn'

const inputClass = '!h-11 rounded-lg border-[#e2e8f0] text-sm'

function PreviewBanner() {
  return (
    <div className="mt-3 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 text-sm text-[#92400E]">
      <p className="font-semibold">Preview only</p>
      <p className="mt-0.5 text-[#B45309]">
        Security policies, 2FA, and session management are not saved yet. Password rules are
        currently enforced at sign-up using the platform defaults.
      </p>
    </div>
  )
}

export function SecuritySettingsPage() {
  const settings = securitySettings

  return (
    <SettingsPageShell
      title="Security Settings"
      subtitle="Manage authentication & system security."
      headerExtra={<PreviewBanner />}
    >
      <fieldset disabled className="opacity-90 [&_*]:pointer-events-none">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <SettingsSectionCard title="Password Policy" icon={<ShieldCheckIcon className="text-primary" />}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Minimum Length</FieldLabel>
                <SelectField value={settings.minPasswordLength} className={inputClass} disabled>
                  <option>8 Characters</option>
                  <option>10 Characters</option>
                  <option>12 Characters</option>
                </SelectField>
              </div>
              <div>
                <FieldLabel>Password Expiry</FieldLabel>
                <SelectField value={settings.passwordExpiry} className={inputClass} disabled>
                  <option>30 Days</option>
                  <option>60 Days</option>
                  <option>90 Days</option>
                </SelectField>
              </div>
            </div>
            <ul className="mt-4 divide-y divide-border-card">
              {([
                ['requireUppercase', 'Require Uppercase', 'At least one uppercase letter'],
                ['requireNumbers', 'Require Numbers', 'At least one numeric digit'],
                ['requireSymbols', 'Require Symbols', 'At least one special character'],
              ] as const).map(([key, label, desc]) => (
                <li key={key} className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="text-sm font-semibold text-heading">{label}</p>
                    <p className="text-xs text-text-muted">{desc}</p>
                  </div>
                  <ToggleSwitch checked={settings[key]} onChange={() => undefined} ariaLabel={label} />
                </li>
              ))}
            </ul>
          </SettingsSectionCard>

          <SettingsSectionCard title="Two-Factor Authentication (2FA)">
            <div className="rounded-xl bg-primary p-4 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold">Enable 2FA</p>
                  <p className="mt-0.5 text-xs text-white/80">Add an extra layer of security</p>
                </div>
                <ToggleSwitch
                  checked={settings.enable2fa}
                  onChange={() => undefined}
                  ariaLabel="Enable 2FA"
                  className={settings.enable2fa ? 'bg-white' : 'bg-white/30'}
                />
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {([
                ['email', 'Email OTP'],
                ['authenticator', 'Authenticator App'],
              ] as const).map(([value, label]) => (
                <label key={value} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="2fa-method"
                    checked={settings.twoFactorMethod === value}
                    readOnly
                    className="size-4 accent-primary"
                  />
                  <span className="text-sm font-medium text-heading">{label}</span>
                </label>
              ))}
            </div>
          </SettingsSectionCard>

          <SettingsSectionCard title="Login Security">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Max Login Attempts</FieldLabel>
                <SelectField value={settings.maxLoginAttempts} className={inputClass} disabled>
                  <option>5 Attempts</option>
                  <option>3 Attempts</option>
                </SelectField>
              </div>
              <div>
                <FieldLabel>Account Lock Time</FieldLabel>
                <SelectField value={settings.accountLockTime} className={inputClass} disabled>
                  <option>15 Minutes</option>
                  <option>30 Minutes</option>
                </SelectField>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-[#FFEDD5] bg-[#FFF7ED] p-4">
              <div>
                <p className="text-sm font-semibold text-heading">Remember Devices</p>
                <p className="text-xs text-text-muted">Skip 2FA on trusted devices</p>
              </div>
              <ToggleSwitch
                checked={settings.rememberDevices}
                onChange={() => undefined}
                ariaLabel="Remember devices"
              />
            </div>
          </SettingsSectionCard>

          <SettingsSectionCard title="Session Management">
            <div className="space-y-4">
              <div>
                <FieldLabel>Session Timeout</FieldLabel>
                <SelectField value={settings.sessionTimeout} className={inputClass} disabled>
                  <option>30 Minutes</option>
                  <option>60 Minutes</option>
                </SelectField>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-heading">Auto Logout</span>
                <ToggleSwitch
                  checked={settings.autoLogout}
                  onChange={() => undefined}
                  ariaLabel="Auto logout"
                />
              </div>
              <div className="rounded-xl bg-[#F5F3FF] p-4 text-xs leading-5 text-text-muted">
                Use System Preferences to configure idle logout for your browser session.
              </div>
            </div>
          </SettingsSectionCard>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <SettingsSectionCard title="Active Sessions">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:hidden">
              {activeSessions.map((s) => (
                <div key={s.id} className="rounded-xl border border-border-card bg-surface p-4">
                  <p className="font-semibold text-heading">{s.device}</p>
                  <p className="text-xs text-text-muted">{s.detail}</p>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-text-muted">{s.location}</span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-bold',
                        s.lastActiveTone === 'success'
                          ? 'bg-[#ECFDF5] text-[#00B67A]'
                          : 'bg-[#EFF6FF] text-[#1877F2]',
                      )}
                    >
                      {s.lastActive}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden overflow-x-auto xl:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs font-bold uppercase tracking-wide text-text-muted">
                    <th className="pb-3">Device</th>
                    <th className="pb-3">Location</th>
                    <th className="pb-3">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSessions.map((s) => (
                    <tr key={s.id} className="border-t border-border-card">
                      <td className="py-3">
                        <p className="font-semibold text-heading">{s.device}</p>
                        <p className="text-xs text-text-muted">{s.detail}</p>
                      </td>
                      <td className="py-3 text-heading">{s.location}</td>
                      <td className="py-3">
                        <span
                          className={cn(
                            'rounded-full px-2.5 py-1 text-[10px] font-bold',
                            s.lastActiveTone === 'success'
                              ? 'bg-[#ECFDF5] text-[#00B67A]'
                              : 'bg-[#EFF6FF] text-[#1877F2]',
                          )}
                        >
                          {s.lastActive}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SettingsSectionCard>

          <SettingsSectionCard title="Activity Logs">
            <ul className="space-y-4">
              {securityLogs.map((log) => (
                <li
                  key={log.id}
                  className="flex items-center justify-between gap-3 border-b border-border-card pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-semibold text-heading">{log.actor}</p>
                    <p className="text-xs text-text-muted">{log.action}</p>
                  </div>
                  <span className="text-xs text-text-muted">{log.date}</span>
                </li>
              ))}
            </ul>
          </SettingsSectionCard>
        </div>
      </fieldset>
    </SettingsPageShell>
  )
}
