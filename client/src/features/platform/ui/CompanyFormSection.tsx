import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type CompanyFormSectionProps = {
  icon: ReactNode
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function CompanyFormSection({
  icon,
  title,
  subtitle,
  children,
  footer,
  className,
}: CompanyFormSectionProps) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-xl border border-border-card bg-surface shadow-[var(--shadow-stat)]',
        className,
      )}
    >
      <div className="flex items-start gap-4 border-b border-border-card px-6 py-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#eff6ff] text-primary">
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-bold text-heading">{title}</h2>
          <p className="mt-1 text-sm text-text-muted">{subtitle}</p>
        </div>
      </div>

      <div className="p-6">{children}</div>

      {footer && (
        <div className="border-t border-border-card px-6 py-4">{footer}</div>
      )}
    </section>
  )
}
