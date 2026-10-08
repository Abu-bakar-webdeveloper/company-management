import { cn } from '@/shared/lib/cn'
import { UserAvatar } from '@/shared/ui/UserAvatar'

type IconProps = { className?: string }

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="2" y="3" width="14" height="13" rx="2" />
      <path d="M2 7h14M6 1v4M12 1v4" strokeLinecap="round" />
    </svg>
  )
}

export function ExportIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M9 2v9M5.5 7.5 9 11l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 14h12" strokeLinecap="round" />
    </svg>
  )
}

export function DownloadIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-3.5 shrink-0', className)} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M7 1.5v7M4 5.5 7 8.5l3-3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 12h10" strokeLinecap="round" />
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

export function SearchIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="7" cy="7" r="5" />
      <path d="m11 11 3 3" strokeLinecap="round" />
    </svg>
  )
}

export function FileTextIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 16 18" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M3 1.5h7L14 5v11.5H3V1.5Z" strokeLinejoin="round" />
      <path d="M10 1.5V5h4" strokeLinejoin="round" />
      <path d="M5.5 9h5M5.5 12h5" strokeLinecap="round" />
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

export function FolderIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-5 shrink-0', className)} viewBox="0 0 20 17" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M1.5 3.5a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-10Z" strokeLinejoin="round" />
    </svg>
  )
}

export function LeaveIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-5 shrink-0', className)} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="2" y="3" width="14" height="13" rx="2" />
      <path d="M2 7h14M6 1v4M12 1v4" strokeLinecap="round" />
      <path d="m6.5 11.5 1.8 1.8 3.2-3.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function WalletIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-5 shrink-0', className)} viewBox="0 0 20 17" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="1.5" y="2.5" width="17" height="12.5" rx="2.5" />
      <path d="M1.5 6h17" />
      <circle cx="14.5" cy="11" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function TrendIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-5 shrink-0', className)} viewBox="0 0 18 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M1.5 10.5 6.5 5.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.5 1.5h5v5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function PdfIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 16 18" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M3 1.5h7L14 5v11.5H3V1.5Z" strokeLinejoin="round" />
      <path d="M10 1.5V5h4" strokeLinejoin="round" />
      <path d="M5.5 10h5M5.5 13h3" strokeLinecap="round" />
    </svg>
  )
}

export function ExcelIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" />
      <path d="M1.5 6h13M1.5 10.5h13M6 6v8.5M10.5 6v8.5" />
    </svg>
  )
}

export function DollarIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-5 shrink-0', className)} viewBox="0 0 12 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M6 1v16M10 4.5C10 3 8.2 2.2 6 2.2S2 3.2 2 5s1.6 2.6 4 3c2.4.4 4 1.2 4 3s-1.8 2.8-4 2.8-4-.8-4-2.3" strokeLinecap="round" />
    </svg>
  )
}

export function CheckCircleIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-5 shrink-0', className)} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="9" cy="9" r="7.5" />
      <path d="m5.8 9.2 2.2 2.2 4.2-4.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function MoreIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 16 4" fill="currentColor" aria-hidden>
      <circle cx="2" cy="2" r="2" />
      <circle cx="8" cy="2" r="2" />
      <circle cx="14" cy="2" r="2" />
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
  return <UserAvatar name={name} avatar={avatar} size="sm" className={className} />
}
