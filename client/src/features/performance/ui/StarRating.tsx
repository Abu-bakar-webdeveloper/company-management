import { useState } from 'react'
import { StarIcon } from '@/features/performance/ui/icons'
import { cn } from '@/shared/lib/cn'

type StarRatingProps = {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  /** When set, stars become clickable and show hover preview. Supports half steps (e.g. 4.5). */
  onChange?: (rating: number) => void
  disabled?: boolean
  className?: string
  'aria-label'?: string
}

function ratingFromPointer(starIndex: number, clientX: number, target: HTMLElement) {
  const { left, width } = target.getBoundingClientRect()
  const isLeftHalf = clientX - left < width / 2
  const value = isLeftHalf ? starIndex + 0.5 : starIndex + 1
  return Math.min(5, Math.max(1, value))
}

function StarVisual({
  filled,
  half,
  sizeClass,
  className,
}: {
  filled: boolean
  half: boolean
  sizeClass: string
  className?: string
}) {
  if (half) {
    return (
      <span className={cn('relative inline-flex', sizeClass, className)}>
        <StarIcon className={cn(sizeClass, 'text-[#CBD5E1]')} />
        <span className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
          <StarIcon className={cn(sizeClass, 'text-[#FBBF24]')} />
        </span>
      </span>
    )
  }

  return (
    <StarIcon
      className={cn(sizeClass, filled ? 'text-[#FBBF24]' : 'text-[#CBD5E1]', className)}
    />
  )
}

export function StarRating({
  rating,
  size = 'md',
  showValue = false,
  onChange,
  disabled = false,
  className,
  'aria-label': ariaLabel = 'Rating',
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const interactive = typeof onChange === 'function' && !disabled
  const displayRating = interactive && hovered != null ? hovered : rating

  const sizeClass = size === 'sm' ? 'size-3.5' : size === 'lg' ? 'size-6' : 'size-4'
  const hitAreaClass =
    size === 'sm' ? 'h-7 w-7' : size === 'lg' ? 'h-10 w-10' : 'h-8 w-8'

  return (
    <div
      className={cn('flex items-center gap-0.5', className)}
      role={interactive ? 'radiogroup' : undefined}
      aria-label={interactive ? ariaLabel : undefined}
      onMouseLeave={() => setHovered(null)}
    >
      {showValue && (
        <span className="text-sm font-semibold text-heading">{rating.toFixed(1)}</span>
      )}
      {Array.from({ length: 5 }, (_, i) => {
        const fullValue = i + 1
        const halfValue = i + 0.5
        const filled = displayRating >= fullValue
        const half = !filled && displayRating >= halfValue
        const selected = rating === fullValue || rating === halfValue

        if (!interactive) {
          return (
            <StarVisual
              key={i}
              filled={filled}
              half={half}
              sizeClass={sizeClass}
            />
          )
        }

        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${fullValue} stars`}
            disabled={disabled}
            onMouseMove={(e) => {
              setHovered(ratingFromPointer(i, e.clientX, e.currentTarget))
            }}
            onMouseEnter={(e) => {
              setHovered(ratingFromPointer(i, e.clientX, e.currentTarget))
            }}
            onFocus={() => setHovered(fullValue)}
            onBlur={() => setHovered(null)}
            onClick={(e) => {
              onChange(ratingFromPointer(i, e.clientX, e.currentTarget))
            }}
            className={cn(
              'inline-flex items-center justify-center rounded-md transition-transform duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
              'hover:scale-110 active:scale-95 cursor-pointer',
              hitAreaClass,
              hovered != null && hovered >= halfValue && 'scale-110',
            )}
          >
            <StarVisual
              filled={filled}
              half={half}
              sizeClass={sizeClass}
              className={cn(
                'transition-colors duration-150 pointer-events-none',
                hovered != null && hovered >= halfValue &&
                  'drop-shadow-[0_0_4px_rgba(251,191,36,0.55)]',
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
