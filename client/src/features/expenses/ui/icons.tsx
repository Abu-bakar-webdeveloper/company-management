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

export function EditIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M11.55 9.14995V11.55C11.55 11.8682 11.4236 12.1734 11.1985 12.3985C10.9735 12.6235 10.6683 12.75 10.35 12.75H1.95C1.63174 12.75 1.32652 12.6235 1.10147 12.3985C0.876428 12.1734 0.75 11.8682 0.75 11.55V3.14995C0.75 2.83169 0.876428 2.52647 1.10147 2.30142C1.32652 2.07638 1.63174 1.94995 1.95 1.94995H4.35" stroke="#136DEC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M7.04961 9.03L12.7496 3.27L10.2296 0.75L4.52961 6.45L4.34961 9.15L7.04961 9.03Z" stroke="#136DEC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  )
}

export function EyeIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 18 12" fill="none" stroke="currentColor" strokeWidth="0.25" aria-hidden>
      <path d="M9 9.6C10.0227 9.6 10.892 9.25 11.608 8.55C12.3239 7.85 12.6818 7 12.6818 6C12.6818 5 12.3239 4.15 11.608 3.45C10.892 2.75 10.0227 2.4 9 2.4C7.97727 2.4 7.10795 2.75 6.39205 3.45C5.67614 4.15 5.31818 5 5.31818 6C5.31818 7 5.67614 7.85 6.39205 8.55C7.10795 9.25 7.97727 9.6 9 9.6ZM9 8.16C8.38636 8.16 7.86477 7.95 7.43523 7.53C7.00568 7.11 6.79091 6.6 6.79091 6C6.79091 5.4 7.00568 4.89 7.43523 4.47C7.86477 4.05 8.38636 3.84 9 3.84C9.61364 3.84 10.1352 4.05 10.5648 4.47C10.9943 4.89 11.2091 5.4 11.2091 6C11.2091 6.6 10.9943 7.11 10.5648 7.53C10.1352 7.95 9.61364 8.16 9 8.16ZM9 12C7.00909 12 5.19545 11.4567 3.55909 10.37C1.92273 9.28333 0.736364 7.82667 0 6C0.736364 4.17333 1.92273 2.71667 3.55909 1.63C5.19545 0.543333 7.00909 0 9 0C10.9909 0 12.8045 0.543333 14.4409 1.63C16.0773 2.71667 17.2636 4.17333 18 6C17.2636 7.82667 16.0773 9.28333 14.4409 10.37C12.8045 11.4567 10.9909 12 9 12ZM9 10.4C10.5409 10.4 11.9557 10.0033 13.2443 9.21C14.533 8.41667 15.5182 7.34667 16.2 6C15.5182 4.65333 14.533 3.58333 13.2443 2.79C11.9557 1.99667 10.5409 1.6 9 1.6C7.45909 1.6 6.04432 1.99667 4.75568 2.79C3.46705 3.58333 2.48182 4.65333 1.8 6C2.48182 7.34667 3.46705 8.41667 4.75568 9.21C6.04432 10.0033 7.45909 10.4 9 10.4Z" fill="currentColor"/>
    </svg>  
  )
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 14 16" fill="none" stroke="currentColor" strokeWidth="0.25" aria-hidden>
      <path d="M2.25 14C1.8375 14 1.48438 13.8477 1.19063 13.5431C0.896875 13.2384 0.75 12.8722 0.75 12.4444V2.33333H0V0.777778H3.75V0H8.25V0.777778H12V2.33333H11.25V12.4444C11.25 12.8722 11.1031 13.2384 10.8094 13.5431C10.5156 13.8477 10.1625 14 9.75 14H2.25ZM9.75 2.33333H2.25V12.4444H9.75V2.33333ZM3.75 10.8889H5.25V3.88889H3.75V10.8889ZM6.75 10.8889H8.25V3.88889H6.75V10.8889Z" fill="currentColor"/>
    </svg>
  )
}

