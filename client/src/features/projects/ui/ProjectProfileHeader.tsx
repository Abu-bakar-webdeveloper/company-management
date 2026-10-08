import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/model/AuthContext'
import { userHasPermission } from '@/features/auth/model/permissions'
import type { Project } from '@/features/projects/model/types'
import { ProjectPriorityBadge } from '@/features/projects/ui/ProjectPriorityBadge'
import { ProjectDetailTabs } from '@/features/projects/ui/ProjectDetailTabs'

type ProjectProfileHeaderProps = {
  project: Project
  activeTab: Parameters<typeof ProjectDetailTabs>[0]['active']
  onTabChange: Parameters<typeof ProjectDetailTabs>[0]['onChange']
}

export function ProjectProfileHeader({
  project,
  activeTab,
  onTabChange,
}: ProjectProfileHeaderProps) {
  const { user } = useAuth()
  const canOpenClients = Boolean(user && userHasPermission(user, 'clients:read'))

  return (
    <>
      <div className="flex flex-col gap-6 p-6 sm:flex-row">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <ProjectPriorityBadge priority={project.priority} />
            {project.clientId && project.clientName ? (
              canOpenClients ? (
                <Link
                  to={`/clients/${project.clientId}`}
                  className="inline-flex rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-semibold text-[#1877f2] hover:opacity-90"
                >
                  {project.clientName}
                </Link>
              ) : (
                <span className="inline-flex rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-semibold text-[#1877f2]">
                  {project.clientName}
                </span>
              )
            ) : null}
          </div>
          <h2 className="mt-2 text-2xl font-bold text-heading">{project.name}</h2>
          <p className="mt-1 text-sm text-text-muted">{project.projectCode}</p>
          <p className="mt-2 text-sm text-heading">{project.description}</p>
        </div>
      </div>

      <ProjectDetailTabs active={activeTab} onChange={onTabChange} />
    </>
  )
}
