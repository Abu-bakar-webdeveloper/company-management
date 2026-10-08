import { cn } from '@/shared/lib/cn'

type IconProps = { className?: string }

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('size-4 shrink-0', className)}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <rect x="2" y="3" width="12" height="11" rx="1.5" />
      <path d="M5 2v2M11 2v2M2 7h12" strokeLinecap="round" />
    </svg>
  )
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('size-4 shrink-0', className)}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5v3l2 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ActivityIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('size-4 shrink-0', className)}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5v3l2 2" strokeLinecap="round" />
    </svg>
  )
}

export function EditIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('size-4 shrink-0', className)}
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path
        d="M11.55 9.15v2.4a1.2 1.2 0 0 1-1.2 1.2h-8.4a1.2 1.2 0 0 1-1.2-1.2v-8.4a1.2 1.2 0 0 1 1.2-1.2h2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m7.05 9.03 5.7-5.76L10.23.75l-5.7 5.7-.18 2.7 2.7-.12Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ArrowLeftIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('size-4 shrink-0', className)}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M10 3 5 8l5 5M5 8h8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
