import { cn } from '@/shared/lib/cn'
import { UserAvatar } from '@/shared/ui/UserAvatar'

type IconProps = { className?: string }

export function ShieldUserIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-5 shrink-0', className)} viewBox="0 0 18 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M9 1.5 16 4v5c0 4.5-3 8.1-7 9.5-4-1.4-7-5-7-9.5V4l7-2.5Z" strokeLinejoin="round" />
      <circle cx="9" cy="8" r="2" />
      <path d="M5.8 13.2c.7-1.3 1.9-2 3.2-2s2.5.7 3.2 2" strokeLinecap="round" />
    </svg>
  )
}

export function CompanyIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-5 shrink-0', className)} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="2" y="2" width="14" height="14" rx="1.5" />
      <path d="M9 2v14M2 6.5h7M2 11.5h7M12 6h1.5M12 9h1.5M12 12h1.5" strokeLinecap="round" />
    </svg>
  )
}

export function UserPlusIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-5 shrink-0', className)} viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="8" cy="5" r="3" />
      <path d="M2.5 14.5c0-2.8 2.4-5 5.5-5s5.5 2.2 5.5 5" strokeLinecap="round" />
      <path d="M16 5v5M13.5 7.5h5" strokeLinecap="round" />
    </svg>
  )
}

export function BellIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-5 shrink-0', className)} viewBox="0 0 16 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M8 2a5 5 0 0 1 5 5v3l1.5 3h-13L3 10V7a5 5 0 0 1 5-5Z" strokeLinejoin="round" />
      <path d="M6.5 15.5a1.5 1.5 0 0 0 3 0" strokeLinecap="round" />
    </svg>
  )
}

export function GearIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-5 shrink-0', className)} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="9" cy="9" r="2.5" />
      <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.7 3.7l1.4 1.4M12.9 12.9l1.4 1.4M14.3 3.7l-1.4 1.4M5.1 12.9l-1.4 1.4" strokeLinecap="round" />
    </svg>
  )
}

export function GlobeIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-5 shrink-0', className)} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="9" cy="9" r="7.5" />
      <path d="M1.5 9h15M9 1.5c2.5 2.8 3.8 6.2 3.8 7.5S11.5 13.2 9 16M9 1.5C6.5 4.3 5.2 7.7 5.2 9s1.3 4.7 3.8 7.5M5.2 4.2h7.6M5.2 13.8h7.6" strokeLinecap="round" />
    </svg>
  )
}

export function PaletteIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('size-5 shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.12a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.55-2.5 5.55-5.55C21.97 6.01 17.46 2 12 2Z" />
      <circle cx="7.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function LayoutIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-5 shrink-0', className)} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="1.5" y="1.5" width="15" height="15" rx="2" />
      <path d="M1.5 6.5h15M6.5 6.5v10" />
    </svg>
  )
}

export function CloudIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-5 shrink-0', className)} viewBox="0 0 20 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4.5 11.5h11a3.5 3.5 0 0 0 .4-7A5 5 0 0 0 3.5 5.5 3.5 3.5 0 0 0 4.5 11.5Z" strokeLinejoin="round" />
    </svg>
  )
}

export function ShieldCheckIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-5 shrink-0', className)} viewBox="0 0 18 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M9 1.5 16 4v5c0 4.5-3 8.1-7 9.5-4-1.4-7-5-7-9.5V4l7-2.5Z" strokeLinejoin="round" />
      <path d="m6 9.5 2.2 2.2L12.5 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ListIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 16 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M1.5 2h2M1.5 7h2M1.5 12h2M6.5 2h8M6.5 7h8M6.5 12h8" strokeLinecap="round" />
    </svg>
  )
}

export function BriefcaseIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 18 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="1.5" y="4" width="15" height="10.5" rx="1.5" />
      <path d="M6 4V2.5A1.5 1.5 0 0 1 7.5 1h3A1.5 1.5 0 0 1 12 2.5V4M1.5 8.5h15" />
    </svg>
  )
}

