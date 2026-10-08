type IconProps = { className?: string }

export function StatTasksIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 18 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M3 1.5h7L14 5v13.5H3V1.5Z" strokeLinejoin="round" />
      <path d="M10 1.5V5h4" strokeLinejoin="round" />
      <path d="m6 11 2 2 4-4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function StatProjectsIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="10" cy="10" r="2.5" />
      <circle cx="10" cy="3" r="2" />
      <circle cx="17" cy="10" r="2" />
      <circle cx="10" cy="17" r="2" />
      <circle cx="3" cy="10" r="2" />
      <path d="M10 5.5v3M12.5 10h2.5M10 14.5v2.5M5.5 10H7.5" strokeLinecap="round" />
    </svg>
  )
}

export function StatLeaveIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="2" y="3" width="14" height="13" rx="2" />
      <path d="M2 7h14M6 1v4M12 1v4" strokeLinecap="round" />
      <path d="m6.5 11.5 1.8 1.8 3.2-3.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function StatPerformanceIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 18 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M1.5 10.5 6.5 5.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.5 1.5h5v5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function TrendUpIcon({ className = 'size-3' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 12 7" fill="currentColor" aria-hidden>
      <path d="M0.816667 7L0 6.18333L4.31667 1.8375L6.65 4.17083L9.68333 1.16667H8.16667V0H11.6667V3.5H10.5V1.98333L6.65 5.83333L4.31667 3.5L0.816667 7Z" />
    </svg>
  )
}

export function PlusIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M7 3H9V7H13V9H9V13H7V9H3V7H7V3Z" />
    </svg>
  )
}

export function MoreIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 4" fill="currentColor" aria-hidden>
      <circle cx="2" cy="2" r="2" />
      <circle cx="8" cy="2" r="2" />
      <circle cx="14" cy="2" r="2" />
    </svg>
  )
}

export function EyeIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M1 10s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="2.5" />
    </svg>
  )
}

export function StarIcon({ className = 'size-3.5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 12 11" fill="currentColor" aria-hidden>
      <path d="M3.99583 8.64792L5.83333 7.53958L7.67083 8.6625L7.18958 6.5625L8.80833 5.1625L6.67917 4.97292L5.83333 2.98958L4.9875 4.95833L2.85833 5.14792L4.47708 6.5625L3.99583 8.64792ZM2.23125 11.0833L3.17917 6.98542L0 4.22917L4.2 3.86458L5.83333 0L7.46667 3.86458L11.6667 4.22917L8.4875 6.98542L9.43542 11.0833L5.83333 8.91042L2.23125 11.0833Z" fill="#F59E0B"/>
    </svg>
  )
}

export function ActivityCheckIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 17 17" fill="currentColor" aria-hidden>
      <path d="M7.16667 12.1667L13.0417 6.29167L11.875 5.125L7.16667 9.83333L4.79167 7.45833L3.625 8.625L7.16667 12.1667ZM8.33333 16.6667C7.18056 16.6667 6.09722 16.4479 5.08333 16.0104C4.06944 15.5729 3.1875 14.9792 2.4375 14.2292C1.6875 13.4792 1.09375 12.5972 0.65625 11.5833C0.21875 10.5694 0 9.48611 0 8.33333C0 7.18056 0.21875 6.09722 0.65625 5.08333C1.09375 4.06944 1.6875 3.1875 2.4375 2.4375C3.1875 1.6875 4.06944 1.09375 5.08333 0.65625C6.09722 0.21875 7.18056 0 8.33333 0C9.48611 0 10.5694 0.21875 11.5833 0.65625C12.5972 1.09375 13.4792 1.6875 14.2292 2.4375C14.9792 3.1875 15.5729 4.06944 16.0104 5.08333C16.4479 6.09722 16.6667 7.18056 16.6667 8.33333C16.6667 9.48611 16.4479 10.5694 16.0104 11.5833C15.5729 12.5972 14.9792 13.4792 14.2292 14.2292C13.4792 14.9792 12.5972 15.5729 11.5833 16.0104C10.5694 16.4479 9.48611 16.6667 8.33333 16.6667ZM8.33333 15C10.1944 15 11.7708 14.3542 13.0625 13.0625C14.3542 11.7708 15 10.1944 15 8.33333C15 6.47222 14.3542 4.89583 13.0625 3.60417C11.7708 2.3125 10.1944 1.66667 8.33333 1.66667C6.47222 1.66667 4.89583 2.3125 3.60417 3.60417C2.3125 4.89583 1.66667 6.47222 1.66667 8.33333C1.66667 10.1944 2.3125 11.7708 3.60417 13.0625C4.89583 14.3542 6.47222 15 8.33333 15Z" fill="#16A34A"/>
    </svg>
  )
}

export function ActivitySendIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M0 16V0L8 4L16 8L0 16ZM1.68421 13L11.6632 8L1.68421 3V6.5L6.73684 8L1.68421 9.5V13ZM1.68421 13V8V3V6.5V9.5V13Z" fill="#EA580C"/>
    </svg>
  )
}

export function ActivityRefreshIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M7.5 15C6.45833 15 5.48264 14.8021 4.57292 14.4062C3.66319 14.0104 2.87153 13.4757 2.19792 12.8021C1.52431 12.1285 0.989583 11.3368 0.59375 10.4271C0.197917 9.51736 0 8.54167 0 7.5C0 6.45833 0.197917 5.48264 0.59375 4.57292C0.989583 3.66319 1.52431 2.87153 2.19792 2.19792C2.87153 1.52431 3.66319 0.989583 4.57292 0.59375C5.48264 0.197917 6.45833 0 7.5 0C8.63889 0 9.71875 0.243056 10.7396 0.729167C11.7604 1.21528 12.625 1.90278 13.3333 2.79167V0.833333H15V5.83333H10V4.16667H12.2917C11.7222 3.38889 11.0208 2.77778 10.1875 2.33333C9.35417 1.88889 8.45833 1.66667 7.5 1.66667C5.875 1.66667 4.49653 2.23264 3.36458 3.36458C2.23264 4.49653 1.66667 5.875 1.66667 7.5C1.66667 9.125 2.23264 10.5035 3.36458 11.6354C4.49653 12.7674 5.875 13.3333 7.5 13.3333C8.95833 13.3333 10.2326 12.8611 11.3229 11.9167C12.4132 10.9722 13.0556 9.77778 13.25 8.33333H14.9583C14.75 10.2361 13.934 11.8229 12.5104 13.0938C11.0868 14.3646 9.41667 15 7.5 15ZM9.83333 11L6.66667 7.83333V3.33333H8.33333V7.16667L11 9.83333L9.83333 11Z" fill="#136DEC"/>
    </svg>
  )
}
