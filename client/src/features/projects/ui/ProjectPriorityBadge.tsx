import type { ProjectPriority } from '@/features/projects/model/types'
import { priorityLabels } from '@/features/projects/model/projectsData'
import { cn } from '@/shared/lib/cn'

const priorityStyles: Record<ProjectPriority, string> = {
  low: 'bg-[#f1f5f9] text-[#64748b]',
  medium: 'bg-[#fff7ed] text-[#ea580c]',
  high: 'bg-[#fef2f2] text-[#dc2626]',
}

export function ProjectPriorityBadge({ priority }: { priority: ProjectPriority }) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-3 py-1 text-[11px] font-semibold',
        priorityStyles[priority],
      )}
    >
      {priorityLabels[priority]}
    </span>
  )
}
