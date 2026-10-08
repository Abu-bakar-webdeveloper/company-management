import { cn } from '@/shared/lib/cn'
import { UserAvatar } from '@/shared/ui/UserAvatar'

type IconProps = { className?: string }

export function ExportIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M9 2v9M5.5 7.5 9 11l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 14h12" strokeLinecap="round" />
    </svg>
  )
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="2" y="3" width="14" height="13" rx="2" />
      <path d="M2 7h14M6 1v4M12 1v4" strokeLinecap="round" />
    </svg>
    
  )
}

export function StarIcon({ className }: IconProps) {
  return (
    <svg
      className={cn('size-4 shrink-0 text-[#F59E0B]', className)}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path d="M3.825 19L5.45 11.975L0 7.25L7.2 6.625L10 0L12.8 6.625L20 7.25L14.55 11.975L16.175 19L10 15.275L3.825 19Z" />
    </svg>
  )
}

export function BuildingIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-3.5 shrink-0', className)} viewBox="0 0 10 09" fill="currentColor" aria-hidden>
      <path d="M0 9V0H5V2H10V9H0ZM1 8H4V7H1V8ZM1 6H4V5H1V6ZM1 4H4V3H1V4ZM1 2H4V1H1V2ZM5 8H9V3H5V8ZM6 5V4H8V5H6ZM6 7V6H8V7H6Z" fill="#778499"/>
    </svg>    
  )
}

export function TrendUpIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-3.5 shrink-0', className)} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M1 10l4-4 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 3h4v4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function MedalIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-5 shrink-0', className)} viewBox="0 0 16 21" fill="currentColor" aria-hidden>
      <path d="M5.675 11.7L6.55 8.85L4.25 7H7.1L8 4.2L8.9 7H11.75L9.425 8.85L10.3 11.7L8 9.925L5.675 11.7ZM2 21V13.275C1.36667 12.575 0.875 11.775 0.525 10.875C0.175 9.975 0 9.01667 0 8C0 5.76667 0.775 3.875 2.325 2.325C3.875 0.775 5.76667 0 8 0C10.2333 0 12.125 0.775 13.675 2.325C15.225 3.875 16 5.76667 16 8C16 9.01667 15.825 9.975 15.475 10.875C15.125 11.775 14.6333 12.575 14 13.275V21L8 19L2 21ZM8 14C9.66667 14 11.0833 13.4167 12.25 12.25C13.4167 11.0833 14 9.66667 14 8C14 6.33333 13.4167 4.91667 12.25 3.75C11.0833 2.58333 9.66667 2 8 2C6.33333 2 4.91667 2.58333 3.75 3.75C2.58333 4.91667 2 6.33333 2 8C2 9.66667 2.58333 11.0833 3.75 12.25C4.91667 13.4167 6.33333 14 8 14Z" 
      fill="currentColor"/>
    </svg>    
  )
}

export function ClipboardIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-5 shrink-0', className)} viewBox="0 0 19 21" fill="currentColor" aria-hidden>
      <path d="M14 21C12.6167 21 11.4375 20.5125 10.4625 19.5375C9.4875 18.5625 9 17.3833 9 16C9 14.6167 9.4875 13.4375 10.4625 12.4625C11.4375 11.4875 12.6167 11 14 11C15.3833 11 16.5625 11.4875 17.5375 12.4625C18.5125 13.4375 19 14.6167 19 16C19 17.3833 18.5125 18.5625 17.5375 19.5375C16.5625 20.5125 15.3833 21 14 21ZM15.675 18.375L16.375 17.675L14.5 15.8V13H13.5V16.2L15.675 18.375ZM2 20C1.45 20 0.979167 19.8042 0.5875 19.4125C0.195833 19.0208 0 18.55 0 18V4C0 3.45 0.195833 2.97917 0.5875 2.5875C0.979167 2.19583 1.45 2 2 2H6.175C6.35833 1.41667 6.71667 0.9375 7.25 0.5625C7.78333 0.1875 8.36667 0 9 0C9.66667 0 10.2625 0.1875 10.7875 0.5625C11.3125 0.9375 11.6667 1.41667 11.85 2H16C16.55 2 17.0208 2.19583 17.4125 2.5875C17.8042 2.97917 18 3.45 18 4V10.25C17.7 10.0333 17.3833 9.85 17.05 9.7C16.7167 9.55 16.3667 9.41667 16 9.3V4H14V7H4V4H2V18H7.3C7.41667 18.3667 7.55 18.7167 7.7 19.05C7.85 19.3833 8.03333 19.7 8.25 20H2ZM9 4C9.28333 4 9.52083 3.90417 9.7125 3.7125C9.90417 3.52083 10 3.28333 10 3C10 2.71667 9.90417 2.47917 9.7125 2.2875C9.52083 2.09583 9.28333 2 9 2C8.71667 2 8.47917 2.09583 8.2875 2.2875C8.09583 2.47917 8 2.71667 8 3C8 3.28333 8.09583 3.52083 8.2875 3.7125C8.47917 3.90417 8.71667 4 9 4Z" fill="#136DEC"/>
    </svg>
  )
}

