import { cn } from '@/shared/lib/cn'

type IconProps = { className?: string }

export function PlusIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M8 3v10M3 8h10" strokeLinecap="round" />
    </svg>
  )
}

export function EditPenIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M7.05156 9.03L12.7516 3.27L10.2316 0.75L4.53156 6.45L4.35156 9.15L7.05156 9.03Z" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11.55 9.1502V11.5502C11.55 11.8685 11.4236 12.1737 11.1985 12.3987C10.9735 12.6238 10.6683 12.7502 10.35 12.7502H1.95C1.63174 12.7502 1.32652 12.6238 1.10147 12.3987C0.876428 12.1737 0.75 11.8685 0.75 11.5502V3.1502C0.75 2.83194 0.876428 2.52671 1.10147 2.30167C1.32652 2.07662 1.63174 1.9502 1.95 1.9502H4.35" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function MoreVertIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 4 16" fill="currentColor" aria-hidden>
      <circle cx="2" cy="2" r="1.5" />
      <circle cx="2" cy="8" r="1.5" />
      <circle cx="2" cy="14" r="1.5" />
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

export function MailIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M2 14C1.45 14 0.979167 13.8042 0.5875 13.4125C0.195833 13.0208 0 12.55 0 12V4C0 3.45 0.195833 2.97917 0.5875 2.5875C0.979167 2.19583 1.45 2 2 2H14C14.55 2 15.0208 2.19583 15.4125 2.5875C15.8042 2.97917 16 3.45 16 4V12C16 12.55 15.8042 13.0208 15.4125 13.4125C15.0208 13.8042 14.55 14 14 14H2ZM14 5.825L8.175 9.65L2 5.8V12H14V5.825ZM2 4.25L8.175 8.175L14 4.25V4H2V4.25Z" />
    </svg>
  )
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M3.5 1C2.95 1 2.47917 1.19583 2.0875 1.5875C1.69583 1.97917 1.5 2.45 1.5 3V4.5C1.5 9.75 6.25 14.5 11.5 14.5H13C13.55 14.5 14.0208 14.3042 14.4125 13.9125C14.8042 13.5208 15 13.05 15 12.5V10.35C15 9.93333 14.8583 9.58333 14.575 9.3C14.2917 9.01667 13.9417 8.875 13.525 8.875L10.75 9.25C10.3667 9.3 10.0208 9.45 9.7125 9.7C9.40417 9.95 9.18333 10.2667 9.05 10.65L8.5 12.25C7.16667 11.5833 6.04167 10.7083 5.125 9.625C4.20833 8.54167 3.58333 7.33333 3.25 6L4.85 5.45C5.23333 5.31667 5.55 5.09583 5.8 4.7875C6.05 4.47917 6.2 4.13333 6.25 3.75L6.625 0.975C6.625 0.558333 6.48333 0.208333 6.2 -0.075C5.91667 -0.358333 5.56667 -0.5 5.15 -0.5H3.5V1Z" />
    </svg>
  )
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M3.5 16C2.95 16 2.47917 15.8042 2.0875 15.4125C1.69583 15.0208 1.5 14.55 1.5 14V4C1.5 3.45 1.69583 2.97917 2.0875 2.5875C2.47917 2.19583 2.95 2 3.5 2H4.5V0H6V2H10V0H11.5V2H12.5C13.05 2 13.5208 2.19583 13.9125 2.5875C14.3042 2.97917 14.5 3.45 14.5 4V14C14.5 14.55 14.3042 15.0208 13.9125 15.4125C13.5208 15.8042 13.05 16 12.5 16H3.5ZM3.5 14H12.5V7H3.5V14ZM3.5 5.5H12.5V4H3.5V5.5ZM6 10.5H8V8.5H6V10.5Z" />
    </svg>
  )
}

export function IdCardIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-5', className)} viewBox="0 0 20 16" fill="currentColor" aria-hidden>
      <path d="M0 16V0H20V16H0ZM2 14H18V2H2V14ZM4 12H7V10H4V12ZM4 8H16V6H4V8ZM9 12H16V10H9V12Z" />
    </svg>
  )
}

