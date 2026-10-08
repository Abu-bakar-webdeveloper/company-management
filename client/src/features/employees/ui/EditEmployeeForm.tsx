import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm, type Resolver } from 'react-hook-form'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/model/AuthContext'
import { isStaffRole } from '@/features/auth/lib/staff-roles'
import { useManagerOptions } from '@/features/employees/hooks/useManagerOptions'
import { getEmployeeNames } from '@/features/employees/lib/employee-utils'
import {
  departmentLabels,
  getJobTitlesForDepartmentRole,
  staffRolesByDepartment,
  statusLabels,
} from '@/features/employees/model/employeesData'
import {
  employeeFormSchema,
  type EmployeeFormValues,
} from '@/features/employees/model/schemas'
import type { Employee, EmployeeDepartment } from '@/features/employees/model/types'
import { PhotoUploadField } from '@/features/employees/ui/FormControls'
import { EmployeeFormCard } from '@/features/employees/ui/EmployeeFormCard'
import {
  BanIcon,
  EditIcon,
  KeyIcon,
  UserOffIcon,
} from '@/features/employees/ui/icons'
import { useCustomRoles } from '@/features/settings/hooks/useCustomRoles'
import { getAssignableRoleOptions } from '@/features/settings/lib/assignable-roles'
import {
  FormField,
  FormSection,
  projectFormInputClass,
} from '@/features/projects/ui/ProjectFormCard'
import { ApiError, getErrorMessage } from '@/shared/api/errors'
import { cn } from '@/shared/lib/cn'
import { ChevronSelect } from '@/shared/ui/ChevronSelect'
import { UserAvatar } from '@/shared/ui/UserAvatar'

type EditEmployeeFormProps = {
  employee: Employee
  onSubmit: (values: EmployeeFormValues) => Promise<void>
  onCancel: () => void
  onResendInvite?: () => Promise<void>
  onPasswordReset?: () => Promise<void>
  onDelete?: () => Promise<void>
}

function toDateInputValue(value?: string): string {
  if (!value) return ''
  return value.slice(0, 10)
}

function employeeToFormValues(employee: Employee): EmployeeFormValues {
  const { firstName, lastName } = getEmployeeNames(employee)
  let status: EmployeeFormValues['status'] = 'active'
  if (employee.status === 'pending') status = 'pending'
  else if (employee.status === 'suspended' || employee.status === 'inactive') {
    status = 'suspended'
  }

  return {
    firstName,
    lastName,
    email: employee.email,
    phone: employee.phone,
    cnic: employee.cnic ?? '',
    role: employee.customRoleId
      ? `custom:${employee.customRoleId}`
      : employee.systemRole ?? 'employee',
    jobTitle: employee.jobTitle,
    department: employee.department,
    homeAddress: employee.homeAddress ?? '',
    status,
    joinDate: toDateInputValue(employee.joinDate),
    managerId: employee.managerId ?? '',
    sendInviteEmail: false,
    basicSalary: employee.basicSalary,
    hra: employee.hra,
    utilityAllowance: employee.utilityAllowance,
    conveyanceAllowance: employee.conveyanceAllowance,
    bankName: employee.bankName ?? '',
    bankAccountNo: employee.bankAccountNo ?? '',
    employmentStage: employee.employmentStage ?? 'probation',
    confirmationDate: employee.confirmationDate
      ? toDateInputValue(employee.confirmationDate)
      : '',
  }
}

function ActionCard({
  icon,
  iconBg,
  title,
  description,
  buttonLabel,
  buttonClass,
  onClick,
  disabled,
}: {
  icon: React.ReactNode
  iconBg: string
  title: string
  description: string
  buttonLabel: string
  buttonClass: string
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-border-card bg-surface p-6 text-center shadow-[var(--shadow-stat)]">
      <div className={cn('mb-4 flex size-12 items-center justify-center rounded-xl', iconBg)}>
        {icon}
      </div>
      <h3 className="text-base font-bold text-heading">{title}</h3>
      <p className="mt-2 text-sm text-text-muted">{description}</p>
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={cn(
          'mt-5 h-10 w-full rounded-lg text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60',
          buttonClass,
        )}
      >
        {buttonLabel}
      </button>
    </div>
  )
}

