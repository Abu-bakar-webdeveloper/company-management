import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type EmployeeFormCardProps = {
  title: string
  subtitle: string
  onClose?: () => void
  children: ReactNode
  footer?: ReactNode
  headerExtra?: ReactNode
  className?: string
}

export function EmployeeFormCard({
  title,
  subtitle,
  onClose,
  children,
  footer,
  headerExtra,
  className,
}: EmployeeFormCardProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border-card bg-surface shadow-[var(--shadow-card)]',
        className,
      )}
    >
      <div className="relative bg-[#f0f7ff] px-6 py-5">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 flex size-8 items-center justify-center rounded-lg text-[#64748b] transition-colors hover:bg-white/70 hover:text-heading"
            aria-label="Close"
          >
            <span className="text-xl leading-none">&times;</span>
          </button>
        )}
        <div className={cn('flex gap-5', headerExtra ? 'items-start' : undefined, onClose && 'pr-8')}>
          {headerExtra}
          <div>
            <h2 className="text-xl font-bold text-heading">{title}</h2>
            <p className="mt-1 text-sm text-text-muted">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="p-6">{children}</div>

      {footer && (
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border-card px-6 py-5">
          {footer}
        </div>
      )}
    </div>
  )
}
