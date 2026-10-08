import type { ProjectTeamMember } from '@/features/projects/model/types'
import { getInitials } from '@/shared/lib/string-utils'
import { cn } from '@/shared/lib/cn'

type ProjectTeamAvatarsProps = {
  team: ProjectTeamMember[]
  maxVisible?: number
  size?: 'sm' | 'md'
}

export function ProjectTeamAvatars({ team, maxVisible = 2, size = 'sm' }: ProjectTeamAvatarsProps) {
  const visible = team.slice(0, maxVisible)
  const overflow = team.length - maxVisible
  const sizeClass = size === 'sm' ? 'size-7 text-[10px]' : 'size-9 text-xs'

  return (
    <div className="flex items-center">
      {visible.map((member, index) => (
        <div
          key={member.id}
          className={cn(
            'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-primary-muted font-semibold text-primary',
            sizeClass,
            index > 0 && '-ml-2',
          )}
          title={member.name}
        >
          {member.avatar ? (
            <img src={member.avatar} alt={member.name} className="size-full object-cover" />
          ) : (
            getInitials(member.name)
          )}
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            '-ml-2 flex shrink-0 items-center justify-center rounded-full border-2 border-white bg-[#f1f5f9] font-semibold text-text-muted',
            sizeClass,
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  )
}
