import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftIcon } from '@/shared/ui/icons'

type SettingsPageShellProps = {
  title: string
  subtitle: string
  children: ReactNode
  onSave?: () => void
  saving?: boolean
  saveLabel?: string
  headerExtra?: ReactNode
  showBackLink?: boolean
}

export function SettingsPageShell({
  title,
  subtitle,
  children,
  onSave,
  saving,
  saveLabel = 'Save Changes',
  headerExtra,
  showBackLink = true,
}: SettingsPageShellProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {showBackLink && (
        <Link
          to="/settings"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-heading"
        >
          <ArrowLeftIcon className="text-text-muted" />
          Back to Settings
        </Link>
      )}

      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[28px] font-bold leading-9 text-heading sm:text-[30px]">{title}</h1>
          <p className="mt-1 text-base leading-6 text-text-muted">{subtitle}</p>
          {headerExtra}
        </div>
        {onSave && (
          <button
            type="button"
            disabled={saving}
            onClick={onSave}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95 disabled:opacity-70"
          >
            {saving ? 'Saving…' : saveLabel}
          </button>
        )}
      </header>

      {children}
    </div>
  )
}

export function SettingsSectionCard({
  title,
  icon,
  children,
  action,
}: {
  title: string
  icon?: ReactNode
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <section className="mb-6 rounded-2xl border border-border-card bg-surface p-4 shadow-[var(--shadow-stat)] sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {icon && (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-primary">
              {icon}
            </span>
          )}
          <h2 className="text-base font-bold text-heading sm:text-lg">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-text-muted">
      {children}
    </p>
  )
}

export function SettingsFormFooter({
  onCancel,
  onSave,
  saving,
  saveLabel = 'Save Changes',
}: {
  onCancel: () => void
  onSave: () => void
  saving?: boolean
  saveLabel?: string
}) {
  return (
    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-surface px-5 text-sm font-semibold text-heading hover:bg-surface-muted"
      >
        Cancel
      </button>
      <button
        type="button"
        disabled={saving}
        onClick={onSave}
        className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95 disabled:opacity-70"
      >
        {saving ? 'Saving…' : saveLabel}
      </button>
    </div>
  )
}