export function PaperclipIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 14 18" fill="currentColor" aria-hidden>
      <path d="M9.375 10.3125C9.375 11.6125 8.91875 12.7188 8.00625 13.6313C7.09375 14.5438 5.9875 15 4.6875 15C3.3875 15 2.28125 14.5438 1.36875 13.6313C0.45625 12.7188 0 11.6125 0 10.3125V3.375C0 2.4375 0.328125 1.64062 0.984375 0.984375C1.64062 0.328125 2.4375 0 3.375 0C4.3125 0 5.10938 0.328125 5.76562 0.984375C6.42188 1.64062 6.75 2.4375 6.75 3.375V9.9375C6.75 10.5125 6.55 11 6.15 11.4C5.75 11.8 5.2625 12 4.6875 12C4.1125 12 3.625 11.8 3.225 11.4C2.825 11 2.625 10.5125 2.625 9.9375V3H4.125V9.9375C4.125 10.1 4.17813 10.2344 4.28438 10.3406C4.39062 10.4469 4.525 10.5 4.6875 10.5C4.85 10.5 4.98438 10.4469 5.09062 10.3406C5.19687 10.2344 5.25 10.1 5.25 9.9375V3.375C5.2375 2.85 5.05312 2.40625 4.69688 2.04375C4.34063 1.68125 3.9 1.5 3.375 1.5C2.85 1.5 2.40625 1.68125 2.04375 2.04375C1.68125 2.40625 1.5 2.85 1.5 3.375V10.3125C1.4875 11.2 1.79375 11.9531 2.41875 12.5719C3.04375 13.1906 3.8 13.5 4.6875 13.5C5.5625 13.5 6.30625 13.1906 6.91875 12.5719C7.53125 11.9531 7.85 11.2 7.875 10.3125V3H9.375V10.3125Z" fill="#136DEC"/>
    </svg>
  )
}

export function DollarIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-5', className)} viewBox="0 0 09 18" fill="currentColor" aria-hidden>
      <path d="M3.7 18V15.85C2.81667 15.65 2.05417 15.2667 1.4125 14.7C0.770833 14.1333 0.3 13.3333 0 12.3L1.85 11.55C2.1 12.35 2.47083 12.9583 2.9625 13.375C3.45417 13.7917 4.1 14 4.9 14C5.58333 14 6.1625 13.8458 6.6375 13.5375C7.1125 13.2292 7.35 12.75 7.35 12.1C7.35 11.5167 7.16667 11.0542 6.8 10.7125C6.43333 10.3708 5.58333 9.98333 4.25 9.55C2.81667 9.1 1.83333 8.5625 1.3 7.9375C0.766667 7.3125 0.5 6.55 0.5 5.65C0.5 4.56667 0.85 3.725 1.55 3.125C2.25 2.525 2.96667 2.18333 3.7 2.1V0H5.7V2.1C6.53333 2.23333 7.22083 2.5375 7.7625 3.0125C8.30417 3.4875 8.7 4.06667 8.95 4.75L7.1 5.55C6.9 5.01667 6.61667 4.61667 6.25 4.35C5.88333 4.08333 5.38333 3.95 4.75 3.95C4.01667 3.95 3.45833 4.1125 3.075 4.4375C2.69167 4.7625 2.5 5.16667 2.5 5.65C2.5 6.2 2.75 6.63333 3.25 6.95C3.75 7.26667 4.61667 7.6 5.85 7.95C7 8.28333 7.87083 8.8125 8.4625 9.5375C9.05417 10.2625 9.35 11.1 9.35 12.05C9.35 13.2333 9 14.1333 8.3 14.75C7.6 15.3667 6.73333 15.75 5.7 15.9V18H3.7Z" fill="#136DEC"/>
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
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="0" aria-hidden>
    <path d="M1.5 15C1.0875 15 0.734375 14.8531 0.440625 14.5594C0.146875 14.2656 0 13.9125 0 13.5V3C0 2.5875 0.146875 2.23438 0.440625 1.94062C0.734375 1.64687 1.0875 1.5 1.5 1.5H2.25V0H3.75V1.5H9.75V0H11.25V1.5H12C12.4125 1.5 12.7656 1.64687 13.0594 1.94062C13.3531 2.23438 13.5 2.5875 13.5 3V13.5C13.5 13.9125 13.3531 14.2656 13.0594 14.5594C12.7656 14.8531 12.4125 15 12 15H1.5ZM1.5 13.5H12V6H1.5V13.5ZM1.5 4.5H12V3H1.5V4.5ZM1.5 4.5V3V4.5Z" fill="#00284F"/>
    </svg>    
  )
}