export function AlertTriangleIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 18 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M9 1.5 16.8 14.5H1.2L9 1.5Z" strokeLinejoin="round" />
      <path d="M9 6.5v3.5M9 12.2v.3" strokeLinecap="round" />
    </svg>
  )
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="7" cy="7" r="5" />
      <path d="m11 11 3 3" strokeLinecap="round" />
    </svg>
  )
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-3.5 shrink-0', className)} viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M1 1.5 6 6.5 11 1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function EyeIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 18 12" fill="currentColor" aria-hidden>
      <path d="M9 9.6C10.0227 9.6 10.892 9.25 11.608 8.55C12.3239 7.85 12.6818 7 12.6818 6C12.6818 5 12.3239 4.15 11.608 3.45C10.892 2.75 10.0227 2.4 9 2.4C7.97727 2.4 7.10795 2.75 6.39205 3.45C5.67614 4.15 5.31818 5 5.31818 6C5.31818 7 5.67614 7.85 6.39205 8.55C7.10795 9.25 7.97727 9.6 9 9.6ZM9 8.16C8.38636 8.16 7.86477 7.95 7.43523 7.53C7.00568 7.11 6.79091 6.6 6.79091 6C6.79091 5.4 7.00568 4.89 7.43523 4.47C7.86477 4.05 8.38636 3.84 9 3.84C9.61364 3.84 10.1352 4.05 10.5648 4.47C10.9943 4.89 11.2091 5.4 11.2091 6C11.2091 6.6 10.9943 7.11 10.5648 7.53C10.1352 7.95 9.61364 8.16 9 8.16ZM9 12C7.00909 12 5.19545 11.4567 3.55909 10.37C1.92273 9.28333 0.736364 7.82667 0 6C0.736364 4.17333 1.92273 2.71667 3.55909 1.63C5.19545 0.543333 7.00909 0 9 0C10.9909 0 12.8045 0.543333 14.4409 1.63C16.0773 2.71667 17.2636 4.17333 18 6C17.2636 7.82667 16.0773 9.28333 14.4409 10.37C12.8045 11.4567 10.9909 12 9 12Z" />
    </svg>
  )
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-5 shrink-0', className)} viewBox="0 0 18 20" fill="currentColor" aria-hidden>
      <path d="M9 0.5 17 3.4v5.4c0 5-3.4 9.2-8 10.7-4.6-1.5-8-5.7-8-10.7V3.4L9 0.5Zm0 2.1L3 4.8v4c0 3.9 2.5 7.3 6 8.6 3.5-1.3 6-4.7 6-8.6v-4L9 2.6Z" />
      <path d="M9 4.5a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4ZM5.4 12.6c.8-1.4 2.1-2.2 3.6-2.2s2.8.8 3.6 2.2c-.9 1.3-2.2 2.2-3.6 2.6-1.4-.4-2.7-1.3-3.6-2.6Z" />
    </svg>
  )
}

export function UsersIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-5 shrink-0', className)} viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="7" cy="5" r="3" />
      <path d="M1.5 14.5c0-2.8 2.4-5 5.5-5s5.5 2.2 5.5 5" strokeLinecap="round" />
      <path d="M13.5 2.3a3 3 0 0 1 0 5.4M15.5 9.8c1.8.7 3 2.3 3 4.7" strokeLinecap="round" />
    </svg>
  )
}

export function UserIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-5 shrink-0', className)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="8" cy="5" r="3" />
      <path d="M2.5 14.5c0-2.8 2.4-5 5.5-5s5.5 2.2 5.5 5" strokeLinecap="round" />
    </svg>
  )
}

export function CheckCircleSolidIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-5 shrink-0', className)} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M10 0a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm4.7 7.3-1.4-1.4L8.5 10.7 6.7 8.9 5.3 10.3l3.2 3.2 6.2-6.2Z" />
    </svg>
  )
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M8 3v10M3 8h10" strokeLinecap="round" />
    </svg>
  )
}

export function PlusCircleIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-5 shrink-0', className)} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="10" cy="10" r="8.5" />
      <path d="M10 6.5v7M6.5 10h7" strokeLinecap="round" />
    </svg>
  )
}

export function EditIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M11.5 2.5a1.4 1.4 0 0 1 2 2L5 13l-2.7.7L3 11l8.5-8.5Z" strokeLinejoin="round" />
    </svg>
  )
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 14 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M1 3.5h12M5.5 1.5h3M2.5 3.5l.8 10.5a1 1 0 0 0 1 .9h5.4a1 1 0 0 0 1-.9l.8-10.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 6.5v5M8.5 6.5v5" strokeLinecap="round" />
    </svg>
  )
}

export function AvatarCircle({
  name,
  avatar,
  className,
}: {
  name: string
  avatar?: string
  className?: string
}) {
  return <UserAvatar name={name} avatar={avatar} size="md" className={className} />
}
