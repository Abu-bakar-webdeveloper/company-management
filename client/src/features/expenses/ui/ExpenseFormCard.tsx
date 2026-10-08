import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { FormField as SharedFormField } from '@/shared/ui/FormField'

export function ExpenseFormCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border-card bg-surface shadow-[var(--shadow-card)]',
        className,
      )}
    >
      <div className="p-6">{children}</div>
    </div>
  )
}

export function FormField(
  props: Omit<ComponentProps<typeof SharedFormField>, 'spacing'>,
) {
  return <SharedFormField spacing="sectionLg" {...props} />
}

export const expenseFormInputClass =
  'h-11 w-full rounded-lg border border-[#e2e8f0] bg-surface px-4 text-sm text-heading placeholder:text-placeholder-alt outline-none focus:border-[#1877f2] focus:ring-2 focus:ring-[#1877f2]/15'

export const expenseFormTextareaClass =
  'min-h-[120px] w-full resize-y rounded-lg border border-[#e2e8f0] bg-surface px-4 py-3 text-sm text-heading placeholder:text-placeholder-alt outline-none focus:border-[#1877f2] focus:ring-2 focus:ring-[#1877f2]/15'
