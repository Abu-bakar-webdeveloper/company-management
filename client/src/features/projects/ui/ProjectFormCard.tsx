import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { FormField as SharedFormField } from '@/shared/ui/FormField'

type ProjectFormCardProps = {
  title: string
  subtitle: string
  onClose?: () => void
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function ProjectFormCard({
  title,
  subtitle,
  onClose,
  children,
  footer,
  className,
}: ProjectFormCardProps) {
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
            className="absolute right-5 top-5 text-[#64748b] hover:text-heading"
            aria-label="Close"
          >
            <span className="text-xl leading-none">&times;</span>
          </button>
        )}
        <h2 className="text-xl font-bold text-heading">{title}</h2>
        <p className="mt-1 text-sm text-text-muted">{subtitle}</p>
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

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-6 last:mb-0">
      <h3 className="mb-4 text-xl font-bold text-heading">{title}</h3>
      {children}
    </div>
  )
}

function FormField(
  props: Omit<ComponentProps<typeof SharedFormField>, 'spacing'>,
) {
  return <SharedFormField spacing="section" {...props} />
}

export const projectFormInputClass =
  'h-11 w-full rounded-lg border border-[#e2e8f0] bg-surface px-4 text-sm text-heading placeholder:text-placeholder-alt outline-none focus:border-[#1877f2] focus:ring-2 focus:ring-[#1877f2]/15'

export const projectFormTextareaClass =
  'min-h-[100px] w-full resize-y rounded-lg border border-[#e2e8f0] bg-surface px-4 py-3 text-sm text-heading placeholder:text-placeholder-alt outline-none focus:border-[#1877f2] focus:ring-2 focus:ring-[#1877f2]/15'

export { FormSection, FormField }
