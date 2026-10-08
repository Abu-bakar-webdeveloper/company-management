import type { ManagedUser } from '@/features/settings/model/types'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { AvatarCircle, EditIcon, EyeIcon, TrashIcon } from '@/features/settings/ui/icons'
import { Card } from '@/shared/ui/Card'
import { MailIcon } from '@/shared/ui/icons'
import { cn } from '@/shared/lib/cn'

type UsersTableProps = {
  users: ManagedUser[]
  page: number
  total: number
  rangeStart: number
  rangeEnd: number
  totalPages: number
  onPageChange: (page: number) => void
  onView: (user: ManagedUser) => void
  onEdit: (user: ManagedUser) => void
  onDelete: (id: string) => void
  onResendInvite?: (user: ManagedUser) => void
  resendingUserId?: string | null
  isFiltered?: boolean
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[#EFF6FF] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#1877F2]">
      {role}
    </span>
  )
}

function StatusBadge({ status }: { status: ManagedUser['status'] }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide',
        status === 'active'
          ? 'bg-[#ECFDF5] text-[#00B67A]'
          : status === 'pending'
            ? 'bg-[#EFF6FF] text-[#1877F2]'
            : 'bg-[#F1F5F9] text-text-muted',
      )}
    >
      {status}
    </span>
  )
}

function UserActions({
  user,
  onView,
  onEdit,
  onDelete,
  onResendInvite,
  resendingUserId,
}: {
  user: ManagedUser
  onView: (u: ManagedUser) => void
  onEdit: (u: ManagedUser) => void
  onDelete: (id: string) => void
  onResendInvite?: (user: ManagedUser) => void
  resendingUserId?: string | null
}) {
  const isResending = resendingUserId === user.id

  return (
    <div className="flex items-center gap-2">
      {user.status === 'pending' && onResendInvite ? (
        <button
          type="button"
          disabled={isResending}
          onClick={() => onResendInvite(user)}
          className="flex size-9 items-center justify-center rounded-lg bg-[#fff7ed] text-[#ea580c] hover:opacity-90 disabled:opacity-60"
          aria-label={`Resend invite to ${user.name}`}
          title="Resend invite"
        >
          <MailIcon className="size-4 text-[#ea580c]" />
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => onEdit(user)}
        className="flex size-9 items-center justify-center rounded-lg bg-[#eff6ff] text-[#1877f2] hover:opacity-90"
        aria-label={`Edit ${user.name}`}
      >
        <EditIcon />
      </button>
      <button
        type="button"
        onClick={() => onView(user)}
        className="flex size-9 items-center justify-center rounded-lg bg-[#eff6ff] text-[#1877f2] hover:opacity-90"
        aria-label={`View ${user.name}`}
      >
        <EyeIcon />
      </button>
      <button
        type="button"
        onClick={() => onDelete(user.id)}
        className="flex size-9 items-center justify-center rounded-lg bg-[#fef2f2] text-[#dc2626] hover:opacity-90"
        aria-label={`Delete ${user.name}`}
      >
        <TrashIcon />
      </button>
    </div>
  )
}

export function UsersTable({
  users,
  page,
  total,
  rangeStart,
  rangeEnd,
  totalPages,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onResendInvite,
  resendingUserId,
  isFiltered = false,
}: UsersTableProps) {
  if (total === 0) {
    return (
      <Card className="p-4 sm:p-6">
        <ComingSoonState
          title={isFiltered ? 'No users found' : 'No users yet'}
          description={
            isFiltered
              ? 'Try adjusting your search or filters.'
              : 'Invite users to see them listed here.'
          }
          minHeight="min-h-[280px]"
        />
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
      <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:hidden sm:p-6">
        {users.map((user) => (
          <div
            key={user.id}
            className="rounded-xl border border-border-card bg-surface p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <AvatarCircle name={user.name} avatar={user.avatar} />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-heading">{user.name}</p>
                  <p className="truncate text-xs text-text-muted">{user.email}</p>
                </div>
              </div>
              <StatusBadge status={user.status} />
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-text-muted">Role</dt>
                <dd>
                  <RoleBadge role={user.role} />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-text-muted">Department</dt>
                <dd className="text-heading">{user.department}</dd>
              </div>
            </dl>
            <div className="mt-3 flex justify-end">
              <UserActions
                user={user}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                onResendInvite={onResendInvite}
                resendingUserId={resendingUserId}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-table-header text-xs font-semibold uppercase tracking-wide text-heading">
              <th className="px-6 py-3.5">Users</th>
              <th className="px-6 py-3.5">Email Address</th>
              <th className="px-6 py-3.5">Role</th>
              <th className="px-6 py-3.5">Department</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-border-card">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2.5">
                    <AvatarCircle name={user.name} avatar={user.avatar} />
                    <span className="font-semibold text-heading">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-heading">{user.email}</td>
                <td className="px-6 py-4">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-6 py-4 text-heading">{user.department}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={user.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center">
                    <UserActions
                      user={user}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onResendInvite={onResendInvite}
                      resendingUserId={resendingUserId}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 border-t border-border-card bg-table-header px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-center text-sm text-text-muted sm:text-left">
          Showing {rangeStart} to {rangeEnd} of {total} results
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
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
                  ? 'bg-[#1877f2] text-white'
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
