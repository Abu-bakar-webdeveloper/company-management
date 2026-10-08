import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/model/AuthContext'
import { canViewContractValue, userHasPermission } from '@/features/auth/model/permissions'
import type { Project } from '@/features/projects/model/types'
import { projectSourceLabels } from '@/features/projects/model/schemas'
import { AvatarCircle } from '@/features/projects/ui/icons'
import { Card } from '@/shared/ui/Card'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function ProjectOverviewTab({ project }: { project: Project }) {
  const { user } = useAuth()
  const showCommercial = canViewContractValue(user?.role)
  const canOpenClients = Boolean(user && userHasPermission(user, 'clients:read'))

  return (
    <div className="grid gap-6 p-6 lg:grid-cols-2">
      <Card className="p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
          Project Progress
        </p>
        <div className="mt-3 flex items-center gap-4">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#f1f5f9]">
            <div
              className="h-full rounded-full bg-[#1877f2] transition-all"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <span className="text-2xl font-bold text-heading">{project.progress}%</span>
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
          Manager
        </p>
        <div className="mt-3 flex items-center gap-3">
          <AvatarCircle
            name={project.managerName}
            avatar={project.managerAvatar}
            className="size-10"
          />
          <div>
            <p className="font-semibold text-heading">{project.managerName}</p>
            <p className="text-sm text-text-muted">Project Lead</p>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
          Client
        </p>
        {project.clientId && project.clientName ? (
          <div className="mt-3">
            {canOpenClients ? (
              <Link
                to={`/clients/${project.clientId}`}
                className="text-lg font-semibold text-primary hover:underline"
              >
                {project.clientName}
              </Link>
            ) : (
              <p className="text-lg font-semibold text-heading">{project.clientName}</p>
            )}
            {project.clientCode ? (
              <p className="mt-1 text-sm text-text-muted">{project.clientCode}</p>
            ) : null}
          </div>
        ) : (
          <p className="mt-3 text-sm font-medium text-heading">Company-owned</p>
        )}
      </Card>

      {showCommercial && (
        <Card className="p-5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
            Commercial
          </p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-text-muted">Source</dt>
              <dd className="font-medium text-heading">
                {project.source ? projectSourceLabels[project.source] : '—'}
              </dd>
            </div>
            {project.sourceNote ? (
              <div className="flex justify-between gap-3">
                <dt className="text-text-muted">Source note</dt>
                <dd className="text-right font-medium text-heading">{project.sourceNote}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-3">
              <dt className="text-text-muted">Contract value</dt>
              <dd className="font-medium text-heading">
                {project.contractValue != null ? formatCurrency(project.contractValue) : '—'}
              </dd>
            </div>
          </dl>
        </Card>
      )}
    </div>
  )
}
