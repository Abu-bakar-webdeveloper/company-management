import { InfoIcon } from '@/shared/ui/icons'

export function PasswordRequirementsHint() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border-card bg-surface-input px-4 py-3">
      <InfoIcon className="mt-0.5 size-4 shrink-0 text-primary" />
      <p className="text-xs leading-5 text-text-muted">
        Password must be at least 8 characters and include an uppercase letter and a number.
      </p>
    </div>
  )
}
