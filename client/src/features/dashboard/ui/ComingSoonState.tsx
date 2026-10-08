import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type ComingSoonStateProps = {
  title?: string
  description?: string
  className?: string
  minHeight?: string
  compact?: boolean
  icon?: ReactNode
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 2.5L13.6 8.4L19.5 10L13.6 11.6L12 17.5L10.4 11.6L4.5 10L10.4 8.4L12 2.5Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M18.5 14.5L19.2 17.1L21.8 17.8L19.2 18.5L18.5 21.1L17.8 18.5L15.2 17.8L17.8 17.1L18.5 14.5Z"
        fill="currentColor"
        opacity="0.55"
      />
    </svg>
  )
}

export function ComingSoonState({
  title = 'Not available',
  description = 'No data is available for this section right now.',
  className,
  minHeight = 'min-h-[220px]',
  compact = false,
  icon,
}: ComingSoonStateProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#CBD5E1] bg-gradient-to-br from-[#F8FAFC] via-white to-[#EFF6FF] text-center',
        minHeight,
        compact ? 'gap-2 px-4 py-6' : 'gap-3 px-6 py-10',
        className,
      )}
      role="status"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-[#1877F2]/[0.06]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-10 -left-6 size-24 rounded-full bg-[#FF5C00]/[0.05]"
        aria-hidden
      />
      <div
        className={cn(
          'relative flex items-center justify-center rounded-2xl bg-white text-[#1877F2] shadow-[0_1px_3px_rgba(15,23,42,0.08)] ring-1 ring-[#E2E8F0]',
          compact ? 'size-11' : 'size-14',
        )}
      >
        {icon ?? <SparkleIcon className={compact ? 'size-5' : 'size-7'} />}
      </div>
      <div className="relative max-w-xs">
        <p
          className={cn(
            'font-semibold text-[#1E293B]',
            compact ? 'text-sm' : 'text-base sm:text-lg',
          )}
        >
          {title}
        </p>
        <p
          className={cn(
            'mt-1 leading-5 text-[#64748B]',
            compact ? 'text-xs' : 'text-sm',
          )}
        >
          {description}
        </p>
      </div>
    </div>
  )
}

type ComingSoonCardProps = ComingSoonStateProps & {
  heading?: string
  cardClassName?: string
}

/** Card wrapper with a section heading and not-available body. */
export function ComingSoonCard({
  heading,
  cardClassName,
  ...stateProps
}: ComingSoonCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-6',
        cardClassName,
      )}
    >
      {heading ? (
        <h3 className="mb-4 text-xl font-semibold leading-6 text-[#1E293B] sm:text-2xl">
          {heading}
        </h3>
      ) : null}
      <ComingSoonState {...stateProps} className={cn('flex-1', stateProps.className)} />
    </div>
  )
}
