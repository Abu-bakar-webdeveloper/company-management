import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type CompanyFormFieldProps = {
  label: string
  children: ReactNode
  error?: string
  className?: string
}

export function CompanyFormField({ label, children, error, className }: CompanyFormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="text-xs font-semibold uppercase tracking-wide text-heading">{label}</label>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}

export const companyInputClass =
  'h-10 w-full rounded-lg border-0 bg-[#f1f5f9] px-4 text-sm text-heading outline-none transition-colors placeholder:text-placeholder-alt focus:ring-1 focus:ring-[#1877f2]/20'

export const companySelectClass =
  'h-10 w-full appearance-none rounded-lg border-0 bg-[#f1f5f9] px-4 text-sm text-heading outline-none focus:ring-2 focus:ring-[#1877f2]/20'
