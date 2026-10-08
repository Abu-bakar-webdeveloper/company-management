import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import type { Permission } from '@/features/auth/model/permissions'
import { useCustomRoles } from '@/features/settings/hooks/useCustomRoles'
import { useUsersList } from '@/features/settings/hooks/useUsers'
import {
  getDefaultStaffRoles,
  mergeRoles,
} from '@/features/settings/lib/role-permissions'
import type { CustomRole } from '@/features/settings/model/types'
import { CreateRoleModal } from '@/features/settings/ui/CreateRoleModal'
import { RoleAccessEditor } from '@/features/settings/ui/RoleAccessEditor'
import { RolesList } from '@/features/settings/ui/RolesList'
import { PlusIcon, ShieldIcon } from '@/features/settings/ui/icons'
import { Card } from '@/shared/ui/Card'
import { ArrowLeftIcon } from '@/shared/ui/icons'

export function RolesPermissionsPage() {
  const { user } = useAuth()
  const {
    customRoles,
    createRole,
    deleteRole,
    canManageCustomRoles,
    isSaving,
    isDeleting,
  } = useCustomRoles()
  const [selectedId, setSelectedId] = useState('manager')
  const [createOpen, setCreateOpen] = useState(false)
  const { data } = useUsersList({ page: 1, limit: 100 })

  const roles = useMemo(() => {
    const users = data?.users ?? []
    const hubs = user?.enabledHubs
    const defaultRoles = getDefaultStaffRoles(
      {
        manager: users.filter((u) => u.roleKey === 'manager' && !u.customRoleId).length,
        hr: users.filter((u) => u.roleKey === 'hr' && !u.customRoleId).length,
        employee: users.filter((u) => u.roleKey === 'employee' && !u.customRoleId).length,
      },
      hubs,
    )
    return mergeRoles(defaultRoles, customRoles, hubs)
  }, [data?.users, customRoles, user?.enabledHubs])

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === selectedId) ?? roles[0],
    [roles, selectedId],
  )

  const permissions: Permission[] = selectedRole?.permissions ?? []
  const isCustomSelected = Boolean(selectedRole?.isCustom)

  const handleSelectRole = (id: string) => {
    setSelectedId(id)
  }

  const handleCreateRole = async (
    name: string,
    baseRole: CustomRole['baseRole'],
    nextPermissions: Permission[],
  ) => {
    const created = await createRole(name, baseRole, nextPermissions)
    setSelectedId(`custom:${created.id}`)
  }

  const handleDeleteRole = async () => {
    if (!selectedRole?.isCustom || !canManageCustomRoles) return
    const customId = selectedRole.id.replace('custom:', '')
    await deleteRole(customId)
    setSelectedId('manager')
  }

  const roleCountLabel = `${roles.length} Role${roles.length === 1 ? '' : 's'}`

  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8">
      <Link
        to="/settings"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-heading"
      >
        <ArrowLeftIcon className="text-text-muted" />
        Back to Settings
      </Link>

      <header className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold leading-8 text-heading sm:text-[28px] sm:leading-9 lg:text-[30px]">
              Roles &amp; Permissions
            </h1>
            <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <p className="text-sm leading-6 text-text-muted sm:text-base">
                Manager, HR, and Employee are fixed built-in roles. Create a custom role to choose
                modules and capabilities — it is locked after creation.
              </p>
              <span className="w-fit rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-[10px] font-bold text-[#1877F2]">
                {roleCountLabel}
              </span>
            </div>
            {user?.role === 'admin' && (
              <p className="mt-2 text-xs text-text-muted">
                Your account is the company administrator — it is not an assignable staff role.
              </p>
            )}
          </div>
          {canManageCustomRoles && (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:opacity-95"
            >
              <PlusIcon className="size-4" />
              Create Role
            </button>
          )}
        </div>
      </header>

      {!selectedRole ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-border-card bg-surface sm:min-h-[400px]">
          <p className="text-sm text-text-muted">Loading roles…</p>
        </div>
      ) : (
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] lg:items-start xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <div className="min-w-0 lg:shrink-0">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-text-muted">Staff Roles</p>
            <RolesList
              roles={roles}
              selectedId={selectedId}
              onSelect={handleSelectRole}
              onCreateNew={canManageCustomRoles ? () => setCreateOpen(true) : undefined}
            />
          </div>
          <div className="min-w-0 space-y-4">
            <Card className="min-w-0 overflow-hidden">
              <div className="flex flex-col gap-4 border-b border-border-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white sm:size-12">
                    <ShieldIcon className="size-5 sm:size-6" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-base font-bold text-heading sm:text-lg">
                        Role: {selectedRole.name}
                      </h2>
                      {selectedRole.badge && (
                        <span className="rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#00B67A]">
                          {selectedRole.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-text-muted sm:text-sm">
                      {isCustomSelected
                        ? 'Locked after creation. Delete and recreate to change access.'
                        : 'Read-only view of permissions enforced by the application.'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <RoleAccessEditor permissions={permissions} readOnly />
              </div>
            </Card>
            {isCustomSelected && canManageCustomRoles && (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isDeleting || isSaving}
                  onClick={() => void handleDeleteRole()}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 text-sm font-semibold text-[#DC2626] hover:opacity-90 disabled:opacity-70"
                >
                  {isDeleting ? 'Deleting…' : 'Delete Role'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <CreateRoleModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateRole}
      />
    </div>
  )
}
