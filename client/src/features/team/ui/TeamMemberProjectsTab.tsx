import type { TeamMemberProject } from '@/features/team/model/teamMemberDetailData'
import { cn } from '@/shared/lib/cn'

const statusStyles = {
  in_progress: 'bg-[#e8f2ff] text-[#1877f2]',
  completed: 'bg-[#e6f9f0] text-[#00b67a]',
  delayed: 'bg-[#fff7ed] text-[#ea580c]',
}

const statusLabels = {
  in_progress: 'IN PROGRESS',
  completed: 'COMPLETED',
  delayed: 'DELAYED',
}

function TeamMemberProjectCard({ project }: { project: TeamMemberProject }) {
  return (
    <div className="flex items-center justify-between gap-6 rounded-lg bg-[#f0f7ff] px-6 py-4">
      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-bold uppercase leading-5 tracking-wide text-heading">
          {project.title}
        </h4>
        <p className="mt-1 text-sm font-normal leading-5 text-[#778499]">{project.description}</p>
      </div>
      <span
        className={cn(
          'inline-flex shrink-0 items-center rounded-full px-3.5 py-1.5 text-[10px] font-bold leading-none tracking-wide',
          statusStyles[project.status],
        )}
      >
        {statusLabels[project.status]}
      </span>
    </div>
  )
}

export function TeamMemberProjectsTab({ projects }: { projects: TeamMemberProject[] }) {
  if (projects.length === 0) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center p-12 text-center">
        <p className="text-lg font-semibold text-heading">No projects assigned</p>
        <p className="mt-2 text-sm text-text-muted">
          This person is not assigned to any projects yet. Add them on a project to collaborate.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white px-6 py-5">
      <h3 className="mb-4 text-lg font-bold text-[#1877f2]">Projects</h3>
      <div className="flex flex-col gap-3">
        {projects.map((project) => (
          <TeamMemberProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}
