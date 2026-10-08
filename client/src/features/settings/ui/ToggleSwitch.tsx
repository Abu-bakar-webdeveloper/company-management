import { cn } from '@/shared/lib/cn'

type ToggleSwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  ariaLabel: string
  className?: string
}

export function ToggleSwitch({ checked, onChange, ariaLabel, className }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors',
        checked ? 'bg-primary' : 'bg-[#CBD5E1]',
        className,
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 size-5 rounded-full bg-white shadow transition-all',
          checked ? 'left-[22px]' : 'left-0.5',
        )}
      />
    </button>
  )
}