export function EditEmployeeForm({
  employee,
  onSubmit,
  onCancel,
  onResendInvite,
  onPasswordReset,
  onDelete,
}: EditEmployeeFormProps) {
  const { user } = useAuth()
  const { customRoles } = useCustomRoles()
  const { data: managers = [] } = useManagerOptions()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [inviteSending, setInviteSending] = useState(false)
  const [resetSending, setResetSending] = useState(false)
  const [suspending, setSuspending] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(employee.avatar)

  const roleOptionsAll = useMemo(
    () => (user ? getAssignableRoleOptions(user.role, customRoles) : []),
    [user, customRoles],
  )
  const canEditRole = user?.role === 'admin' && roleOptionsAll.length > 0

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema) as Resolver<EmployeeFormValues>,
    defaultValues: employeeToFormValues(employee),
  })

  useEffect(() => {
    reset(employeeToFormValues(employee))
    setPhotoPreview(employee.avatar)
  }, [employee, reset])

  const photo = watch('photo')
  const firstName = watch('firstName')
  const lastName = watch('lastName')
  const department = watch('department')
  const role = watch('role')
  const jobTitle = watch('jobTitle')
  const managerId = watch('managerId')
  const employmentStage = watch('employmentStage')

  const roleOptions = useMemo(() => {
    if (!department) return []
    const allowed = staffRolesByDepartment[department as EmployeeDepartment] ?? []
    return roleOptionsAll.filter(
      (option) =>
        option.group === 'custom' || (isStaffRole(option.value) && allowed.includes(option.value)),
    )
  }, [roleOptionsAll, department])

  const jobTitleChoices = useMemo(() => {
    const titles = getJobTitlesForDepartmentRole(
      department,
      role || employee.systemRole || 'employee',
    )
    if (jobTitle && !titles.includes(jobTitle)) {
      return [jobTitle, ...titles]
    }
    return titles
  }, [department, role, employee.systemRole, jobTitle])

  const managerOptions = useMemo(() => {
    const others = managers.filter((manager) => manager.id !== employee.id)
    if (!department) return others
    const sameDepartment = others.filter(
      (manager) => manager.department?.toLowerCase() === department.toLowerCase(),
    )
    return sameDepartment.length > 0 ? sameDepartment : others
  }, [managers, department, employee.id])

  const managerHint = managers
    .filter((manager) => manager.id !== employee.id)
    .some((manager) => manager.department?.toLowerCase() === department?.toLowerCase())
    ? 'Optional — who this person reports to'
    : 'Optional — no managers in this department yet; showing all managers'

  useEffect(() => {
    if (!canEditRole || !role) return
    if (roleOptions.length > 0 && !roleOptions.some((option) => option.value === role)) {
      setValue('role', '')
      setValue('jobTitle', '')
    }
  }, [canEditRole, role, roleOptions, setValue])

  useEffect(() => {
    if (!managerId) return
    if (!managerOptions.some((manager) => manager.id === managerId)) {
      setValue('managerId', '')
    }
  }, [managerOptions, managerId, setValue])

  useEffect(() => {
    if (photo) {
      const url = URL.createObjectURL(photo)
      setPhotoPreview(url)
      return () => URL.revokeObjectURL(url)
    }
    setPhotoPreview(employee.avatar)
  }, [photo, employee.avatar])

  const onFormSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      await onSubmit(canEditRole ? values : { ...values, role: undefined })
    } catch (err) {
      const message = getErrorMessage(
        err,
        err instanceof ApiError ? err.message : 'Unable to save changes. Please try again.',
      )
      setSubmitError(message)
      toast.error(message)
    }
  })

  const handleSuspendOrReactivate = async () => {
    const nextStatus = employee.status === 'suspended' ? 'active' : 'suspended'
    setSuspending(true)
    setSubmitError(null)
    try {
      const values = getValues()
      await onSubmit({
        ...(canEditRole ? values : { ...values, role: undefined }),
        status: nextStatus,
      })
      setValue('status', nextStatus)
      toast.success(nextStatus === 'suspended' ? 'Account suspended' : 'Account reactivated')
    } catch (err) {
      const message = getErrorMessage(
        err,
        nextStatus === 'suspended'
          ? 'Unable to suspend account. Please try again.'
          : 'Unable to reactivate account. Please try again.',
      )
      setSubmitError(message)
      toast.error(message)
    } finally {
      setSuspending(false)
    }
  }

  const avatar = photoPreview ?? employee.avatar

  return (
    <div className="space-y-6">
      <EmployeeFormCard
        title="Edit Profile"
        subtitle="Fill in the information below to update employee details."
        onClose={onCancel}
        headerExtra={
          <div className="relative shrink-0">
            <UserAvatar
              name={`${firstName} ${lastName}`.trim() || employee.fullName}
              avatar={avatar}
              size="2xl"
              rounded="xl"
            />
            <span className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-[#1877f2] text-white">
              <EditIcon className="size-3.5" />
            </span>
          </div>
        }
        footer={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="h-11 rounded-lg border border-[#e2e8f0] bg-surface px-6 text-sm font-semibold text-heading hover:bg-[#f8fafc]"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-employee-form"
              disabled={isSubmitting}
              className="h-11 rounded-lg bg-[#1877f2] px-6 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95 disabled:opacity-70"
            >
              {isSubmitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        }
      >
        <form id="edit-employee-form" onSubmit={onFormSubmit} className="space-y-2" noValidate>
          {submitError && (
            <p className="mb-4 rounded-lg bg-[#fef2f2] px-4 py-3 text-sm text-danger">
              {submitError}
            </p>
          )}

          <FormSection title="Basic Information">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="First Name" error={errors.firstName?.message}>
                <input {...register('firstName')} className={projectFormInputClass} />
              </FormField>
              <FormField label="Last Name" error={errors.lastName?.message}>
                <input {...register('lastName')} className={projectFormInputClass} />
              </FormField>
              <FormField label="Email Address" error={errors.email?.message}>
                <input
                  type="email"
                  readOnly
                  disabled
                  className={cn(projectFormInputClass, 'bg-[#f8fafc] text-text-muted')}
                  {...register('email')}
                />
              </FormField>
              <FormField label="Phone Number" error={errors.phone?.message}>
                <input type="tel" {...register('phone')} className={projectFormInputClass} />
              </FormField>
              <FormField label="CNIC Number" error={errors.cnic?.message}>
                <input
                  {...register('cnic')}
                  placeholder="42101-1234567-1"
                  className={projectFormInputClass}
                />
              </FormField>
              <FormField label="Home Address" error={errors.homeAddress?.message}>
                <input
                  {...register('homeAddress')}
                  placeholder="Enter residential address"
                  className={projectFormInputClass}
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Role & Organization">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Department" error={errors.department?.message}>
                <Controller
                  name="department"
                  control={control}
                  render={({ field }) => (
                    <ChevronSelect
                      name={field.name}
                      ref={field.ref}
                      value={field.value}
                      onBlur={field.onBlur}
                      error={Boolean(errors.department)}
                      className="h-11 rounded-lg text-sm"
                      onChange={(event) => {
                        field.onChange(event.target.value)
                        if (canEditRole) {
                          setValue('role', '')
                        }
                        setValue('jobTitle', '')
                        setValue('managerId', '')
                      }}
                    >
                      {Object.entries(departmentLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </ChevronSelect>
                  )}
                />
              </FormField>

              {canEditRole ? (
                <FormField label="Role" error={errors.role?.message}>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <ChevronSelect
                        name={field.name}
                        ref={field.ref}
                        value={field.value ?? ''}
                        onBlur={field.onBlur}
                        error={Boolean(errors.role)}
                        className="h-11 rounded-lg text-sm"
                        onChange={(event) => {
                          field.onChange(event.target.value)
                          setValue('jobTitle', '')
                        }}
                      >
                        <option value="">Select a role</option>
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
                      </ChevronSelect>
                    )}
                  />
                </FormField>
              ) : (
                <FormField label="Role">
                  <div className="flex h-11 items-center rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 text-sm font-medium text-heading">
                    {employee.roleLabel ?? 'Employee'}
                  </div>
                </FormField>
              )}

              <FormField label="Job Title" error={errors.jobTitle?.message}>
                <Controller
                  name="jobTitle"
                  control={control}
                  render={({ field }) => (
                    <ChevronSelect
                      name={field.name}
                      ref={field.ref}
                      value={field.value}
                      onBlur={field.onBlur}
                      error={Boolean(errors.jobTitle)}
                      className="h-11 rounded-lg text-sm"
                      onChange={(event) => field.onChange(event.target.value)}
                    >
                      <option value="">Select job title</option>
                      {jobTitleChoices.map((title) => (
                        <option key={title} value={title}>
                          {title}
                        </option>
                      ))}
                    </ChevronSelect>
                  )}
                />
              </FormField>

              <FormField label="Manager" error={errors.managerId?.message} hint={managerHint}>
                <Controller
                  name="managerId"
                  control={control}
                  render={({ field }) => (
                    <ChevronSelect
                      name={field.name}
                      ref={field.ref}
                      value={field.value}
                      onBlur={field.onBlur}
                      error={Boolean(errors.managerId)}
                      className="h-11 rounded-lg text-sm"
                      onChange={(event) => field.onChange(event.target.value)}
                    >
                      <option value="">No manager</option>
                      {managerOptions.map((manager) => (
                        <option key={manager.id} value={manager.id}>
                          {manager.fullName}
                          {manager.jobTitle ? ` — ${manager.jobTitle}` : ''}
                        </option>
                      ))}
                    </ChevronSelect>
                  )}
                />
              </FormField>

              <FormField label="Join Date" error={errors.joinDate?.message}>
                <input type="date" {...register('joinDate')} className={projectFormInputClass} />
              </FormField>
              <FormField label="Status" error={errors.status?.message}>
                <ChevronSelect
                  {...register('status')}
                  error={Boolean(errors.status)}
                  className="h-11 rounded-lg text-sm"
                >
                  <option value="active">{statusLabels.active}</option>
                  <option value="pending">{statusLabels.pending}</option>
                  <option value="suspended">{statusLabels.suspended}</option>
                </ChevronSelect>
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Compensation & Bank">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Employee ID">
                <div className="flex h-11 items-center rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 text-sm font-medium text-heading">
                  {employee.employeeId}
                </div>
              </FormField>
              <FormField label="Employment stage" error={errors.employmentStage?.message}>
                <Controller
                  name="employmentStage"
                  control={control}
                  render={({ field }) => (
                    <ChevronSelect
                      name={field.name}
                      ref={field.ref}
                      value={field.value}
                      onBlur={field.onBlur}
                      error={Boolean(errors.employmentStage)}
                      className="h-11 rounded-lg text-sm"
                      onChange={(event) => {
                        const next = event.target.value as EmployeeFormValues['employmentStage']
                        field.onChange(next)
                        if (next !== 'permanent') {
                          setValue('confirmationDate', '')
                        }
                      }}
                    >
                      <option value="probation">Probation</option>
                      <option value="permanent">Permanent</option>
                    </ChevronSelect>
                  )}
                />
              </FormField>
              <FormField
                label="Confirmation date"
                error={errors.confirmationDate?.message}
                className={cn(
                  'transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
                  employmentStage === 'permanent' ? 'opacity-100' : 'opacity-60',
                )}
              >
                <input
                  type="date"
                  className={projectFormInputClass}
                  {...register('confirmationDate')}
                  disabled={employmentStage !== 'permanent'}
                />
                <p className="mt-1 text-xs text-text-muted">
                  {employmentStage === 'permanent'
                    ? 'Used for the permanent increment cycle. Defaults to join date if left blank.'
                    : 'Enable when stage is Permanent.'}
                </p>
              </FormField>
              <FormField label="Basic Salary" error={errors.basicSalary?.message}>
                <input
                  type="number"
                  min={0}
                  step="1"
                  className={projectFormInputClass}
                  {...register('basicSalary')}
                />
              </FormField>
              <FormField label="HRA" error={errors.hra?.message}>
                <input
                  type="number"
                  min={0}
                  step="1"
                  className={projectFormInputClass}
                  {...register('hra')}
                />
              </FormField>
              <FormField label="Utility Allowance" error={errors.utilityAllowance?.message}>
                <input
                  type="number"
                  min={0}
                  step="1"
                  className={projectFormInputClass}
                  {...register('utilityAllowance')}
                />
              </FormField>
              <FormField label="Conveyance Allowance" error={errors.conveyanceAllowance?.message}>
                <input
                  type="number"
                  min={0}
                  step="1"
                  className={projectFormInputClass}
                  {...register('conveyanceAllowance')}
                />
              </FormField>
              <FormField label="Bank Name" error={errors.bankName?.message}>
                <input className={projectFormInputClass} {...register('bankName')} />
              </FormField>
              <FormField label="Bank Account No" error={errors.bankAccountNo?.message}>
                <input className={projectFormInputClass} {...register('bankAccountNo')} />
              </FormField>
            </div>
          </FormSection>

          <FormField label="Employee Photo" error={errors.photo?.message}>
            <Controller
              name="photo"
              control={control}
              render={({ field }) => (
                <PhotoUploadField
                  value={field.value}
                  previewUrl={photoPreview}
                  onChange={field.onChange}
                  error={errors.photo?.message}
                />
              )}
            />
          </FormField>
        </form>
      </EmployeeFormCard>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <ActionCard
          icon={<KeyIcon />}
          iconBg="bg-[#eff6ff]"
          title={employee.status === 'pending' ? 'Resend Invite' : 'Reset Password'}
          description={
            employee.status === 'pending'
              ? 'Send a new invitation email for pending accounts.'
              : "Send a password reset link to the employee's email."
          }
          buttonLabel={
            employee.status === 'pending'
              ? inviteSending
                ? 'Sending…'
                : 'Send Invite'
              : resetSending
                ? 'Sending…'
                : 'Send Link'
          }
          buttonClass="border border-[#1877f2] text-[#1877f2] bg-surface hover:bg-[#eff6ff]"
          disabled={
            employee.status === 'pending'
              ? !onResendInvite || inviteSending
              : !onPasswordReset || resetSending || employee.status === 'suspended'
          }
          onClick={
            employee.status === 'pending'
              ? onResendInvite
                ? async () => {
                    setInviteSending(true)
                    try {
                      await onResendInvite()
                    } finally {
                      setInviteSending(false)
                    }
                  }
                : undefined
              : onPasswordReset
                ? async () => {
                    setResetSending(true)
                    try {
                      await onPasswordReset()
                    } finally {
                      setResetSending(false)
                    }
                  }
                : undefined
          }
        />
        <ActionCard
          icon={<BanIcon />}
          iconBg="bg-[#fff7ed]"
          title="Suspend Access"
          description={
            employee.status === 'suspended'
              ? 'This account is suspended and cannot sign in. Reactivate to restore access.'
              : 'Suspend this account to block sign-in until reactivated.'
          }
          buttonLabel={
            suspending
              ? 'Updating…'
              : employee.status === 'suspended'
                ? 'Reactivate'
                : 'Suspend'
          }
          buttonClass={
            employee.status === 'suspended'
              ? 'border border-[#86efac] text-[#15803d] bg-surface hover:bg-[#f0fdf4]'
              : 'border border-[#fed7aa] text-[#f97316] bg-surface hover:bg-[#fff7ed]'
          }
          disabled={employee.status === 'pending' || suspending || isSubmitting}
          onClick={() => {
            void handleSuspendOrReactivate()
          }}
        />
        <ActionCard
          icon={<UserOffIcon />}
          iconBg="bg-[#fef2f2]"
          title="Offboard"
          description="Permanently remove this employee from the organization."
          buttonLabel={deleting ? 'Removing…' : 'Delete Employee'}
          buttonClass="border border-[#fecaca] text-[#dc2626] bg-surface hover:bg-[#fef2f2]"
          disabled={!onDelete || deleting}
          onClick={
            onDelete
              ? async () => {
                  if (!window.confirm('Delete this employee permanently?')) return
                  setDeleting(true)
                  try {
                    await onDelete()
                  } finally {
                    setDeleting(false)
                  }
                }
              : undefined
          }
        />
      </div>
    </div>
  )
}
