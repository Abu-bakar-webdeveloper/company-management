import { useEffect, useState } from 'react'
import { DEFAULT_STAFF_ROLES, staffRoleLabel } from '@/features/auth/lib/staff-roles'
import { useAuth } from '@/features/auth/model/AuthContext'
import { filterPermissionsForHubs, resolveEnabledHubs } from '@/features/auth/model/companyHubs'
import { ROLE_PERMISSIONS, type Permission } from '@/features/auth/model/permissions'
import type { AccessModuleId, CapabilityId } from '@/features/settings/lib/role-capabilities'
import { toggleCapability, toggleModule } from '@/features/settings/lib/role-capabilities'
import type { CustomRole } from '@/features/settings/model/types'
import { RoleAccessEditor } from '@/features/settings/ui/RoleAccessEditor'
import { Modal } from '@/shared/ui/Modal'
import { SelectField } from '@/shared/ui/SelectField'
import { InfoIcon } from '@/shared/ui/icons'

type CreateRoleModalProps = {
  open: boolean
  onClose: () => void
  onSubmit: (
    name: string,
    baseRole: CustomRole['baseRole'],
    permissions: Permission[],
  ) => Promise<void>
}

export function CreateRoleModal({ open, onClose, onSubmit }: CreateRoleModalProps) {
  const { user } = useAuth()
  const hubs = resolveEnabledHubs(user?.enabledHubs)
  const templateFor = (role: CustomRole['baseRole']) =>
    filterPermissionsForHubs([...ROLE_PERMISSIONS[role]], hubs)

  const [name, setName] = useState('')
  const [baseRole, setBaseRole] = useState<CustomRole['baseRole']>('employee')
  const [permissions, setPermissions] = useState<Permission[]>(() => templateFor('employee'))
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setName('')
    setBaseRole('employee')
    setPermissions(
      filterPermissionsForHubs([...ROLE_PERMISSIONS.employee], resolveEnabledHubs(user?.enabledHubs)),
    )
  }, [open, user?.enabledHubs])

  const handleClose = () => {
    onClose()
  }

  const handleBaseRoleChange = (next: CustomRole['baseRole']) => {
    setBaseRole(next)
    setPermissions(filterPermissionsForHubs([...ROLE_PERMISSIONS[next]], hubs))
  }

  const handleToggleModule = (moduleId: AccessModuleId, enabled: boolean) => {
    setPermissions((prev) => toggleModule(prev, moduleId, enabled))
  }

  const handleToggleCapability = (capabilityId: CapabilityId, enabled: boolean) => {
    setPermissions((prev) => toggleCapability(prev, capabilityId, enabled))
  }

  const handleSubmit = async () => {
    if (!name.trim() || permissions.length === 0) return
    setSubmitting(true)
    try {
      await onSubmit(name.trim(), baseRole, filterPermissionsForHubs(permissions, hubs))
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = Boolean(name.trim()) && permissions.length > 0 && !submitting

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create New Role"
      subtitle="Choose modules and capabilities. The role is locked after creation."
      className="sm:max-w-2xl"
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-border bg-surface px-5 text-sm font-semibold text-heading hover:bg-surface-muted sm:flex-none"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => void handleSubmit()}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-70 sm:flex-none"
          >
            {submitting ? 'Creating…' : 'Create Role'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-text-muted">
            Role Name
          </p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sales Lead"
            className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-heading outline-none placeholder:text-placeholder-alt focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-text-muted">
            Base Template
          </p>
          <SelectField
            value={baseRole}
            onChange={(e) => handleBaseRoleChange(e.target.value as CustomRole['baseRole'])}
            className="!h-11 rounded-lg border-[#e2e8f0] text-sm"
          >
            {DEFAULT_STAFF_ROLES.map((role) => (
              <option key={role} value={role}>
                {staffRoleLabel(role)}
              </option>
            ))}
          </SelectField>
          <p className="mt-1.5 text-xs text-text-muted">
            Permissions start from this built-in role. Customize modules below before creating.
          </p>
        </div>

        <div className="flex gap-3 rounded-xl bg-[#EFF6FF] p-4">
          <InfoIcon className="mt-0.5 size-4 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-bold text-heading">Locked after creation</p>
            <p className="mt-1 text-xs leading-5 text-text-muted">
              Select modules first, then choose capabilities. You cannot edit this role later — delete
              it and create a new one if access needs to change.
            </p>
          </div>
        </div>

        <RoleAccessEditor
          permissions={permissions}
          compact
          onToggleModule={handleToggleModule}
          onToggleCapability={handleToggleCapability}
        />
      </div>
    </Modal>
  )
}
