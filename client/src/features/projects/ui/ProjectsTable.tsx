import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/model/AuthContext'
import { userHasPermission } from '@/features/auth/model/permissions'
import { formatTimelineRange } from '@/features/projects/lib/project-utils'
import type { Project } from '@/features/projects/model/types'
import { AvatarCircle, EditIcon, EyeIcon, TrashIcon } from '@/features/projects/ui/icons'
import { ProjectStatusBadge } from '@/features/projects/ui/ProjectStatusBadge'
import { ProjectTeamAvatars } from '@/features/projects/ui/ProjectTeamAvatars'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { Card } from '@/shared/ui/Card'
import { cn } from '@/shared/lib/cn'

type ProjectsTableProps = {
  projects: Project[]
  page: number
  total: number
  rangeStart: number
  rangeEnd: number
  totalPages: number
  onPageChange: (page: number) => void
  onDelete?: (id: string) => void
  canWrite?: boolean
  deletingId?: string | null
  isFiltered?: boolean
}

function ProjectActions({
  project,
  canWrite,
  onDelete,
  deletingId,
}: {
  project: Project
  canWrite: boolean
  onDelete?: (id: string) => void
  deletingId: string | null
}) {
  return (
    <div className="flex items-center gap-2">
      {canWrite && (
        <Link
          to={`/projects/${project.id}/edit`}
          className="flex size-9 items-center justify-center rounded-lg bg-[#eff6ff] text-[#1877f2] hover:opacity-90"
          aria-label={`Edit ${project.name}`}
        >
          <EditIcon />
        </Link>
      )}
      <Link
        to={`/projects/${project.id}`}
        className="flex size-9 items-center justify-center rounded-lg bg-[#eff6ff] text-[#1877f2] hover:opacity-90"
        aria-label={`View ${project.name}`}
      >
        <EyeIcon />
      </Link>
      {canWrite && onDelete && (
        <button
          type="button"
          onClick={() => onDelete(project.id)}
          disabled={deletingId === project.id}
          className="flex size-9 items-center justify-center rounded-lg bg-[#fef2f2] text-[#dc2626] hover:opacity-90 disabled:opacity-50"
          aria-label={`Delete ${project.name}`}
        >
          <TrashIcon />
        </button>
      )}
    </div>
  )
}

export function ProjectsTable({
  projects,
  page,
  total,
  rangeStart,
  rangeEnd,
  totalPages,
  onPageChange,
  onDelete,
  canWrite = false,
  deletingId = null,
  isFiltered = false,
}: ProjectsTableProps) {
  const { user } = useAuth()
  const canOpenClients = Boolean(user && userHasPermission(user, 'clients:read'))

  if (total === 0) {
    return (
      <Card className="overflow-hidden">
        <div className="border-b border-border-card px-4 py-4 sm:px-6">
          <h2 className="text-xl font-bold text-heading sm:text-2xl">Project Directory</h2>
        </div>
        <div className="p-4 sm:p-6">
          <ComingSoonState
            title={isFiltered ? 'No projects found' : 'No projects yet'}
            description={
              isFiltered
                ? 'Try adjusting your search or filters.'
                : canWrite
                  ? 'Create a project to see it listed here.'
                  : 'You are not assigned to any projects yet.'
            }
            minHeight="min-h-[280px]"
          />
        </div>
      </Card>
    )
  }

  const pageNumbers =
    totalPages <= 3
      ? Array.from({ length: totalPages }, (_, i) => i + 1)
      : page <= 2
        ? [1, 2, 3]
        : page >= totalPages - 1
          ? [totalPages - 2, totalPages - 1, totalPages]
          : [page - 1, page, page + 1]

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border-card px-4 py-4 sm:px-6">
        <h2 className="text-xl font-bold text-heading sm:text-2xl">Project Directory</h2>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:hidden sm:p-6 sm:gap-4">
        {projects.map((project) => {
          const [timelineStart, timelineEnd] = formatTimelineRange(
            project.startDate,
            project.endDate,
          ).split(' - ')

          return (
            <div
              key={project.id}
              className={cn(
                'rounded-xl border border-border-card bg-surface p-4',
                deletingId === project.id && 'animate-pulse opacity-60',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-heading">{project.name}</p>
                  {project.description ? (
                    <p className="mt-0.5 line-clamp-2 text-xs text-text-muted">
                      {project.description}
                    </p>
                  ) : null}
                </div>
                <ProjectStatusBadge status={project.status} />
              </div>

              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="shrink-0 text-text-muted">Client</dt>
                  <dd className="truncate text-right text-heading">
                    {project.clientName ?? 'Company-owned'}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="shrink-0 text-text-muted">Manager</dt>
                  <dd className="flex min-w-0 items-center gap-2 text-heading">
                    <AvatarCircle name={project.managerName} avatar={project.managerAvatar} />
                    <span className="truncate">{project.managerName}</span>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="shrink-0 text-text-muted">Team</dt>
                  <dd>
                    <ProjectTeamAvatars team={project.team} />
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="shrink-0 text-text-muted">Timeline</dt>
                  <dd className="text-right text-sm">
                    <span className="text-heading">{timelineStart}</span>
                    <span className="text-[#dc2626]"> - {timelineEnd}</span>
                  </dd>
                </div>
              </dl>

              <div className="mt-3 flex justify-end">
                <ProjectActions
                  project={project}
                  canWrite={canWrite}
                  onDelete={onDelete}
                  deletingId={deletingId}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-table-header text-xs font-semibold uppercase tracking-wide text-heading">
              <th className="px-6 py-3.5">Project Name</th>
              <th className="px-6 py-3.5">Client</th>
              <th className="px-6 py-3.5">Manager</th>
              <th className="px-6 py-3.5">Team</th>
              <th className="px-6 py-3.5">Timeline</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const [timelineStart, timelineEnd] = formatTimelineRange(
                project.startDate,
                project.endDate,
              ).split(' - ')

              return (
                <tr
                  key={project.id}
                  className={cn(
                    'border-t border-border-card',
                    deletingId === project.id && 'animate-pulse opacity-60',
                  )}
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-heading">{project.name}</p>
                    {project.description ? (
                      <p className="mt-0.5 text-xs text-text-muted">{project.description}</p>
                    ) : null}
                  </td>
                  <td className="px-6 py-4">
                    {project.clientId && project.clientName ? (
                      canOpenClients ? (
                        <Link
                          to={`/clients/${project.clientId}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {project.clientName}
                        </Link>
                      ) : (
                        <span className="font-medium text-heading">{project.clientName}</span>
                      )
                    ) : (
                      <span className="text-text-muted">Company-owned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <AvatarCircle name={project.managerName} avatar={project.managerAvatar} />
                      <span className="text-heading">{project.managerName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <ProjectTeamAvatars team={project.team} />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-heading">{timelineStart}</span>
                    <span className="text-[#dc2626]"> - {timelineEnd}</span>
                  </td>
                  <td className="px-6 py-4">
                    <ProjectStatusBadge status={project.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <ProjectActions
                        project={project}
                        canWrite={canWrite}
                        onDelete={onDelete}
                        deletingId={deletingId}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 border-t border-border-card bg-table-header px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-text-muted">
          Showing {rangeStart} to {rangeEnd} of {total} results
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </button>
          {pageNumbers.map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={cn(
                'min-w-9 rounded-lg px-3 py-1.5 text-sm font-medium',
                pageNum === page
                  ? 'bg-primary text-white hover:opacity-95'
                  : 'border border-border bg-surface text-text-muted hover:bg-surface-muted',
              )}
            >
              {pageNum}
            </button>
          ))}
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </Card>
  )
}
