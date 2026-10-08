import type { Project } from '@/features/projects/model/types'
import type { TeamMemberProject } from '@/features/team/model/teamMemberDetailData'

export function mapProjectToMemberProject(project: Project): TeamMemberProject {
  return {
    id: project.id,
    title: project.name,
    description: project.description,
    status: project.status,
  }
}
