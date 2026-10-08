import type { BoardMember } from '@/features/tasks/model/types'
import { cn } from '@/shared/lib/cn'

type BoardAvatarProps = {
  member: BoardMember | null | undefined
  size?: 'sm' | 'md'
}

const sizeClass = {
  sm: 'size-6 text-[10px]',
  md: 'size-7 text-[11px]',
}

export function BoardAvatar({ member, size = 'md' }: BoardAvatarProps) {
  if (!member) return null
  return (
    <div
      title={member.name}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full border-2 border-surface font-semibold text-white shadow-[0_0_0_1px_rgba(0,0,0,0.06)]',
        member.colorClass,
        sizeClass[size],
      )}
    >
      {member.initials}
    </div>
  )
}
