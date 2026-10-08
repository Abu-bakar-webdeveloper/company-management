import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

const roundedClass: Record<NonNullable<SkeletonProps['rounded']>, string> = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
}

export function Skeleton({ className, rounded = 'md', ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn('animate-pulse bg-surface-muted', roundedClass[rounded], className)}
      {...props}
    />
  )
}

export function SkeletonText({
  className,
  lines = 1,
}: {
  className?: string
  lines?: number
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={cn('h-3', i === lines - 1 && lines > 1 ? 'w-3/5' : 'w-full')}
          rounded="sm"
        />
      ))}
    </div>
  )
}
