type IconProps = { className?: string }

export function MailIcon({ className = 'size-4 text-text-muted' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 17 14" fill="none" aria-hidden>
      <path
        d="M1.5 2.5h14v9h-14v-9Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M1.5 3.5 8.5 9 15.5 3.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

export function LockIcon({ className = 'size-4 text-text-muted' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 14 18" fill="none" aria-hidden>
      <rect x="2" y="8" width="10" height="9" rx="2" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M4.5 8V6a2.5 2.5 0 0 1 5 0v2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function UserIcon({ className = 'size-3.5 text-text-muted' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M2.5 12.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function EyeIcon({ className = 'size-4 text-text-muted' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 13" fill="none" aria-hidden>
      <path
        d="M1 6.5S4.5 1 10 1s9 5.5 9 5.5-3.5 5.5-9 5.5S1 6.5 1 6.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <circle cx="10" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

export function ArrowRightIcon({ className = 'size-3.5 text-white' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 15 15" fill="none" aria-hidden>
      <path
        d="M3 7.5h8M8 4.5 11 7.5 8 10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ArrowLeftIcon({ className = 'size-3 shrink-0 text-primary' }: IconProps) {
  return (
    <svg
      className={className}
      width={12}
      height={12}
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
    >
      <path
        d="M7.5 2.5 4 6l3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function GoogleIcon({ className = 'size-[18px]' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.61Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.71A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.16.28-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3.01-2.34Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  )
}

export function KeyResetIcon({ className = 'size-[30px] text-primary' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 30 30" fill="none" aria-hidden>
      <path d="M15 30C12.925 30 10.975 29.6063 9.15 28.8188C7.325 28.0312 5.7375 26.9625 4.3875 25.6125C3.0375 24.2625 1.96875 22.675 1.18125 20.85C0.39375 19.025 0 17.075 0 15H3C3 16.65 3.3125 18.2063 3.9375 19.6688C4.5625 21.1313 5.41875 22.4062 6.50625 23.4937C7.59375 24.5812 8.86875 25.4437 10.3313 26.0812C11.7937 26.7188 13.35 27.0375 15 27.0375C18.35 27.0375 21.1875 25.875 23.5125 23.55C25.8375 21.225 27 18.3875 27 15.0375C27 11.6875 25.8375 8.85 23.5125 6.525C21.1875 4.2 18.35 3.0375 15 3.0375C12.775 3.0375 10.7563 3.58125 8.94375 4.66875C7.13125 5.75625 5.7 7.2 4.65 9H9V12H0V3H3V6C4.375 4.175 6.1 2.71875 8.175 1.63125C10.25 0.54375 12.525 0 15 0C17.075 0 19.025 0.39375 20.85 1.18125C22.675 1.96875 24.2625 3.0375 25.6125 4.3875C26.9625 5.7375 28.0312 7.325 28.8188 9.15C29.6063 10.975 30 12.925 30 15C30 17.075 29.6063 19.025 28.8188 20.85C28.0312 22.675 26.9625 24.2625 25.6125 25.6125C24.2625 26.9625 22.675 28.0312 20.85 28.8188C19.025 29.6063 17.075 30 15 30ZM12 21C11.575 21 11.2188 20.8563 10.9312 20.5688C10.6437 20.2812 10.5 19.925 10.5 19.5V15C10.5 14.575 10.6437 14.2188 10.9312 13.9312C11.2188 13.6437 11.575 13.5 12 13.5V12C12 11.175 12.2938 10.4688 12.8813 9.88125C13.4688 9.29375 14.175 9 15 9C15.825 9 16.5312 9.29375 17.1187 9.88125C17.7062 10.4688 18 11.175 18 12V13.5C18.425 13.5 18.7812 13.6437 19.0688 13.9312C19.3563 14.2188 19.5 14.575 19.5 15V19.5C19.5 19.925 19.3563 20.2812 19.0688 20.5688C18.7812 20.8563 18.425 21 18 21H12ZM13.5 13.5H16.5V12C16.5 11.575 16.3563 11.2188 16.0688 10.9312C15.7812 10.6437 15.425 10.5 15 10.5C14.575 10.5 14.2188 10.6437 13.9312 10.9312C13.6437 11.2188 13.5 11.575 13.5 12V13.5Z" 
      fill="currentColor"/>
    </svg>
    
  )
}

export function InfoIcon({ className = 'size-3 text-text-muted shrink-0' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 12 14" fill="none" aria-hidden>
      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 5v4M6 3.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

