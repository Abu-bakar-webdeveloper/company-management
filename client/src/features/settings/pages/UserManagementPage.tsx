import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  useCreateUser,
  useDeleteUser,
  useResendUserInvite,
  useUpdateUser,
  useUsersList,
} from '@/features/settings/hooks/useUsers'
import { mapRoleFilter, mapStatusFilter } from '@/features/settings/lib/user-mappers'
import { filterUsers } from '@/features/settings/lib/user-utils'
import type { ManagedUser, UserFormValues, UserListFilters } from '@/features/settings/model/types'
import { PlusIcon } from '@/features/settings/ui/icons'
import { UserDetailsPanel } from '@/features/settings/ui/UserDetailsPanel'
import { UserFormModal } from '@/features/settings/ui/UserFormModal'
import { UsersTable } from '@/features/settings/ui/UsersTable'
import { UsersToolbar } from '@/features/settings/ui/UsersToolbar'
import { ArrowLeftIcon } from '@/shared/ui/icons'
import { ApiError } from '@/shared/api/errors'

const PAGE_SIZE = 10

const defaultFilters: UserListFilters = {
  search: '',
  role: 'All Roles',
  status: 'All Status',
  department: 'All Departments',
}

export function UserManagementPage() {
  const [filters, setFilters] = useState<UserListFilters>(defaultFilters)
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [editUser, setEditUser] = useState<ManagedUser | null>(null)
  const [viewUser, setViewUser] = useState<ManagedUser | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [resendingUserId, setResendingUserId] = useState<string | null>(null)

  const departmentFiltered = filters.department !== 'All Departments'

  const { data, isLoading } = useUsersList({
    page: departmentFiltered ? 1 : page,
    limit: departmentFiltered ? 100 : PAGE_SIZE,
    search: filters.search.trim() || undefined,
    role: mapRoleFilter(filters.role),
    status: mapStatusFilter(filters.status),
  })

  const createUser = useCreateUser()
  const deleteUser = useDeleteUser()
  const updateUser = useUpdateUser()
  const resendInvite = useResendUserInvite()

  useEffect(() => {
    setPage(1)
  }, [filters])

  const filtered = useMemo(() => {
    const users = data?.users ?? []
    if (!departmentFiltered) return users
    return filterUsers(users, { ...filters, search: '', role: 'All Roles', status: 'All Status' })
  }, [data?.users, filters, departmentFiltered])

  const pagination = useMemo(() => {
    if (departmentFiltered) {
      const total = filtered.length
      const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
      const currentPage = Math.min(page, totalPages)
      const start = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
      const end = Math.min(currentPage * PAGE_SIZE, total)
      return {
        items: filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
        currentPage,
        total,
        start,
        end,
        totalPages,
      }
    }

    const serverPagination = data?.pagination
    return {
      items: filtered,
      currentPage: serverPagination?.page ?? page,
      total: serverPagination?.total ?? filtered.length,
      start: serverPagination
        ? (serverPagination.page - 1) * serverPagination.limit + (filtered.length ? 1 : 0)
        : 0,
      end: serverPagination
        ? (serverPagination.page - 1) * serverPagination.limit + filtered.length
        : filtered.length,
      totalPages: serverPagination?.totalPages ?? 1,
    }
  }, [filtered, page, departmentFiltered, data?.pagination])

  const isFiltered =
    filters.search.trim() !== '' ||
    filters.role !== 'All Roles' ||
    filters.status !== 'All Status' ||
    filters.department !== 'All Departments'
  const showToolbar = !isLoading && (isFiltered || pagination.total > 0)

  const handleCreate = async (values: UserFormValues) => {
    setActionError(null)
    await createUser.mutateAsync(values)
  }

  const handleUpdate = async (values: UserFormValues) => {
    if (!editUser) return
    setActionError(null)
    await updateUser.mutateAsync({ id: editUser.id, values })
    setEditUser(null)
  }

  const handleResendInvite = async (user: ManagedUser) => {
    setActionError(null)
    setResendingUserId(user.id)
    try {
      await resendInvite.mutateAsync(user.id)
      toast.success(`Invite resent to ${user.email}`)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Unable to resend invite.'
      setActionError(message)
      toast.error(message)
    } finally {
      setResendingUserId(null)
    }
  }

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <Link
          to="/settings"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-heading"
        >
          <ArrowLeftIcon className="text-text-muted" />
          Back to Settings
        </Link>
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold leading-8 text-heading sm:text-[30px] sm:leading-9">
              User Management
            </h1>
            <p className="mt-1 text-sm leading-6 text-text-muted sm:text-base">
              Provision managers, HR staff, and employees via invite-only onboarding.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95 sm:w-auto"
          >
            <PlusIcon />
            Add User
          </button>
        </header>

        {actionError && (
          <p className="mb-4 rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
            {actionError}
          </p>
        )}

        {showToolbar ? (
          <UsersToolbar
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(defaultFilters)}
          />
        ) : null}

        {isLoading ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-border-card bg-surface">
            <p className="text-sm text-text-muted">Loading users…</p>
          </div>
        ) : (
          <UsersTable
            users={pagination.items}
            page={pagination.currentPage}
            total={pagination.total}
            rangeStart={pagination.start}
            rangeEnd={pagination.end}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
            onView={setViewUser}
            onEdit={setEditUser}
            isFiltered={isFiltered}
            onDelete={(id) => {
              if (!window.confirm('Delete this user? This cannot be undone.')) return
              setActionError(null)
              deleteUser.mutate(id, {
                onError: (err) => {
                  setActionError(err instanceof ApiError ? err.message : 'Unable to delete user.')
                },
              })
            }}
            onResendInvite={(user) => void handleResendInvite(user)}
            resendingUserId={resendingUserId}
          />
        )}
      </div>

      <UserFormModal
        open={createOpen}
        mode="create"
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />
      <UserFormModal
        open={!!editUser}
        mode="edit"
        user={editUser ?? undefined}
        onClose={() => setEditUser(null)}
        onSubmit={handleUpdate}
      />
      <UserDetailsPanel user={viewUser} onClose={() => setViewUser(null)} />
    </>
  )
}