export function MapPinIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-5', className)} viewBox="0 0 16 20" fill="currentColor" aria-hidden>
      <path d="M8 10C8.55 10 9.02083 9.80417 9.4125 9.4125C9.80417 9.02083 10 8.55 10 8C10 7.45 9.80417 6.97917 9.4125 6.5875C9.02083 6.19583 8.55 6 8 6C7.45 6 6.97917 6.19583 6.5875 6.5875C6.19583 6.97917 6 7.45 6 8C6 8.55 6.19583 9.02083 6.5875 9.4125C6.97917 9.80417 7.45 10 8 10ZM8 17.35C10.0333 15.4833 11.5417 13.7875 12.525 12.2625C13.5083 10.7375 14 9.38333 14 8.2C14 6.38333 13.4208 4.89583 12.2625 3.7375C11.1042 2.57917 9.68333 2 8 2C6.31667 2 4.89583 2.57917 3.7375 3.7375C2.57917 4.89583 2 6.38333 2 8.2C2 9.38333 2.49167 10.7375 3.475 12.2625C4.45833 13.7875 5.96667 15.4833 8 17.35ZM8 20C5.31667 17.7167 3.3125 15.5958 1.9875 13.6375C0.6625 11.6792 0 9.86667 0 8.2C0 5.7 0.804167 3.70833 2.4125 2.225C4.02083 0.741667 5.88333 0 8 0C10.1167 0 11.9792 0.741667 13.5875 2.225C15.1958 3.70833 16 5.7 16 8.2C16 9.86667 15.3375 11.6792 14.0125 13.6375C12.6875 15.5958 10.6833 17.7167 8 20Z" />
    </svg>
  )
}

export function SubscriptionIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-5', className)} viewBox="0 0 20 16" fill="currentColor" aria-hidden>
      <path d="M0 16V0H20V16H0ZM2 14H18V2H2V14ZM4 12H16V10H4V12ZM4 8H10V6H4V8ZM12 8H16V6H12V8Z" />
    </svg>
  )
}

export function CloseIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
    </svg>
  )
}

export function KeyIcon({ className = 'size-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 23 12" fill="currentColor" aria-hidden>
      <path d="M6 8C5.45 8 4.97917 7.80417 4.5875 7.4125C4.19583 7.02083 4 6.55 4 6C4 5.45 4.19583 4.97917 4.5875 4.5875C4.97917 4.19583 5.45 4 6 4C6.55 4 7.02083 4.19583 7.4125 4.5875C7.80417 4.97917 8 5.45 8 6C8 6.55 7.80417 7.02083 7.4125 7.4125C7.02083 7.80417 6.55 8 6 8ZM6 12C4.33333 12 2.91667 11.4167 1.75 10.25C0.583333 9.08333 0 7.66667 0 6C0 4.33333 0.583333 2.91667 1.75 1.75C2.91667 0.583333 4.33333 0 6 0C7.11667 0 8.12917 0.275 9.0375 0.825C9.94583 1.375 10.6667 2.1 11.2 3H20L23 6L18.5 10.5L16.5 9L14.5 10.5L12.375 9H11.2C10.6667 9.9 9.94583 10.625 9.0375 11.175C8.12917 11.725 7.11667 12 6 12ZM6 10C6.93333 10 7.75417 9.71667 8.4625 9.15C9.17083 8.58333 9.64167 7.86667 9.875 7H13L14.45 8.025L16.5 6.5L18.275 7.875L20.15 6L19.15 5H9.875C9.64167 4.13333 9.17083 3.41667 8.4625 2.85C7.75417 2.28333 6.93333 2 6 2C4.9 2 3.95833 2.39167 3.175 3.175C2.39167 3.95833 2 4.9 2 6C2 7.1 2.39167 8.04167 3.175 8.825C3.95833 9.60833 4.9 10 6 10Z" fill="#136DEC"/>
    </svg>
  )
}

export function SuspendIcon({ className = 'size-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM4 12C4 7.59 7.59 4 12 4C13.85 4 15.55 4.63 16.9 5.69L5.69 16.9C4.63 15.55 4 13.85 4 12ZM12 20C10.15 20 8.45 19.37 7.1 18.31L18.31 7.1C19.37 8.45 20 10.15 20 12C20 16.41 16.41 20 12 20Z" />
    </svg>
  )
}

export function DeleteIcon({ className = 'size-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16 9V19H8V9H16ZM14.5 3H9.5L8.5 4H5V6H19V4H15.5L14.5 3ZM18 7H6V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7Z" />
    </svg>
  )
}

export function CheckIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M6.1 11.8L2.4 8.1L1 9.5L6.1 14.6L15 5.7L13.6 4.3L6.1 11.8Z" />
    </svg>
  )
}

export function CreditCardIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 20 16" fill="currentColor" aria-hidden>
      <path d="M0 16V0H20V16H0ZM2 14H18V6H2V14ZM2 4H18V2H2V4ZM4 10H8V8H4V10Z" />
    </svg>
  )
}

export function ScanIcon({ className = 'size-10' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M8 14V8h6M26 8h6v6M32 26v6h-6M14 32H8v-6" strokeLinecap="round" />
      <rect x="12" y="12" width="16" height="16" rx="2" />
    </svg>
  )
}

export function DownloadIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 11L3 6H6V0H10V6H13L8 11ZM0 14V16H16V14H0Z" />
    </svg>
  )
}

