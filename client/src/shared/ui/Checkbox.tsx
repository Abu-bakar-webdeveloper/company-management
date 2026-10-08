import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

export const Checkbox = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Checkbox({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          'size-4 shrink-0 cursor-pointer rounded-full border border-border-checkbox bg-surface',
          'accent-primary checked:border-primary',
          className,
        )}
        {...props}
      />
    )
  },
)
