import {
  COMPANY_HUBS,
  COMPANY_HUB_DESCRIPTIONS,
  COMPANY_HUB_LABELS,
  type CompanyHub,
} from '@/features/auth/model/companyHubs'
import { Checkbox } from '@/shared/ui/Checkbox'
import { cn } from '@/shared/lib/cn'

type CompanyHubsFieldProps = {
  value: CompanyHub[]
  onChange: (next: CompanyHub[]) => void
  error?: string
}

export function CompanyHubsField({ value, onChange, error }: CompanyHubsFieldProps) {
  const selected = new Set(value)

  const toggle = (hub: CompanyHub, enabled: boolean) => {
    if (enabled) {
      onChange(COMPANY_HUBS.filter((item) => item === hub || selected.has(item)))
      return
    }
    onChange(value.filter((item) => item !== hub))
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {COMPANY_HUBS.map((hub) => {
          const checked = selected.has(hub)
          return (
            <label
              key={hub}
              className={cn(
                'flex cursor-pointer items-start justify-between gap-3 rounded-xl border p-4',
                checked
                  ? 'border-primary/30 bg-[#EFF6FF]/40'
                  : 'border-border-card bg-surface',
              )}
            >
              <span>
                <span className="block text-sm font-semibold text-heading">
                  {COMPANY_HUB_LABELS[hub]}
                </span>
                <span className="mt-1 block text-xs leading-5 text-text-muted">
                  {COMPANY_HUB_DESCRIPTIONS[hub]}
                </span>
              </span>
              <Checkbox
                checked={checked}
                onChange={(event) => toggle(hub, event.target.checked)}
                aria-label={`${checked ? 'Disable' : 'Enable'} ${COMPANY_HUB_LABELS[hub]}`}
                className="mt-0.5 size-[18px] accent-primary"
              />
            </label>
          )
        })}
      </div>
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
    </div>
  )
}
