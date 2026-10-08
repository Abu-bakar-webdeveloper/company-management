import { useEffect, useState } from 'react'
import { getInitials } from '@/shared/lib/string-utils'
import { cn } from '@/shared/lib/cn'

const sizeClasses = {
  sm: 'size-8 text-xs',
  md: 'size-9 text-xs',
  lg: 'size-10 text-sm',
  xl: 'size-16 text-lg',
  '2xl': 'size-20 text-xl',
  '3xl': 'size-24 text-2xl',
} as const

const roundedClasses = {
  full: 'rounded-full',
  xl: 'rounded-xl',
} as const

export type UserAvatarProps = {
  name: string
  avatar?: string | null
  size?: keyof typeof sizeClasses
  rounded?: keyof typeof roundedClasses
  className?: string
  alt?: string
}

export function UserAvatar({
  name,
  avatar,
  size = 'md',
  rounded = 'full',
  className,
  alt,
}: UserAvatarProps) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [avatar])

  const showImage = Boolean(avatar) && !failed
  const initials = getInitials(name) || '?'

  if (showImage) {
    return (
      <img
        src={avatar!}
        alt={alt ?? name}
        onError={() => setFailed(true)}
        className={cn(
          'shrink-0 object-cover',
          sizeClasses[size],
          roundedClasses[rounded],
          className,
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center bg-primary-muted font-semibold text-primary',
        sizeClasses[size],
        roundedClasses[rounded],
        className,
      )}
      aria-hidden={!alt}
      aria-label={alt}
      role={alt ? 'img' : undefined}
    >
      {initials}
    </div>
  )
}
