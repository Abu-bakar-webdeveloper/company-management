import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { salariesApi } from '@/features/salaries/api/salariesApi'
import type { CompanyPayrollSettings, PayrollComponent } from '@/features/salaries/model/types'
import { ToggleSwitch } from '@/features/settings/ui/ToggleSwitch'
import { getErrorMessage } from '@/shared/api/errors'
import { ArrowLeftIcon } from '@/shared/ui/icons'
import { SelectField } from '@/shared/ui/SelectField'

function canToggleComponent(c: PayrollComponent): boolean {
  // Basic always on; PF is controlled by the PF settings panel above
  return c.code !== 'BASIC' && c.code !== 'PF'
}

export function PayrollSettingsPage() {
  const [settings, setSettings] = useState<CompanyPayrollSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newName, setNewName] = useState('')
  const [newKind, setNewKind] = useState<'earning' | 'deduction'>('earning')

  const load = async () => {
    setLoading(true)
    try {
      setSettings(await salariesApi.getSettings())
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to load payroll settings'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const saveSettings = async () => {
    if (!settings) return
    setSaving(true)
    try {
      const updated = await salariesApi.updateSettings({
        pf: settings.pf,
        leavePolicy: settings.leavePolicy,
        incrementPolicy: settings.incrementPolicy,
      })
      setSettings(updated)
      toast.success('Payroll settings saved')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to save settings'))
    } finally {
      setSaving(false)
    }
  }

  const addComponent = async () => {
    if (!newName.trim()) return
    try {
      await salariesApi.createComponent({ name: newName.trim(), kind: newKind })
      setNewName('')
      await load()
      toast.success('Allowance/deduction added')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to add component'))
    }
  }

  const toggleActive = async (c: PayrollComponent) => {
    if (!canToggleComponent(c)) {
      if (c.code === 'PF') {
        toast.message('Turn Provident Fund on/off in the Provident Fund section above')
      } else {
        toast.message('Basic salary is always included in payroll')
      }
      return
    }
    try {
      await salariesApi.updateComponent(c.id, { active: !c.active })
      await load()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to update component'))
    }
  }

  const removeComponent = async (c: PayrollComponent) => {
    if (c.isSystem) {
      toast.message('System components cannot be deleted — turn them off instead')
      return
    }
    try {
      await salariesApi.deleteComponent(c.id)
      await load()
      toast.success('Component removed')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to delete component'))
    }
  }

  const catalogComponents = useMemo(
    () => settings?.components.filter((c) => c.code !== 'PF') ?? [],
    [settings?.components],
  )

  if (loading || !settings) {
    return (
      <div className="flex min-h-[320px] items-center justify-center p-8">
        <p className="text-sm text-text-muted">Loading payroll settings…</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link
        to="/salaries"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-heading"
      >
        <ArrowLeftIcon className="text-text-muted" />
        Back to Salaries
      </Link>

      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-heading sm:text-[30px]">Payroll Settings</h1>
          <p className="mt-1 text-sm text-text-muted">
            Company allowances, provident fund rules, and leave deduction policy.
          </p>
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={() => void saveSettings()}
          className="inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-white disabled:opacity-70"
        >
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border-card bg-surface p-5 shadow-[var(--shadow-stat)]">
          <h2 className="mb-4 text-base font-semibold text-heading">Provident Fund</h2>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-heading">Enable PF</p>
              <p className="text-xs text-text-muted">
                Not set on employees — company percentages apply to everyone
              </p>
            </div>
            <ToggleSwitch
              checked={settings.pf.enabled}
              ariaLabel="Enable provident fund"
              onChange={(checked) =>
                setSettings({
                  ...settings,
                  pf: { ...settings.pf, enabled: checked },
                })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">
              <span className="mb-1 block text-text-muted">Employee %</span>
              <input
                type="number"
                min={0}
                max={100}
                disabled={!settings.pf.enabled}
                value={settings.pf.employeePercent}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    pf: { ...settings.pf, employeePercent: Number(e.target.value) },
                  })
                }
                className="h-10 w-full rounded-lg border border-border px-3 disabled:opacity-50"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-text-muted">Employer %</span>
              <input
                type="number"
                min={0}
                max={100}
                disabled={!settings.pf.enabled}
                value={settings.pf.employerPercent}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    pf: { ...settings.pf, employerPercent: Number(e.target.value) },
                  })
                }
                className="h-10 w-full rounded-lg border border-border px-3 disabled:opacity-50"
              />
            </label>
          </div>
          <label className="mt-3 block text-sm">
            <span className="mb-1 block text-text-muted">Contribution base</span>
            <SelectField
              value={settings.pf.base}
              disabled={!settings.pf.enabled}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  pf: { ...settings.pf, base: e.target.value as 'basic' | 'gross' },
                })
              }
              className="!h-10 w-full rounded-lg"
            >
              <option value="basic">Basic salary</option>
              <option value="gross">Gross earnings</option>
            </SelectField>
          </label>
          <p className="mt-3 text-xs text-text-muted">
            Employee share is deducted from net; employer match is posted to the employee PF
            account when salary is marked paid. Save settings to apply.
          </p>
        </section>

        <section className="rounded-xl border border-border-card bg-surface p-5 shadow-[var(--shadow-stat)]">
          <h2 className="mb-4 text-base font-semibold text-heading">Leave &amp; deduction policy</h2>
          <label className="mb-3 block text-sm">
            <span className="mb-1 block text-text-muted">Excess leave mode</span>
            <SelectField
              value={settings.leavePolicy.excessLeaveMode}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  leavePolicy: {
                    ...settings.leavePolicy,
                    excessLeaveMode: e.target.value as CompanyPayrollSettings['leavePolicy']['excessLeaveMode'],
                  },
                })
              }
              className="!h-10 w-full rounded-lg"
            >
              <option value="reject">Reject over-balance requests</option>
              <option value="deduct_from_salary">Allow &amp; deduct from salary</option>
              <option value="admin_can_waive">Allow; admin waives or deducts</option>
            </SelectField>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">
              <span className="mb-1 block text-text-muted">Leave day divisor</span>
              <input
                type="number"
                min={1}
                value={settings.leavePolicy.leaveDeductionDivisor}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    leavePolicy: {
                      ...settings.leavePolicy,
                      leaveDeductionDivisor: Number(e.target.value),
                    },
                  })
                }
                className="h-10 w-full rounded-lg border border-border px-3"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-text-muted">Encashment divisor</span>
              <input
                type="number"
                min={1}
                value={settings.leavePolicy.encashmentDivisor}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    leavePolicy: {
                      ...settings.leavePolicy,
                      encashmentDivisor: Number(e.target.value),
                    },
                  })
                }
                className="h-10 w-full rounded-lg border border-border px-3"
              />
            </label>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm text-heading">
            <input
              type="checkbox"
              checked={settings.leavePolicy.encashmentEnabled}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  leavePolicy: {
                    ...settings.leavePolicy,
                    encashmentEnabled: e.target.checked,
                  },
                })
              }
            />
            Enable paid-leave encashment (unused, non-carry-forward)
          </label>
        </section>

        <section className="rounded-xl border border-border-card bg-surface p-5 shadow-[var(--shadow-stat)]">
          <h2 className="mb-4 text-base font-semibold text-heading">Increment policy</h2>
          <p className="mb-3 text-xs text-text-muted">
            Tracks when reviews are due. Raises are never applied automatically — use Change
            package on the employee Salary tab.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">
              <span className="mb-1 block text-text-muted">Probation months</span>
              <input
                type="number"
                min={1}
                max={36}
                value={settings.incrementPolicy?.probationMonths ?? 6}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    incrementPolicy: {
                      ...(settings.incrementPolicy ?? {
                        probationMonths: 6,
                        permanentMonths: 12,
                        eligibleFrom: 'confirmation_or_last_increment',
                      }),
                      probationMonths: Number(e.target.value),
                    },
                  })
                }
                className="h-10 w-full rounded-lg border border-border px-3"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-text-muted">Permanent cycle (months)</span>
              <input
                type="number"
                min={1}
                max={60}
                value={settings.incrementPolicy?.permanentMonths ?? 12}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    incrementPolicy: {
                      ...(settings.incrementPolicy ?? {
                        probationMonths: 6,
                        permanentMonths: 12,
                        eligibleFrom: 'confirmation_or_last_increment',
                      }),
                      permanentMonths: Number(e.target.value),
                    },
                  })
                }
                className="h-10 w-full rounded-lg border border-border px-3"
              />
            </label>
          </div>
          <label className="mt-3 block text-sm">
            <span className="mb-1 block text-text-muted">Permanent cycle starts from</span>
            <SelectField
              value={
                settings.incrementPolicy?.eligibleFrom ?? 'confirmation_or_last_increment'
              }
              onChange={(e) =>
                setSettings({
                  ...settings,
                  incrementPolicy: {
                    ...(settings.incrementPolicy ?? {
                      probationMonths: 6,
                      permanentMonths: 12,
                      eligibleFrom: 'confirmation_or_last_increment',
                    }),
                    eligibleFrom: e.target.value as CompanyPayrollSettings['incrementPolicy']['eligibleFrom'],
                  },
                })
              }
              className="!h-10 w-full rounded-lg"
            >
              <option value="confirmation_or_last_increment">
                Last increment or confirmation date
              </option>
              <option value="join_date">Join date</option>
            </SelectField>
          </label>
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-border-card bg-surface p-5 shadow-[var(--shadow-stat)]">
        <h2 className="mb-1 text-base font-semibold text-heading">Allowances &amp; deductions</h2>
        <p className="mb-4 text-xs text-text-muted">
          Turn items on or off for this company. System items cannot be deleted; Basic cannot be
          turned off. Provident Fund is managed in the section above.
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New component name"
            className="h-10 min-w-[200px] flex-1 rounded-lg border border-border px-3 text-sm"
          />
          <SelectField
            value={newKind}
            onChange={(e) => setNewKind(e.target.value as 'earning' | 'deduction')}
            className="!h-10 rounded-lg text-sm"
          >
            <option value="earning">Earning</option>
            <option value="deduction">Deduction</option>
          </SelectField>
          <button
            type="button"
            onClick={() => void addComponent()}
            className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-white"
          >
            Add
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-card text-text-muted">
                <th className="px-2 py-2 font-medium">Code</th>
                <th className="px-2 py-2 font-medium">Name</th>
                <th className="px-2 py-2 font-medium">Kind</th>
                <th className="px-2 py-2 font-medium">Default</th>
                <th className="px-2 py-2 font-medium">On / Off</th>
                <th className="px-2 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {catalogComponents.map((c) => {
                const toggleable = canToggleComponent(c)
                return (
                  <tr key={c.id} className="border-b border-border-card/60">
                    <td className="px-2 py-2 font-mono text-xs">{c.code}</td>
                    <td className="px-2 py-2">
                      <span className="text-heading">{c.name}</span>
                      {c.isSystem && (
                        <span className="ml-2 rounded bg-[#f1f5f9] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-text-muted">
                          System
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2 capitalize">{c.kind}</td>
                    <td className="px-2 py-2">
                      {c.calcType === 'percent_of_basic'
                        ? `${c.defaultValue}% basic`
                        : c.defaultValue}
                    </td>
                    <td className="px-2 py-2">
                      {toggleable ? (
                        <ToggleSwitch
                          checked={c.active}
                          ariaLabel={`Toggle ${c.name}`}
                          onChange={() => void toggleActive(c)}
                        />
                      ) : (
                        <span className="text-xs text-text-muted">Always on</span>
                      )}
                    </td>
                    <td className="px-2 py-2 text-right">
                      {c.isSystem ? (
                        <span className="text-xs text-text-muted">Can&apos;t delete</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void removeComponent(c)}
                          className="text-xs text-danger hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
