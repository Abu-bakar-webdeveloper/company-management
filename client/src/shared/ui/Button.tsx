import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'md' | 'lg' | 'pill'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  icon?: ReactNode
  iconPosition?: 'start' | 'end'
  shadow?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:opacity-95 focus-visible:ring-primary',
  secondary:
    'border border-border bg-surface text-heading hover:bg-surface-input focus-visible:ring-primary',
  ghost: 'text-primary hover:bg-primary-muted focus-visible:ring-primary',
}

const sizeClasses: Record<Size, string> = {
  md: 'h-10 rounded-lg px-4 text-sm font-medium',
  lg: 'h-12 gap-2 text-base font-bold rounded-xl',
  pill: 'h-10 gap-2 px-6 py-4 text-base font-bold rounded-3xl',
}

export function Button({
  variant = 'primary',
  size = 'lg',
  fullWidth,
  className,
  type = 'button',
  icon,
  iconPosition = 'end',
  shadow,
  children,
  ...props
}: ButtonProps) {
  const iconSlot = icon ? <span className="inline-flex shrink-0 items-center">{icon}</span> : null

  return (
    <button
      type={type}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 transition-opacity',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-70',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        shadow && variant === 'primary' && 'shadow-(--shadow-button-primary)',
        className,
      )}
      {...props}
    >
      {iconPosition === 'start' && iconSlot}
      {children}
      {iconPosition === 'end' && iconSlot}
    </button>
  )
}