export function WarningIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-5 shrink-0', className)} viewBox="0 0 22 19" fill="currentColor" aria-hidden>
      <path d="M0 19L11 0L22 19H0ZM11 16C11.2833 16 11.5208 15.9042 11.7125 15.7125C11.9042 15.5208 12 15.2833 12 15C12 14.7167 11.9042 14.4792 11.7125 14.2875C11.5208 14.0958 11.2833 14 11 14C10.7167 14 10.4792 14.0958 10.2875 14.2875C10.0958 14.4792 10 14.7167 10 15C10 15.2833 10.0958 15.5208 10.2875 15.7125C10.4792 15.9042 10.7167 16 11 16ZM10 13H12V8H10V13Z" fill="#DC2626"/>
    </svg>    
  )
}

export function EyeIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 18 12" fill="currentColor" aria-hidden>
      <path d="M9 9.6C10.0227 9.6 10.892 9.25 11.608 8.55C12.3239 7.85 12.6818 7 12.6818 6C12.6818 5 12.3239 4.15 11.608 3.45C10.892 2.75 10.0227 2.4 9 2.4C7.97727 2.4 7.10795 2.75 6.39205 3.45C5.67614 4.15 5.31818 5 5.31818 6C5.31818 7 5.67614 7.85 6.39205 8.55C7.10795 9.25 7.97727 9.6 9 9.6ZM9 8.16C8.38636 8.16 7.86477 7.95 7.43523 7.53C7.00568 7.11 6.79091 6.6 6.79091 6C6.79091 5.4 7.00568 4.89 7.43523 4.47C7.86477 4.05 8.38636 3.84 9 3.84C9.61364 3.84 10.1352 4.05 10.5648 4.47C10.9943 4.89 11.2091 5.4 11.2091 6C11.2091 6.6 10.9943 7.11 10.5648 7.53C10.1352 7.95 9.61364 8.16 9 8.16ZM9 12C7.00909 12 5.19545 11.4567 3.55909 10.37C1.92273 9.28333 0.736364 7.82667 0 6C0.736364 4.17333 1.92273 2.71667 3.55909 1.63C5.19545 0.543333 7.00909 0 9 0C10.9909 0 12.8045 0.543333 14.4409 1.63C16.0773 2.71667 17.2636 4.17333 18 6C17.2636 7.82667 16.0773 9.28333 14.4409 10.37C12.8045 11.4567 10.9909 12 9 12ZM9 10.4C10.5409 10.4 11.9557 10.0033 13.2443 9.21C14.533 8.41667 15.5182 7.34667 16.2 6C15.5182 4.65333 14.533 3.58333 13.2443 2.79C11.9557 1.99667 10.5409 1.6 9 1.6C7.45909 1.6 6.04432 1.99667 4.75568 2.79C3.46705 3.58333 2.48182 4.65333 1.8 6C2.48182 7.34667 3.46705 8.41667 4.75568 9.21C6.04432 10.0033 7.45909 10.4 9 10.4Z" fill="#136DEC"/>
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

export function MoreIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 16 4" fill="currentColor" aria-hidden>
      <circle cx="2" cy="2" r="2" />
      <circle cx="8" cy="2" r="2" />
      <circle cx="14" cy="2" r="2" />
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

