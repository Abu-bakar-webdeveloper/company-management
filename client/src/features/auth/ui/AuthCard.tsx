import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type AuthCardProps = {
  children: ReactNode
  className?: string
  centered?: boolean
}

export function AuthCard({ children, className, centered }: AuthCardProps) {
  return (
    <div
      className={cn(
        'relative w-full max-w-[520px] rounded-2xl border border-border-card bg-surface',
        'px-5 py-6 shadow-(--shadow-card) sm:rounded-xl sm:p-[33px]',
        className,
      )}
    >
      {centered && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-(--shadow-card) sm:rounded-xl" aria-hidden />
      )}
      <div className="relative flex flex-col gap-6 sm:gap-8">{children}</div>
    </div>
  )
}
