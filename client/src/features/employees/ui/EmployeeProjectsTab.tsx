import { useMemberProjects } from '@/features/projects/hooks/useProjects'
import { mapProjectToMemberProject } from '@/features/projects/lib/project-mappers'
import { TeamMemberProjectsTab } from '@/features/team/ui/TeamMemberProjectsTab'

type EmployeeProjectsTabProps = {
  employeeId: string
}

export function EmployeeProjectsTab({ employeeId }: EmployeeProjectsTabProps) {
  const { data: projects = [], isLoading, isError } = useMemberProjects(employeeId)

  if (isLoading) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center p-12 text-center">
        <p className="text-sm text-text-muted">Loading projects…</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center p-12 text-center">
        <p className="text-lg font-semibold text-heading">Unable to load projects</p>
        <p className="mt-2 text-sm text-text-muted">Please try again in a moment.</p>
      </div>
    )
  }

  return <TeamMemberProjectsTab projects={projects.map(mapProjectToMemberProject)} />
}