export function LightbulbIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-5 shrink-0', className)} viewBox="0 0 12 20" fill="currentColor" aria-hidden>
      <path d="M6.25 16.6667C5.79167 16.6667 5.39931 16.5035 5.07292 16.1771C4.74653 15.8507 4.58333 15.4583 4.58333 15H7.91667C7.91667 15.4583 7.75347 15.8507 7.42708 16.1771C7.10069 16.5035 6.70833 16.6667 6.25 16.6667ZM2.91667 14.1667V12.5H9.58333V14.1667H2.91667ZM3.125 11.6667C2.16667 11.0972 1.40625 10.3333 0.84375 9.375C0.28125 8.41667 0 7.375 0 6.25C0 4.51389 0.607639 3.03819 1.82292 1.82292C3.03819 0.607639 4.51389 0 6.25 0C7.98611 0 9.46181 0.607639 10.6771 1.82292C11.8924 3.03819 12.5 4.51389 12.5 6.25C12.5 7.375 12.2188 8.41667 11.6562 9.375C11.0938 10.3333 10.3333 11.0972 9.375 11.6667H3.125ZM3.625 10H8.875C9.5 9.55556 9.98264 9.00694 10.3229 8.35417C10.6632 7.70139 10.8333 7 10.8333 6.25C10.8333 4.97222 10.3889 3.88889 9.5 3C8.61111 2.11111 7.52778 1.66667 6.25 1.66667C4.97222 1.66667 3.88889 2.11111 3 3C2.11111 3.88889 1.66667 4.97222 1.66667 6.25C1.66667 7 1.83681 7.70139 2.17708 8.35417C2.51736 9.00694 3 9.55556 3.625 10Z"
       fill='currentColor'
      />
    </svg>
  )
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-4 shrink-0', className)} viewBox="0 0 15 16" fill="none" aria-hidden>
      <path d="M5.73333 9.73333L10.4333 5.03333L9.5 4.1L5.73333 7.86667L3.83333 5.96667L2.9 6.9L5.73333 9.73333ZM6.66667 13.3333C5.74444 13.3333 4.87778 13.1583 4.06667 12.8083C3.25556 12.4583 2.55 11.9833 1.95 11.3833C1.35 10.7833 0.875 10.0778 0.525 9.26667C0.175 8.45555 0 7.58889 0 6.66667C0 5.74444 0.175 4.87778 0.525 4.06667C0.875 3.25556 1.35 2.55 1.95 1.95C2.55 1.35 3.25556 0.875 4.06667 0.525C4.87778 0.175 5.74444 0 6.66667 0C7.58889 0 8.45555 0.175 9.26667 0.525C10.0778 0.875 10.7833 1.35 11.3833 1.95C11.9833 2.55 12.4583 3.25556 12.8083 4.06667C13.1583 4.87778 13.3333 5.74444 13.3333 6.66667C13.3333 7.58889 13.1583 8.45555 12.8083 9.26667C12.4583 10.0778 11.9833 10.7833 11.3833 11.3833C10.7833 11.9833 10.0778 12.4583 9.26667 12.8083C8.45555 13.1583 7.58889 13.3333 6.66667 13.3333ZM6.66667 12C8.15556 12 9.41667 11.4833 10.45 10.45C11.4833 9.41667 12 8.15556 12 6.66667C12 5.17778 11.4833 3.91667 10.45 2.88333C9.41667 1.85 8.15556 1.33333 6.66667 1.33333C5.17778 1.33333 3.91667 1.85 2.88333 2.88333C1.85 3.91667 1.33333 5.17778 1.33333 6.66667C1.33333 8.15556 1.85 9.41667 2.88333 10.45C3.91667 11.4833 5.17778 12 6.66667 12Z" 
      fill='currentColor'
      />
    </svg>
  )
}

export function LightningBoltIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-5 shrink-0', className)} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
    </svg>
  )
}

export function BadgeCheckIcon({ className }: IconProps) {
  return (
    <svg className={cn('size-3 shrink-0', className)} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="6" cy="6" r="5" />
      <path d="M4 6l1.5 1.5L8 5" strokeLinecap="round" strokeLinejoin="round" />
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

export function ReviewProfileAvatar({
  name,
  avatar,
  className,
}: {
  name: string
  avatar?: string
  className?: string
}) {
  return (
    <div className={cn('relative shrink-0', className)}>
      <UserAvatar
        name={name}
        avatar={avatar}
        size="xl"
        rounded="xl"
        className="sm:size-[72px] sm:text-lg"
      />
      <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-primary text-white shadow-[0_2px_6px_rgba(15,82,186,0.35)] sm:-bottom-1.5 sm:-right-1.5 sm:size-7">
        <BadgeCheckIcon className="size-3 text-white sm:size-3.5" />
      </span>
    </div>
  )
}
