import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean
  icon?: ReactNode
  inputClassName?: string
  tall?: boolean
  roundedFull?: boolean
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    {
      className,
      error,
      icon,
      inputClassName,
      tall,
      roundedFull,
      ...props
    },
    ref,
  ) {
    return (
      <div className={cn('relative', className)}>
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full border bg-surface text-base text-heading outline-none transition-colors',
            'placeholder:text-placeholder',
            'focus:border-primary focus:ring-2 focus:ring-primary/20',
            icon ? 'pl-[41px] pr-4' : 'px-4',
            tall ? 'py-[15px]' : 'h-11 py-3',
            roundedFull ? 'rounded-3xl' : 'rounded-xl',
            error ? 'border-danger' : 'border-border',
            inputClassName,
          )}
          {...props}
        />
      </div>
    )
  },
)
