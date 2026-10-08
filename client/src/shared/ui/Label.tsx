import type { LabelHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

type LabelTone = 'heading' | 'muted' | 'slate'

const toneClasses: Record<LabelTone, string> = {
  heading: 'text-heading font-medium',
  muted: 'text-text-muted font-medium',
  slate: 'text-label font-medium',
}

export function Label({
  className,
  tone = 'heading',
  ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { tone?: LabelTone }) {
  return (
    <label
      className={cn('mb-2 block text-sm leading-5', toneClasses[tone], className)}
      {...props}
    />
  )
}
