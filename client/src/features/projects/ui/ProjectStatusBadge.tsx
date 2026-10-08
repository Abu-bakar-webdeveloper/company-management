import type { ProjectStatus } from '@/features/projects/model/types'
import { statusLabels } from '@/features/projects/model/projectsData'
import { cn } from '@/shared/lib/cn'

const statusStyles: Record<ProjectStatus, string> = {
  in_progress: 'bg-[#eff6ff] text-[#1877f2]',
  completed: 'bg-[#ecfdf5] text-[#00b67a]',
  delayed: 'bg-[#fef2f2] text-[#dc2626]',
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-3 py-1 text-[11px] font-semibold',
        statusStyles[status],
      )}
    >
      {statusLabels[status]}
    </span>
  )
}
