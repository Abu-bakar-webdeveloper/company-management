import { cn } from '@/shared/lib/cn'

type IconProps = { className?: string }

export function FiltersIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M2 4h14M5 9h8M8 14h2" strokeLinecap="round" />
    </svg>
  )
}

export function ExportIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M9 2v9M6 8l3 3 3-3M3 14h12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function EditIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M11.5 2.5 13.5 4.5 5 13H3v-2l8.5-8.5Z" strokeLinejoin="round" />
      <path d="M10 4 12 6" strokeLinecap="round" />
    </svg>
  )
}

export function PlusIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M8 3v10M3 8h10" strokeLinecap="round" />
    </svg>
  )
}

export function CloseIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M5 5l10 10M15 5 5 15" strokeLinecap="round" />
    </svg>
  )
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0 text-[#94a3b8]', className)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M3 2h3l1.5 4-2 1.5a8 8 0 0 0 4 4L12 9l4 1.5V14a1 1 0 0 1-1 1A11 11 0 0 1 2 3a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
    </svg>
  )
}

export function CnicIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0 text-[#94a3b8]', className)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M3 3h10v10H3z" strokeLinejoin="round" />
      <path d="M6 6h4M6 9h4" strokeLinecap="round" />
    </svg>
  )
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0 text-[#94a3b8]', className)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <rect x="2" y="3" width="12" height="11" rx="1.5" />
      <path d="M5 2v2M11 2v2M2 7h12" strokeLinecap="round" />
    </svg>
  )
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('size-4 shrink-0 text-[#94a3b8]', className)}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function RoleIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('size-4 shrink-0 text-[#94a3b8]', className)}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden
    >
      <rect x="2" y="5" width="12" height="9" rx="1.5" />
      <path d="M5 5V4a3 3 0 0 1 6 0v1" strokeLinecap="round" />
    </svg>
  )
}

export function DepartmentIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('size-4 shrink-0 text-[#94a3b8]', className)}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden
    >
      <path d="M2 14V3l6-2 6 2v11" strokeLinejoin="round" />
      <path d="M6 14v-4h4v4M6 6h4M6 9h4" strokeLinecap="round" />
    </svg>
  )
}

export function StatusIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('size-4 shrink-0 text-[#94a3b8]', className)}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M5.5 8 7 9.5 10.5 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function MailSmallIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0 text-[#94a3b8]', className)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <rect x="2" y="3" width="12" height="10" rx="1.5" />
      <path d="M2 5l6 4 6-4" strokeLinejoin="round" />
    </svg>
  )
}

export function IdCardIcon({ className = 'size-5 text-[#1877f2]' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="2" y="4" width="16" height="12" rx="2" />
      <circle cx="8" cy="10" r="2" />
      <path d="M13 8h3M13 11h3" strokeLinecap="round" />
    </svg>
  )
}

export function MapPinIcon({ className = 'size-5 text-[#1877f2]' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M10 18s6-5.4 6-10a6 6 0 1 0-12 0c0 4.6 6 10 6 10Z" />
      <circle cx="10" cy="8" r="2" />
    </svg>
  )
}

export function BriefcaseIcon({ className = 'size-5 text-[#1877f2]' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="2" y="6" width="16" height="11" rx="2" />
      <path d="M7 6V5a3 3 0 0 1 6 0v1" />
    </svg>
  )
}

export function DownloadIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M8 2v8M5 7l3 3 3-3M3 13h10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function EyeViewIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5Z" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  )
}

export function KeyIcon({ className = 'size-5 text-[#1877f2]' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M12 2a4 4 0 0 0-2.2 7.3L3 16.1V18h1.9l.7-.7 1.4 1.4 1.4-1.4 1.4 1.4 1.4-1.4 1.4 1.4 1.4-1.4.7.7H18v-1.9l-6.8-6.8A4 4 0 0 0 12 2Zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z" />
    </svg>
  )
}

export function BanIcon({ className = 'size-5 text-[#f97316]' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="10" cy="10" r="7" />
      <path d="M5 5l10 10" strokeLinecap="round" />
    </svg>
  )
}

export function UserOffIcon({ className = 'size-5 text-[#dc2626]' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="8" cy="6" r="3" />
      <path d="M2 17c0-3.3 2.7-6 6-6M14 6l4 4M16 8l-4 4" strokeLinecap="round" />
    </svg>
  )
}

export function UploadIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-6 shrink-0', className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 16V4M12 4 8 8M12 4l4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" />
    </svg>
  )
}

export function StarFilledIcon({ className = 'size-5 text-[#fbbf24]' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M10 2 12.4 7.4 18 8.1 14 12.2 15.1 18 10 15.2 4.9 18 6 12.2 2 8.1 7.6 7.4 10 2Z" />
    </svg>
  )
}
