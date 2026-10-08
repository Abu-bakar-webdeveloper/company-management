import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/features/auth'
import { useManagerOptions } from '@/features/employees/hooks/useManagerOptions'
import { getAssignableRoleOptions, isEmployeeAssignableRole } from '@/features/settings/lib/assignable-roles'
import { managedUserToFormValues } from '@/features/settings/lib/user-mappers'
import { departmentOptions } from '@/features/settings/model/settingsData'
import type { ManagedUser, UserFormValues } from '@/features/settings/model/types'
import { useCustomRoles } from '@/features/settings/hooks/useCustomRoles'
import { ToggleSwitch } from '@/features/settings/ui/ToggleSwitch'
import { jobTitleOptions } from '@/features/employees/model/employeesData'
import { ApiError } from '@/shared/api/errors'
import { Checkbox } from '@/shared/ui/Checkbox'
import { Modal } from '@/shared/ui/Modal'
import { SelectField } from '@/shared/ui/SelectField'
import { TextField } from '@/shared/ui/TextField'

const inputClass = '!h-11 rounded-lg border-[#e2e8f0] text-sm'

type UserFormModalProps = {
  open: boolean
  mode: 'create' | 'edit'
  user?: ManagedUser
  onClose: () => void
  onSubmit: (values: UserFormValues) => Promise<void>
}

const emptyValues: UserFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  role: '',
  department: '',
  jobTitle: '',
  phone: '',
  cnic: '',
  joinDate: '',
  managerId: '',
  status: 'pending',
  sendInviteEmail: true,
}

export function UserFormModal({ open, mode, user, onClose, onSubmit }: UserFormModalProps) {
  const { user: actor } = useAuth()
  const { customRoles } = useCustomRoles()
  const { data: managers = [] } = useManagerOptions(open)
  const [values, setValues] = useState<UserFormValues>(emptyValues)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const roleOptions = useMemo(
    () => getAssignableRoleOptions(actor?.role ?? 'employee', customRoles),
    [actor?.role, customRoles],
  )

  const managerOptions = useMemo(
    () => managers.filter((manager) => manager.id !== user?.id),
    [managers, user?.id],
  )

  useEffect(() => {
    if (open && mode === 'edit' && user) {
      setValues(managedUserToFormValues(user))
    } else if (open && mode === 'create') {
      setValues(emptyValues)
    }
    if (open) setSubmitError(null)
  }, [open, mode, user])

  const set = <K extends keyof UserFormValues>(key: K, value: UserFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async () => {
    if (isEmployeeAssignableRole(values.role, customRoles) && !values.jobTitle?.trim()) {
      setSubmitError('Job title is required for employees')
      return
    }

    setSubmitting(true)
    setSubmitError(null)
    try {
      await onSubmit(values)
      onClose()
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Unable to save user.')
    } finally {
      setSubmitting(false)
    }
  }

  const isCreate = mode === 'create'
  const isEmployee = isEmployeeAssignableRole(values.role, customRoles)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isCreate ? 'Create New User' : 'Edit User'}
      subtitle={
        isCreate
          ? 'An invitation email will be sent so the user can set their password.'
          : undefined
      }
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-border bg-surface px-5 text-sm font-semibold text-heading hover:bg-surface-muted sm:flex-none"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => void handleSubmit()}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-70 sm:flex-none"
          >
            {submitting ? 'Saving…' : isCreate ? 'Send Invite' : 'Update User'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-text-muted">First Name</p>
            <TextField
              value={values.firstName}
              onChange={(e) => set('firstName', e.target.value)}
              placeholder="e.g. John"
              inputClassName={inputClass}
            />
          </div>
          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-text-muted">Last Name</p>
            <TextField
              value={values.lastName}
              onChange={(e) => set('lastName', e.target.value)}
              placeholder="e.g. Doe"
              inputClassName={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-text-muted">Email Address</p>
            <TextField
              value={values.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="e.g. john@company.com"
              inputClassName={inputClass}
              disabled={!isCreate}
            />
          </div>
          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-text-muted">Role</p>
            <SelectField
              value={values.role}
              onChange={(e) => set('role', e.target.value as UserFormValues['role'])}
              className={inputClass}
              disabled={!isCreate}
            >
              <option value="">Select Role</option>
              {roleOptions.some((option) => option.group === 'default') && (
                <optgroup label="Default roles">
                  {roleOptions
                    .filter((option) => option.group === 'default')
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </optgroup>
              )}
              {roleOptions.some((option) => option.group === 'custom') && (
                <optgroup label="Custom roles">
                  {roleOptions
                    .filter((option) => option.group === 'custom')
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </optgroup>
              )}
            </SelectField>
          </div>
          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-text-muted">Department</p>
            <SelectField
              value={values.department}
              onChange={(e) => set('department', e.target.value)}
              className={inputClass}
            >
              <option value="">Select Department</option>
              {departmentOptions
                .filter((d) => d !== 'All Departments')
                .map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
            </SelectField>
          </div>
          <div className="sm:col-span-2">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-text-muted">Job Title</p>
            <TextField
              value={values.jobTitle ?? ''}
              onChange={(e) => set('jobTitle', e.target.value)}
              placeholder="e.g. Senior Developer"
              inputClassName={inputClass}
              list="settings-job-title-options"
            />
            <datalist id="settings-job-title-options">
              {jobTitleOptions.map((title) => (
                <option key={title} value={title} />
              ))}
            </datalist>
          </div>

          <div className="sm:col-span-2">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-text-muted">Manager</p>
            <SelectField
              value={values.managerId ?? ''}
              onChange={(e) => set('managerId', e.target.value)}
              className={inputClass}
            >
              <option value="">No manager (optional)</option>
              {managerOptions.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.fullName}
                </option>
              ))}
            </SelectField>
            <p className="mt-1.5 text-xs text-text-muted">Optional — who this person reports to</p>
          </div>

          {isEmployee && (
            <>
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-text-muted">Phone</p>
                <TextField
                  value={values.phone ?? ''}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="+92 300 1234567"
                  inputClassName={inputClass}
                />
              </div>
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-text-muted">CNIC</p>
                <TextField
                  value={values.cnic ?? ''}
                  onChange={(e) => set('cnic', e.target.value)}
                  placeholder="42101-1234567-1"
                  inputClassName={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-text-muted">Join Date</p>
                <TextField
                  type="date"
                  value={values.joinDate ?? ''}
                  onChange={(e) => set('joinDate', e.target.value)}
                  inputClassName={inputClass}
                />
              </div>
            </>
          )}
        </div>

        {isCreate && (
          <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-[#EFF6FF] p-4">
            <Checkbox
              className="mt-0.5"
              checked={values.sendInviteEmail}
              onChange={(e) => set('sendInviteEmail', e.target.checked)}
            />
            <span className="text-sm text-text-muted">
              Send invitation email so the user can set their password and activate their account.
            </span>
          </label>
        )}

        {!isCreate && (
          <div className="rounded-xl bg-[#EFF6FF] p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-heading">Account Status</p>
                <p className="text-xs text-text-muted">
                  {values.status === 'active' ? 'User can sign in' : 'Waiting for invite acceptance'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-heading">Active</span>
                <ToggleSwitch
                  checked={values.status === 'active'}
                  onChange={(v) => set('status', v ? 'active' : 'pending')}
                  ariaLabel="Account status"
                />
              </div>
            </div>
          </div>
        )}

        {submitError && <p className="text-sm text-danger">{submitError}</p>}
      </div>
    </Modal>
  )
}
