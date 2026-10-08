import { cn } from '@/shared/lib/cn'
import { UserAvatar } from '@/shared/ui/UserAvatar'

type IconProps = { className?: string }

export function PlusIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M8 3v10M3 8h10" strokeLinecap="round" />
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

export function EyeIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 18 12" fill="currentColor" aria-hidden>
      <path d="M9 9.6C10.0227 9.6 10.892 9.25 11.608 8.55C12.3239 7.85 12.6818 7 12.6818 6C12.6818 5 12.3239 4.15 11.608 3.45C10.892 2.75 10.0227 2.4 9 2.4C7.97727 2.4 7.10795 2.75 6.39205 3.45C5.67614 4.15 5.31818 5 5.31818 6C5.31818 7 5.67614 7.85 6.39205 8.55C7.10795 9.25 7.97727 9.6 9 9.6ZM9 12C7.00909 12 5.19545 11.4567 3.55909 10.37C1.92273 9.28333 0.736364 7.82667 0 6C0.736364 4.17333 1.92273 2.71667 3.55909 1.63C5.19545 0.543333 7.00909 0 9 0C10.9909 0 12.8045 0.543333 14.4409 1.63C16.0773 2.71667 17.2636 4.17333 18 6C17.2636 7.82667 16.0773 9.28333 14.4409 10.37C12.8045 11.4567 10.9909 12 9 12Z" />
    </svg>
  )
}

export function EditIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M11.5 2.5a1.5 1.5 0 0 1 2 2L5 13l-3 1 1-3 8.5-8.5Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function DollarIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-5', className)} viewBox="0 0 10 18" fill="currentColor" aria-hidden>
      <path d="M3.7 18V15.85C2.81667 15.65 2.05417 15.2667 1.4125 14.7C0.770833 14.1333 0.3 13.3333 0 12.3L1.85 11.55C2.1 12.35 2.47083 12.9583 2.9625 13.375C3.45417 13.7917 4.1 14 4.9 14C5.58333 14 6.1625 13.8458 6.6375 13.5375C7.1125 13.2292 7.35 12.75 7.35 12.1C7.35 11.5167 7.16667 11.0542 6.8 10.7125C6.43333 10.3708 5.58333 9.98333 4.25 9.55C2.81667 9.1 1.83333 8.5625 1.3 7.9375C0.766667 7.3125 0.5 6.55 0.5 5.65C0.5 4.56667 0.85 3.725 1.55 3.125C2.25 2.525 2.96667 2.18333 3.7 2.1V0H5.7V2.1C6.53333 2.23333 7.22083 2.5375 7.7625 3.0125C8.30417 3.4875 8.7 4.06667 8.95 4.75L7.1 5.55C6.9 5.01667 6.61667 4.61667 6.25 4.35C5.88333 4.08333 5.38333 3.95 4.75 3.95C4.01667 3.95 3.45833 4.1125 3.075 4.4375C2.69167 4.7625 2.5 5.16667 2.5 5.65C2.5 6.2 2.75 6.63333 3.25 6.95C3.75 7.26667 4.61667 7.6 5.85 7.95C7 8.28333 7.87083 8.8125 8.4625 9.5375C9.05417 10.2625 9.35 11.1 9.35 12.05C9.35 13.2333 9 14.1333 8.3 14.75C7.6 15.3667 6.73333 15.75 5.7 15.9V18H3.7Z" />
    </svg>
  )
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-5 shrink-0', className)} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="10" cy="10" r="8" />
      <path d="M10 6v4l3 2" strokeLinecap="round" />
    </svg>
  )
}

export function CheckCircleIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-5 shrink-0', className)} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="10" cy="10" r="8" />
      <path d="m6.5 10 2.5 2.5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function XCircleIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-5 shrink-0', className)} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="10" cy="10" r="8" />
      <path d="m7 7 6 6M13 7l-6 6" strokeLinecap="round" />
    </svg>
  )
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M1.5 15C1.0875 15 0.734375 14.8531 0.440625 14.5594C0.146875 14.2656 0 13.9125 0 13.5V3C0 2.5875 0.146875 2.23438 0.440625 1.94062C0.734375 1.64687 1.0875 1.5 1.5 1.5H2.25V0H3.75V1.5H9.75V0H11.25V1.5H12C12.4125 1.5 12.7656 1.64687 13.0594 1.94062C13.3531 2.23438 13.5 2.5875 13.5 3V13.5C13.5 13.9125 13.3531 14.2656 13.0594 14.5594C12.7656 14.8531 12.4125 15 12 15H1.5ZM1.5 13.5H12V6H1.5V13.5ZM1.5 4.5H12V3H1.5V4.5Z" />
    </svg>
  )
}