export function FileTextIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 20" fill="currentColor" aria-hidden>
      <path d="M4 20C3.45 20 2.97917 19.8042 2.5875 19.4125C2.19583 19.0208 2 18.55 2 18V2C2 1.45 2.19583 0.979167 2.5875 0.5875C2.979167 0.195833 3.45 0 4 0H10L14 4V18C14 18.55 13.8042 19.0208 13.4125 19.4125C13.0208 19.8042 12.55 20 12 20H4ZM4 18H12V5H9V2H4V18ZM6 14H10V12H6V14ZM6 10H10V8H6V10Z" />
    </svg>
  )
}

export function BuildingSectionIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 18" fill="currentColor" aria-hidden>
      <path d="M0 18V0H10V4H20V18H0ZM2 16H4V14H2V16ZM2 12H4V10H2V12ZM2 8H4V6H2V8ZM2 4H4V2H2V4ZM6 16H8V14H6V16ZM6 12H8V10H6V12ZM6 8H8V6H6V8ZM6 4H8V2H6V4ZM10 16H18V6H10V8H12V10H10V12H12V14H10V16ZM14 10V8H16V10H14ZM14 14V12H16V14H14Z" />
    </svg>
  )
}

export function LocationSectionIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 20" fill="currentColor" aria-hidden>
      <path d="M8 10C8.55 10 9.02083 9.80417 9.4125 9.4125C9.80417 9.02083 10 8.55 10 8C10 7.45 9.80417 6.97917 9.4125 6.5875C9.02083 6.19583 8.55 6 8 6C7.45 6 6.97917 6.19583 6.5875 6.5875C6.19583 6.97917 6 7.45 6 8C6 8.55 6.19583 9.02083 6.5875 9.4125C6.97917 9.80417 7.45 10 8 10ZM8 17.35C10.0333 15.4833 11.5417 13.7875 12.525 12.2625C13.5083 10.7375 14 9.38333 14 8.2C14 6.38333 13.4208 4.89583 12.2625 3.7375C11.1042 2.57917 9.68333 2 8 2C6.31667 2 4.89583 2.57917 3.7375 3.7375C2.57917 4.89583 2 6.38333 2 8.2C2 9.38333 2.49167 10.7375 3.475 12.2625C4.45833 13.7875 5.96667 15.4833 8 17.35ZM8 20C5.31667 17.7167 3.3125 15.5958 1.9875 13.6375C0.6625 11.6792 0 9.86667 0 8.2C0 5.7 0.804167 3.70833 2.4125 2.225C4.02083 0.741667 5.88333 0 8 0C10.1167 0 11.9792 0.741667 13.5875 2.225C15.1958 3.70833 16 5.7 16 8.2C16 9.86667 15.3375 11.6792 14.0125 13.6375C12.6875 15.5958 10.6833 17.7167 8 20Z" />
    </svg>
  )
}