export function UsersIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 18 14" fill="currentColor" aria-hidden>
      <path d="M0 12V9.9C0 9.475 0.109375 9.08437 0.328125 8.72812C0.546875 8.37187 0.8375 8.1 1.2 7.9125C1.975 7.525 2.7625 7.23438 3.5625 7.04063C4.3625 6.84688 5.175 6.75 6 6.75C6.825 6.75 7.6375 6.84688 8.4375 7.04063C9.2375 7.23438 10.025 7.525 10.8 7.9125C11.1625 8.1 11.4531 8.37187 11.6719 8.72812C11.8906 9.08437 12 9.475 12 9.9V12H0ZM13.5 12V9.75C13.5 9.2 13.3469 8.67188 13.0406 8.16562C12.7344 7.65937 12.3 7.225 11.7375 6.8625C12.375 6.9375 12.975 7.06562 13.5375 7.24687C14.1 7.42812 14.625 7.65 15.1125 7.9125C15.5625 8.1625 15.9062 8.44063 16.1437 8.74687C16.3812 9.05312 16.5 9.3875 16.5 9.75V12H13.5ZM6 6C5.175 6 4.46875 5.70625 3.88125 5.11875C3.29375 4.53125 3 3.825 3 3C3 2.175 3.29375 1.46875 3.88125 0.88125C4.46875 0.29375 5.175 0 6 0C6.825 0 7.53125 0.29375 8.11875 0.88125C8.70625 1.46875 9 2.175 9 3C9 3.825 8.70625 4.53125 8.11875 5.11875C7.53125 5.70625 6.825 6 6 6ZM13.5 3C13.5 3.825 13.2062 4.53125 12.6187 5.11875C12.0312 5.70625 11.325 6 10.5 6C10.3625 6 10.1875 5.98438 9.975 5.95312C9.7625 5.92188 9.5875 5.8875 9.45 5.85C9.7875 5.45 10.0469 5.00625 10.2281 4.51875C10.4094 4.03125 10.5 3.525 10.5 3C10.5 2.475 10.4094 1.96875 10.2281 1.48125C10.0469 0.99375 9.7875 0.55 9.45 0.15C9.625 0.0875 9.8 0.046875 9.975 0.028125C10.15 0.009375 10.325 0 10.5 0C11.325 0 12.0312 0.29375 12.6187 0.88125C13.2062 1.46875 13.5 2.175 13.5 3ZM1.5 10.5H10.5V9.9C10.5 9.7625 10.4656 9.6375 10.3969 9.525C10.3281 9.4125 10.2375 9.325 10.125 9.2625C9.45 8.925 8.76875 8.67188 8.08125 8.50313C7.39375 8.33438 6.7 8.25 6 8.25C5.3 8.25 4.60625 8.33438 3.91875 8.50313C3.23125 8.67188 2.55 8.925 1.875 9.2625C1.7625 9.325 1.67188 9.4125 1.60312 9.525C1.53437 9.6375 1.5 9.7625 1.5 9.9V10.5ZM6 4.5C6.4125 4.5 6.76562 4.35312 7.05937 4.05937C7.35312 3.76562 7.5 3.4125 7.5 3C7.5 2.5875 7.35312 2.23438 7.05937 1.94062C6.76562 1.64687 6.4125 1.5 6 1.5C5.5875 1.5 5.23438 1.64687 4.94063 1.94062C4.64688 2.23438 4.5 2.5875 4.5 3C4.5 3.4125 4.64688 3.76562 4.94063 4.05937C5.23438 4.35312 5.5875 4.5 6 4.5Z" fill="#00284F"/>
    </svg>    
  )
}

export function BriefcaseIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 18 16" fill="currentColor" aria-hidden>
      <path d="M1.5 14.25C1.0875 14.25 0.734375 14.1031 0.440625 13.8094C0.146875 13.5156 0 13.1625 0 12.75V4.5C0 4.0875 0.146875 3.73438 0.440625 3.44062C0.734375 3.14687 1.0875 3 1.5 3H4.5V1.5C4.5 1.0875 4.64688 0.734375 4.94063 0.440625C5.23438 0.146875 5.5875 0 6 0H9C9.4125 0 9.76562 0.146875 10.0594 0.440625C10.3531 0.734375 10.5 1.0875 10.5 1.5V3H13.5C13.9125 3 14.2656 3.14687 14.5594 3.44062C14.8531 3.73438 15 4.0875 15 4.5V12.75C15 13.1625 14.8531 13.5156 14.5594 13.8094C14.2656 14.1031 13.9125 14.25 13.5 14.25H1.5ZM1.5 12.75H13.5V4.5H1.5V12.75ZM6 3H9V1.5H6V3ZM1.5 12.75V4.5V12.75Z" fill="#00284F"/>
    </svg>    
  )
}

export function UploadIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-6 shrink-0', className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8M8 12l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
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

export function LaptopIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-6 shrink-0', className)} viewBox="0 0 24 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="2" y="3" width="20" height="13" rx="2" />
      <path d="M1 18h22" strokeLinecap="round" />
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