export function UsersIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 18 14" fill="currentColor" aria-hidden>
      <path d="M0 12V9.9C0 9.475 0.109375 9.08437 0.328125 8.72812C0.546875 8.37187 0.8375 8.1 1.2 7.9125C1.975 7.525 2.7625 7.23438 3.5625 7.04063C4.3625 6.84688 5.175 6.75 6 6.75C6.825 6.75 7.6375 6.84688 8.4375 7.04063C9.2375 7.23438 10.025 7.525 10.8 7.9125C11.1625 8.1 11.4531 8.37187 11.6719 8.72812C11.8906 9.08437 12 9.475 12 9.9V12H0ZM13.5 12V9.75C13.5 9.2 13.3469 8.67188 13.0406 8.16562C12.7344 7.65937 12.3 7.225 11.7375 6.8625C12.375 6.9375 12.975 7.06562 13.5375 7.24687C14.1 7.42812 14.625 7.65 15.1125 7.9125C15.5625 8.1625 15.9062 8.44063 16.1437 8.74687C16.3812 9.05312 16.5 9.3875 16.5 9.75V12H13.5ZM6 6C5.175 6 4.46875 5.70625 3.88125 5.11875C3.29375 4.53125 3 3.825 3 3C3 2.175 3.29375 1.46875 3.88125 0.88125C4.46875 0.29375 5.175 0 6 0C6.825 0 7.53125 0.29375 8.11875 0.88125C8.70625 1.46875 9 2.175 9 3C9 3.825 8.70625 4.53125 8.11875 5.11875C7.53125 5.70625 6.825 6 6 6ZM13.5 3C13.5 3.825 13.2062 4.53125 12.6187 5.11875C12.0312 5.70625 11.325 6 10.5 6C10.3625 6 10.1875 5.98438 9.975 5.95312C9.7625 5.92188 9.5875 5.8875 9.45 5.85C9.7875 5.45 10.0469 5.00625 10.2281 4.51875C10.4094 4.03125 10.5 3.525 10.5 3C10.5 2.475 10.4094 1.96875 10.2281 1.48125C10.0469 0.99375 9.7875 0.55 9.45 0.15C9.625 0.0875 9.8 0.046875 9.975 0.028125C10.15 0.009375 10.325 0 10.5 0C11.325 0 12.0312 0.29375 12.6187 0.88125C13.2062 1.46875 13.5 2.175 13.5 3ZM1.5 10.5H10.5V9.9C10.5 9.7625 10.4656 9.6375 10.3969 9.525C10.3281 9.4125 10.2375 9.325 10.125 9.2625C9.45 8.925 8.76875 8.67188 8.08125 8.50313C7.39375 8.33438 6.7 8.25 6 8.25C5.3 8.25 4.60625 8.33438 3.91875 8.50313C3.23125 8.67188 2.55 8.925 1.875 9.2625C1.7625 9.325 1.67188 9.4125 1.60312 9.525C1.53437 9.6375 1.5 9.7625 1.5 9.9V10.5ZM6 4.5C6.4125 4.5 6.76562 4.35312 7.05937 4.05937C7.35312 3.76562 7.5 3.4125 7.5 3C7.5 2.5875 7.35312 2.23438 7.05937 1.94062C6.76562 1.64687 6.4125 1.5 6 1.5C5.5875 1.5 5.23438 1.64687 4.94063 1.94062C4.64688 2.23438 4.5 2.5875 4.5 3C4.5 3.4125 4.64688 3.76562 4.94063 4.05937C5.23438 4.35312 5.5875 4.5 6 4.5Z" />
    </svg>
  )
}

export function BriefcaseIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 18 16" fill="currentColor" aria-hidden>
      <path d="M1.5 14.25C1.0875 14.25 0.734375 14.1031 0.440625 13.8094C0.146875 13.5156 0 13.1625 0 12.75V4.5C0 4.0875 0.146875 3.73438 0.440625 3.44062C0.734375 3.14687 1.0875 3 1.5 3H4.5V1.5C4.5 1.0875 4.64688 0.734375 4.94063 0.440625C5.23438 0.146875 5.5875 0 6 0H9C9.4125 0 9.76562 0.146875 10.0594 0.440625C10.3531 0.734375 10.5 1.0875 10.5 1.5V3H13.5C13.9125 3 14.2656 3.14687 14.5594 3.44062C14.8531 3.73438 15 4.0875 15 4.5V12.75C15 13.1625 14.8531 13.5156 14.5594 13.8094C14.2656 14.1031 13.9125 14.25 13.5 14.25H1.5ZM1.5 12.75H13.5V4.5H1.5V12.75ZM6 3H9V1.5H6V3Z" />
    </svg>
  )
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function DownloadIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M8 2v8M4.5 7.5 8 11l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 13h12" strokeLinecap="round" />
    </svg>
  )
}

export function FileIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-8 shrink-0', className)} viewBox="0 0 32 40" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M8 2h12l8 8v26a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
      <path d="M20 2v8h8" />
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