export function BrandingSectionIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M10 20C8.63333 20 7.34167 19.7375 6.125 19.2125C4.90833 18.6875 3.84583 17.9708 2.9375 17.0625C2.02917 16.1542 1.3125 15.0917 0.7875 13.875C0.2625 12.6583 0 11.3667 0 10C0 8.61667 0.270833 7.31667 0.8125 6.1C1.35417 4.88333 2.0875 3.825 3.0125 2.925C3.9375 2.025 5.01667 1.3125 6.25 0.7875C7.48333 0.2625 8.8 0 10.2 0C11.5333 0 12.7917 0.229167 13.975 0.6875C15.1583 1.14583 16.1958 1.77917 17.0875 2.5875C17.9792 3.39583 18.6875 4.35417 19.2125 5.4625C19.7375 6.57083 20 7.76667 20 9.05C20 10.9667 19.4167 12.4375 18.25 13.4625C17.0833 14.4875 15.6667 15 14 15H12.15C12 15 11.8958 15.0417 11.8375 15.125C11.7792 15.2083 11.75 15.3 11.75 15.4C11.75 15.6 11.875 15.8875 12.125 16.2625C12.375 16.6375 12.5 17.0667 12.5 17.55C12.5 18.3833 12.2708 19 11.8125 19.4C11.3542 19.8 10.75 20 10 20ZM4.5 11C4.93333 11 5.29167 10.8583 5.575 10.575C5.85833 10.2917 6 9.93333 6 9.5C6 9.06667 5.85833 8.70833 5.575 8.425C5.29167 8.14167 4.93333 8 4.5 8C4.06667 8 3.70833 8.14167 3.425 8.425C3.14167 8.70833 3 9.06667 3 9.5C3 9.93333 3.14167 10.2917 3.425 10.575C3.70833 10.8583 4.06667 11 4.5 11ZM7.5 7C7.93333 7 8.29167 6.85833 8.575 6.575C8.85833 6.29167 9 5.93333 9 5.5C9 5.06667 8.85833 4.70833 8.575 4.425C8.29167 4.14167 7.93333 4 7.5 4C7.06667 4 6.70833 4.14167 6.425 4.425C6.14167 4.70833 6 5.06667 6 5.5C6 5.93333 6.14167 6.29167 6.425 6.575C6.70833 6.85833 7.06667 7 7.5 7ZM12.5 7C12.9333 7 13.2917 6.85833 13.575 6.575C13.8583 6.29167 14 5.93333 14 5.5C14 5.06667 13.8583 4.70833 13.575 4.425C13.2917 4.14167 12.9333 4 12.5 4C12.0667 4 11.7083 4.14167 11.425 4.425C11.1417 4.70833 11 5.06667 11 5.5C11 5.93333 11.1417 6.29167 11.425 6.575C11.7083 6.85833 12.0667 7 12.5 7ZM15.5 11C15.9333 11 16.2917 10.8583 16.575 10.575C16.8583 10.2917 17 9.93333 17 9.5C17 9.06667 16.8583 8.70833 16.575 8.425C16.2917 8.14167 15.9333 8 15.5 8C15.0667 8 14.7083 8.14167 14.425 8.425C14.1417 8.70833 14 9.06667 14 9.5C14 9.93333 14.1417 10.2917 14.425 10.575C14.7083 10.8583 15.0667 11 15.5 11ZM10 18C10.15 18 10.2708 17.9583 10.3625 17.875C10.4542 17.7917 10.5 17.6833 10.5 17.55C10.5 17.3167 10.375 17.0417 10.125 16.725C9.875 16.4083 9.75 15.9333 9.75 15.3C9.75 14.6 9.99167 14.0417 10.475 13.625C10.9583 13.2083 11.55 13 12.25 13H14C15.1 13 16.0417 12.6792 16.825 12.0375C17.6083 11.3958 18 10.4 18 9.05C18 7.03333 17.2292 5.35417 15.6875 4.0125C14.1458 2.67083 12.3167 2 10.2 2C7.93333 2 6 2.775 4.4 4.325C2.8 5.875 2 7.76667 2 10C2 12.2167 2.77917 14.1042 4.3375 15.6625C5.89583 17.2208 7.78333 18 10 18Z" 
      fill="currentColor"/>
    </svg>
  )
}

export function SettingsSectionIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="currentColor" aria-hidden>
      <path d="M8 14H10L10.3 12.5C10.5 12.4167 10.6875 12.3292 10.8625 12.2375C11.0375 12.1458 11.2167 12.0333 11.4 11.9L12.85 12.35L13.85 10.65L12.7 9.65C12.7333 9.41667 12.75 9.2 12.75 9C12.75 8.8 12.7333 8.58333 12.7 8.35L13.85 7.35L12.85 5.65L11.4 6.1C11.2167 5.96667 11.0375 5.85417 10.8625 5.7625C10.6875 5.67083 10.5 5.58333 10.3 5.5L10 4H8L7.7 5.5C7.5 5.58333 7.3125 5.67083 7.1375 5.7625C6.9625 5.85417 6.78333 5.96667 6.6 6.1L5.15 5.65L4.15 7.35L5.3 8.35C5.26667 8.58333 5.25 8.8 5.25 9C5.25 9.2 5.26667 9.41667 5.3 9.65L4.15 10.65L5.15 12.35L6.6 11.9C6.78333 12.0333 6.9625 12.1458 7.1375 12.2375C7.3125 12.3292 7.5 12.4167 7.7 12.5L8 14ZM9 11C8.45 11 7.97917 10.8042 7.5875 10.4125C7.19583 10.0208 7 9.55 7 9C7 8.45 7.19583 7.97917 7.5875 7.5875C7.97917 7.19583 8.45 7 9 7C9.55 7 10.0208 7.19583 10.4125 7.5875C10.8042 7.97917 11 8.45 11 9C11 9.55 10.8042 10.0208 10.4125 10.4125C10.0208 10.8042 9.55 11 9 11ZM2 18C1.45 18 0.979167 17.8042 0.5875 17.4125C0.195833 17.0208 0 16.55 0 16V2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0H16C16.55 0 17.0208 0.195833 17.4125 0.5875C17.8042 0.979167 18 1.45 18 2V16C18 16.55 17.8042 17.0208 17.4125 17.4125C17.0208 17.8042 16.55 18 16 18H2ZM2 16H16V2H2V16ZM2 2V16V2Z" 
      fill="currentColor"/>
    </svg>
    
  )
}

export function ModulesSectionIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M3 3h6v6H3V3Zm8 0h6v6h-6V3ZM3 11h6v6H3v-6Zm8 0h6v6h-6v-6Z" />
    </svg>
  )
}

export function UploadIcon({ className = 'size-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 16V4M12 4L8 8M12 4l4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" />
    </svg>
  )
}
