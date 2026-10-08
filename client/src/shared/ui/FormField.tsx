import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

export type FormFieldSpacing = 'gap' | 'section' | 'sectionLg'

type FormFieldProps = {
  label: string
  children: ReactNode
  error?: string
  hint?: string
  className?: string
  spacing?: FormFieldSpacing
}

const spacingClasses: Record<FormFieldSpacing, string> = {
  gap: 'flex flex-col gap-1.5',
  section: 'mb-4 last:mb-0',
  sectionLg: 'mb-5 last:mb-0',
}

export function FormField({
  label,
  children,
  error,
  hint,
  className,
  spacing = 'gap',
}: FormFieldProps) {
  const isGap = spacing === 'gap'

  return (
    <div className={cn(spacingClasses[spacing], className)}>
      <label
        className={cn(
          'block text-sm text-heading',
          isGap ? 'font-semibold' : 'mb-1.5 font-medium',
        )}
      >
        {label}
      </label>
      {hint && <p className={cn('text-xs text-text-muted', isGap ? '-mt-0.5' : 'mb-2')}>{hint}</p>}
      {children}
      {error && (
        <p className={cn('text-danger', isGap ? 'text-sm' : 'mt-1 text-xs')}>{error}</p>
      )}
    </div>
  )
}

export const figmaInputClass =
  'h-10 w-full rounded-lg border border-border bg-surface-muted text-sm text-heading outline-none transition-colors placeholder:text-placeholder focus:border-primary focus:ring-2 focus:ring-primary/15'

export const figmaSelectClass =
  'h-10 w-full appearance-none rounded-lg border border-border bg-surface-muted px-4 text-sm text-heading outline-none focus:border-primary focus:ring-2 focus:ring-primary/15'
