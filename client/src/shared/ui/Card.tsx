import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type CardProps = {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border-card bg-surface shadow-(--shadow-stat)',
        className,
      )}
    >
      {children}
    </div>
  )
}

