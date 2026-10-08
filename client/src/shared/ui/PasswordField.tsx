import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { EyeIcon } from '@/shared/ui/icons'

type PasswordFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean
  icon?: ReactNode
  tall?: boolean
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField({ className, error, icon, tall, ...props }, ref) {
    const [visible, setVisible] = useState(false)

    return (
      <div className={cn('relative', className)}>
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={cn(
            'w-full rounded-xl border bg-surface text-base text-heading outline-none transition-colors',
            'placeholder:text-placeholder-alt',
            'focus:border-primary focus:ring-2 focus:ring-primary/20',
            icon ? 'pl-[41px] pr-11' : 'px-4 pr-11',
            tall ? 'h-12 py-[15px]' : 'h-11 py-3',
            error ? 'border-danger' : 'border-border',
          )}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-label"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          <EyeIcon />
        </button>
      </div>
    )
  },
)
