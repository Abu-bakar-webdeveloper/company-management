import { Link } from 'react-router-dom'
import type { TeamMember } from '@/features/team/model/types'
import { teamStatusLabels } from '@/features/team/model/teamData'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { Card } from '@/shared/ui/Card'
import { UserAvatar } from '@/shared/ui/UserAvatar'
import { cn } from '@/shared/lib/cn'

type TeamTableProps = {
  members: TeamMember[]
  isFiltered?: boolean
}

function statusClass(status: TeamMember['status']) {
  switch (status) {
    case 'active':
      return 'bg-success-muted text-success'
    case 'on_leave':
      return 'bg-warning-muted text-warning'
    case 'inactive':
      return 'bg-surface-muted text-text-muted'
  }
}

function StatusBadge({ status }: { status: TeamMember['status'] }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
        statusClass(status),
      )}
    >
      {teamStatusLabels[status]}
    </span>
  )
}

export function TeamTable({ members, isFiltered = false }: TeamTableProps) {
  if (members.length === 0) {
    return (
      <Card className="p-4 sm:p-6">
        <ComingSoonState
          title={isFiltered ? 'No team members found' : 'No team members yet'}
          description={
            isFiltered
              ? 'Try adjusting your search or filters.'
              : 'People who report to you will appear here once assigned.'
          }
          minHeight="min-h-[280px]"
        />
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:hidden sm:p-6">
        {members.map((member) => (
          <div
            key={member.id}
            className="rounded-xl border border-border-card bg-surface p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <UserAvatar name={member.fullName} avatar={member.avatar} size="lg" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-heading">{member.fullName}</p>
                  <p className="truncate text-xs text-text-muted">{member.email}</p>
                </div>
              </div>
              <StatusBadge status={member.status} />
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-text-muted">Role</dt>
                <dd className="text-right font-medium text-heading">{member.jobTitle}</dd>
              </div>
            </dl>
            <div className="mt-3 flex justify-end">
              <Link
                to={`/team/${member.id}`}
                className="text-sm font-semibold text-primary hover:opacity-90"
              >
                View
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-xs font-medium uppercase tracking-wide text-text-muted">
              <th className="px-6 py-4">Member</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b border-border last:border-0">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={member.fullName} avatar={member.avatar} size="lg" />
                    <div>
                      <p className="font-semibold text-heading">{member.fullName}</p>
                      <p className="text-xs text-text-muted">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-text-muted">{member.jobTitle}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={member.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    to={`/team/${member.id}`}
                    className="text-sm font-semibold text-primary hover:opacity-90"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
