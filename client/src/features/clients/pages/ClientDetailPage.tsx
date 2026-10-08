import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/model/AuthContext'
import { canViewContractValue } from '@/features/auth/model/permissions'
import { useClient } from '@/features/clients/hooks/useClients'
import type { ClientDetailTab } from '@/features/clients/model/types'
import { ClientStatusBadge } from '@/features/clients/ui/ClientStatusBadge'
import { Card } from '@/shared/ui/Card'
import { DetailCardSkeleton } from '@/shared/ui/DataSkeletons'
import { cn } from '@/shared/lib/cn'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

const tabs: { id: ClientDetailTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'projects', label: 'Projects' },
]

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { can, user } = useAuth()
  const canWrite = can('clients:write')
  const showContractValue = canViewContractValue(user?.role)
  const { data: client, isLoading } = useClient(id)
  const [tab, setTab] = useState<ClientDetailTab>('overview')

  if (isLoading) {
    return <DetailCardSkeleton />
  }

  if (!client) {
    return (
      <div className="p-8 text-center">
        <p className="text-heading">Client not found</p>
        <Link to="/clients" className="mt-2 inline-block text-sm text-primary">
          Back to clients
        </Link>
      </div>
    )
  }

  const projects = client.projects ?? []

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-4">
        <Link to="/clients" className="text-sm font-medium text-primary hover:underline">
          ← Back to clients
        </Link>
      </div>

      <header className="mb-6 flex flex-col gap-4 rounded-xl border border-border-card bg-surface p-6 shadow-[var(--shadow-card)] sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-heading sm:text-[30px]">{client.name}</h1>
            <ClientStatusBadge status={client.status} />
          </div>
          <p className="mt-1 text-sm text-text-muted">{client.clientCode}</p>
          {client.industry ? (
            <p className="mt-1 text-sm text-text-muted">{client.industry}</p>
          ) : null}
        </div>
        {canWrite && (
          <Link
            to={`/clients/${client.id}/edit`}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:opacity-95"
          >
            Edit Client
          </Link>
        )}
      </header>

      <div className="mb-6 flex gap-1 border-b border-border-card">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              'border-b-2 px-4 py-3 text-sm font-semibold transition-colors',
              tab === item.id
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-heading',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="grid gap-4 sm:grid-cols-3 lg:col-span-3">
            <Card className="p-5">
              <p className="text-sm text-text-muted">Active projects</p>
              <p className="mt-1 text-2xl font-bold text-heading">
                {client.activeProjectCount}
              </p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-text-muted">Completed projects</p>
              <p className="mt-1 text-2xl font-bold text-heading">
                {client.completedProjectCount}
              </p>
            </Card>
            {showContractValue && (
              <Card className="p-5">
                <p className="text-sm text-text-muted">Contract value</p>
                <p className="mt-1 text-2xl font-bold text-heading">
                  {formatCurrency(client.totalContractValue)}
                </p>
              </Card>
            )}
          </div>

          <Card className="p-6 lg:col-span-2">
            <h2 className="mb-4 text-lg font-bold text-heading">Contact</h2>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-text-muted">Email</dt>
                <dd className="mt-0.5 font-medium text-heading">{client.email || '—'}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Phone</dt>
                <dd className="mt-0.5 font-medium text-heading">{client.phone || '—'}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Website</dt>
                <dd className="mt-0.5 font-medium text-heading">{client.website || '—'}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Primary contact</dt>
                <dd className="mt-0.5 font-medium text-heading">
                  {client.primaryContact?.name || '—'}
                  {client.primaryContact?.email
                    ? ` · ${client.primaryContact.email}`
                    : ''}
                </dd>
              </div>
            </dl>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-lg font-bold text-heading">Address</h2>
            <p className="text-sm leading-6 text-heading">
              {[
                client.address?.addressLine,
                client.address?.city,
                client.address?.postalCode,
                client.address?.country,
              ]
                .filter(Boolean)
                .join(', ') || '—'}
            </p>
            {client.notes ? (
              <>
                <h2 className="mb-2 mt-6 text-lg font-bold text-heading">Notes</h2>
                <p className="text-sm leading-6 text-text-muted whitespace-pre-wrap">
                  {client.notes}
                </p>
              </>
            ) : null}
          </Card>
        </div>
      )}

      {tab === 'projects' && (
        <Card className="overflow-hidden">
          <div className="border-b border-border-card px-6 py-4">
            <h2 className="text-lg font-bold text-heading">Projects</h2>
          </div>
          {projects.length === 0 ? (
            <p className="p-8 text-center text-sm text-text-muted">
              No projects linked to this client yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border-card bg-[#f8fafc] text-xs font-semibold uppercase tracking-wide text-text-muted">
                    <th className="px-6 py-3">Code</th>
                    <th className="px-6 py-3">Project</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Progress</th>
                    {showContractValue && <th className="px-6 py-3">Value</th>}
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id} className="border-b border-border-card last:border-0">
                      <td className="px-6 py-4 text-text-muted">{project.projectCode}</td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/projects/${project.id}`}
                          className="font-semibold text-primary hover:underline"
                        >
                          {project.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 capitalize text-heading">
                        {project.status.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 text-heading">{project.progress}%</td>
                      {showContractValue && (
                        <td className="px-6 py-4 text-heading">
                          {project.contractValue != null
                            ? formatCurrency(project.contractValue)
                            : '—'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
