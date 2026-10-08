import { cn } from '@/shared/lib/cn'

type IconProps = { className?: string }

export function MailVerifyIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('size-10 shrink-0 text-primary', className)}
      width={40}
      height={32}
      viewBox="0 0 40 32"
      fill="none"
      aria-hidden
    >
      <rect x="2" y="4" width="36" height="24" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M2 8l18 12L38 8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

export function ShieldClockIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('size-8 shrink-0 text-primary', className)}
      width={32}
      height={40}
      viewBox="0 0 32 40"
      fill="none"
      aria-hidden
    >
      <path
        d="M16 2 4 8v10c0 7.7 5.1 14.9 12 16.7C23 32.9 28 25.7 28 18V8L16 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="18" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 15v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function InfoCircleIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('size-3 shrink-0 text-text-muted', className)}
      width={12}
      height={12}
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
    >
      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 5v3M6 3.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

export function LogoutIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('size-[18px] shrink-0', className)}
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <path d="M7 2H3v14h4M12 9H6M12 9l3-3M12 9l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function HourglassIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('size-4 shrink-0 text-primary', className)}
      width={16}
      height={15}
      viewBox="0 0 17 15"
      fill="none"
      aria-hidden
    >
      <path
        d="M2 1h13v2L9 8l6 5v2H2v-2l6-5L2 3V1Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  )
}
