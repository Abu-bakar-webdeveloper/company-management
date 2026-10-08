import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm, type Resolver } from 'react-hook-form'
import { toast } from 'sonner'
import { getCreatableStaffRoles, isStaffRole } from '@/features/auth/lib/staff-roles'
import { useAuth } from '@/features/auth/model/AuthContext'
import { useManagerOptions } from '@/features/employees/hooks/useManagerOptions'
import {
  departmentLabels,
  getJobTitlesForDepartmentRole,
  staffRolesByDepartment,
} from '@/features/employees/model/employeesData'
import {
  employeeCreateFormSchema,
  type EmployeeCreateFormValues,
} from '@/features/employees/model/schemas'
import type { EmployeeDepartment } from '@/features/employees/model/types'
import { EmployeeFormCard } from '@/features/employees/ui/EmployeeFormCard'
import { PhotoUploadField } from '@/features/employees/ui/FormControls'
import { useCustomRoles } from '@/features/settings/hooks/useCustomRoles'
import { getAssignableRoleOptions } from '@/features/settings/lib/assignable-roles'
import {
  FormField,
  FormSection,
  projectFormInputClass,
} from '@/features/projects/ui/ProjectFormCard'
import { ApiError, getErrorMessage } from '@/shared/api/errors'
import { ChevronSelect } from '@/shared/ui/ChevronSelect'
import { Checkbox } from '@/shared/ui/Checkbox'
import { cn } from '@/shared/lib/cn'

type AddEmployeeFormProps = {
  onSubmit: (values: EmployeeCreateFormValues) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function AddEmployeeForm({
  onSubmit,
  onCancel,
  isSubmitting: isSubmittingExternal,
}: AddEmployeeFormProps) {
  const { user } = useAuth()
  const { customRoles } = useCustomRoles()
  const { data: managers = [] } = useManagerOptions()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | undefined>()

  const allRoleOptions = useMemo(
    () => (user ? getAssignableRoleOptions(user.role, customRoles) : []),
    [user, customRoles],
  )

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting: isSubmittingForm },
  } = useForm<EmployeeCreateFormValues>({
    resolver: zodResolver(employeeCreateFormSchema) as Resolver<EmployeeCreateFormValues>,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      cnic: '',
      role: '',
      jobTitle: '',
      department: '' as EmployeeCreateFormValues['department'],
      homeAddress: '',
      joinDate: '',
      managerId: '',
      sendInviteEmail: true,
      basicSalary: undefined,
      hra: undefined,
      utilityAllowance: undefined,
      conveyanceAllowance: undefined,
      bankName: '',
      bankAccountNo: '',
      employmentStage: 'probation',
      confirmationDate: '',
    },
  })

  const isSubmitting = isSubmittingExternal ?? isSubmittingForm
  const photo = watch('photo')
  const sendInviteEmail = watch('sendInviteEmail')
  const employmentStage = watch('employmentStage')
  const department = watch('department')
  const role = watch('role')
  const managerId = watch('managerId')
  const jobTitle = watch('jobTitle')

  const roleOptions = useMemo(() => {
    if (!department) return []
    const allowed = staffRolesByDepartment[department as EmployeeDepartment] ?? []
    return allRoleOptions.filter(
      (option) =>
        option.group === 'custom' || (isStaffRole(option.value) && allowed.includes(option.value)),
    )
  }, [allRoleOptions, department])

  const jobTitleChoices = useMemo(
    () => getJobTitlesForDepartmentRole(department, role),
    [department, role],
  )

  const managersForDepartment = useMemo(() => {
    if (!department) return []
    const sameDepartment = managers.filter(
      (manager) => manager.department?.toLowerCase() === department.toLowerCase(),
    )
    return sameDepartment.length > 0 ? sameDepartment : managers
  }, [managers, department])

  const managerHint = !department
    ? 'Select a department first'
    : managers.some((manager) => manager.department?.toLowerCase() === department.toLowerCase())
      ? 'Optional — who this person reports to'
      : 'Optional — no managers in this department yet; showing all managers'

  useEffect(() => {
    if (!department) {
      setValue('role', '')
      setValue('jobTitle', '')
      setValue('managerId', '')
      return
    }

    if (roleOptions.length === 1) {
      setValue('role', roleOptions[0].value)
      return
    }

    if (role && !roleOptions.some((option) => option.value === role)) {
      setValue('role', '')
      setValue('jobTitle', '')
    }
  }, [department, roleOptions, role, setValue])

  useEffect(() => {
    if (!role) {
      setValue('jobTitle', '')
      return
    }
    if (jobTitle && !jobTitleChoices.includes(jobTitle)) {
      setValue('jobTitle', '')
    }
  }, [role, jobTitle, jobTitleChoices, setValue])

  useEffect(() => {
    if (!managerId) return
    if (!managersForDepartment.some((manager) => manager.id === managerId)) {
      setValue('managerId', '')
    }
  }, [managersForDepartment, managerId, setValue])

  useEffect(() => {
    if (!photo) {
      setPhotoPreview(undefined)
      return
    }
    const url = URL.createObjectURL(photo)
    setPhotoPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [photo])

  const onFormSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      await onSubmit(values)
    } catch (err) {
      const message = getErrorMessage(
        err,
        err instanceof ApiError ? err.message : 'Unable to create employee. Please try again.',
      )
      setSubmitError(message)
      toast.error(message)
    }
  })

  const canCreate = user ? getCreatableStaffRoles(user.role).length > 0 : false

  if (!canCreate) {
    return (
      <EmployeeFormCard
        title="Add New Employee"
        subtitle="You do not have permission to add employees."
        onClose={onCancel}
      >
        <p className="text-sm text-text-muted">Contact your company admin for access.</p>
      </EmployeeFormCard>
    )
  }

  return (
    <EmployeeFormCard
      title="Add New Employee"
      subtitle="Register a new team member to your organization."
      onClose={onCancel}
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-11 rounded-lg border border-[#e2e8f0] bg-surface px-6 text-sm font-semibold text-heading hover:bg-[#f8fafc] disabled:opacity-70"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-employee-form"
            disabled={isSubmitting}
            className="h-11 rounded-lg bg-primary px-6 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95 disabled:opacity-70"
          >
            {isSubmitting ? 'Creating…' : 'Create Employee'}
          </button>
        </div>
      }
    >
      <form id="add-employee-form" onSubmit={onFormSubmit} className="space-y-2" noValidate>
        {submitError && (
          <p className="mb-4 rounded-lg bg-[#fef2f2] px-4 py-3 text-sm text-danger">
            {submitError}
          </p>
        )}

        <FormSection title="Basic Information">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="First Name" error={errors.firstName?.message}>
              <input
                className={projectFormInputClass}
                placeholder="Ali"
                {...register('firstName')}
              />
            </FormField>
            <FormField label="Last Name" error={errors.lastName?.message}>
              <input
                className={projectFormInputClass}
                placeholder="Khan"
                {...register('lastName')}
              />
            </FormField>
            <FormField label="Email Address" error={errors.email?.message}>
              <input
                type="email"
                className={projectFormInputClass}
                placeholder="example@company.com"
                {...register('email')}
              />
            </FormField>
            <FormField label="Phone Number" error={errors.phone?.message}>
              <input
                type="tel"
                className={projectFormInputClass}
                placeholder="+92 300 1234567"
                {...register('phone')}
              />
            </FormField>
            <FormField label="CNIC Number" error={errors.cnic?.message}>
              <input
                className={projectFormInputClass}
                placeholder="11012-3456789-1"
                {...register('cnic')}
              />
            </FormField>
            <FormField label="Home Address" error={errors.homeAddress?.message}>
              <input
                className={projectFormInputClass}
                placeholder="House #, Street, City"
                {...register('homeAddress')}
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Role & Organization">
          <p className="mb-4 text-sm text-text-muted">
            Pick department first — role and job title unlock in order.
          </p>

          <div className="mb-5 flex flex-wrap items-center gap-x-1 gap-y-2 text-xs">
            {[
              { step: '1', label: 'Department', active: Boolean(department) },
              { step: '2', label: 'Role', active: Boolean(role) },
              { step: '3', label: 'Job title', active: Boolean(jobTitle) },
            ].map((item, index) => (
              <div key={item.label} className="flex items-center gap-1">
                {index > 0 && (
                  <span
                    aria-hidden
                    className={cn(
                      'mx-1 h-px w-4 transition-colors duration-200',
                      item.active ? 'bg-primary/50' : 'bg-border',
                    )}
                  />
                )}
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 transition-colors duration-200',
                    item.active ? 'text-primary' : 'text-text-muted',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-5 items-center justify-center rounded-md text-[10px] font-semibold transition-colors duration-200',
                      item.active
                        ? 'bg-primary text-white'
                        : 'bg-surface-muted text-text-muted',
                    )}
                  >
                    {item.step}
                  </span>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

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
                      setValue('role', '')
                      setValue('jobTitle', '')
                      setValue('managerId', '')
                    }}
                  >
                    <option value="">Select department</option>
                    {Object.entries(departmentLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </ChevronSelect>
                )}
              />
            </FormField>

            <FormField
              label="Role"
              error={errors.role?.message}
              hint={!department ? 'Select a department first' : undefined}
              className={cn(
                'transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
                department ? 'opacity-100' : 'opacity-60',
              )}
            >
              {roleOptions.length === 1 && department ? (
                <>
                  <input type="hidden" {...register('role')} />
                  <div className="flex h-11 items-center rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 text-sm font-medium text-heading">
                    {roleOptions[0].label}
                  </div>
                </>
              ) : (
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <ChevronSelect
                      name={field.name}
                      ref={field.ref}
                      value={field.value ?? ''}
                      onBlur={field.onBlur}
                      disabled={!department}
                      error={Boolean(errors.role)}
                      className="h-11 rounded-lg text-sm"
                      onChange={(event) => {
                        field.onChange(event.target.value)
                        setValue('jobTitle', '')
                      }}
                    >
                      <option value="">
                        {department ? 'Select a role' : 'Select department first'}
                      </option>
                      {roleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </ChevronSelect>
                  )}
                />
              )}
            </FormField>

            <FormField
              label="Job Title"
              error={errors.jobTitle?.message}
              hint={!role ? 'Select a role first' : undefined}
              className={cn(
                'transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
                role ? 'opacity-100' : 'opacity-60',
              )}
            >
              <Controller
                name="jobTitle"
                control={control}
                render={({ field }) => (
                  <ChevronSelect
                    name={field.name}
                    ref={field.ref}
                    value={field.value}
                    onBlur={field.onBlur}
                    disabled={!role || jobTitleChoices.length === 0}
                    error={Boolean(errors.jobTitle)}
                    className="h-11 rounded-lg text-sm"
                    onChange={(event) => field.onChange(event.target.value)}
                  >
                    <option value="">
                      {!role
                        ? 'Select role first'
                        : jobTitleChoices.length === 0
                          ? 'No titles for this role'
                          : 'Select job title'}
                    </option>
                    {jobTitleChoices.map((title) => (
                      <option key={title} value={title}>
                        {title}
                      </option>
                    ))}
                  </ChevronSelect>
                )}
              />
            </FormField>

            <FormField
              label="Manager"
              error={errors.managerId?.message}
              hint={managerHint}
              className={cn(
                'transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
                department ? 'opacity-100' : 'opacity-60',
              )}
            >
              <Controller
                name="managerId"
                control={control}
                render={({ field }) => (
                  <ChevronSelect
                    name={field.name}
                    ref={field.ref}
                    value={field.value}
                    onBlur={field.onBlur}
                    disabled={!department}
                    error={Boolean(errors.managerId)}
                    className="h-11 rounded-lg text-sm"
                    onChange={(event) => field.onChange(event.target.value)}
                  >
                    <option value="">
                      {!department ? 'Select department first' : 'No manager'}
                    </option>
                    {managersForDepartment.map((manager) => (
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
          </div>
        </FormSection>

        <FormSection title="Compensation & Bank">
          <div className="grid gap-4 sm:grid-cols-2">
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
                      const next = event.target.value as EmployeeCreateFormValues['employmentStage']
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
                {...register('confirmationDate')}
                className={projectFormInputClass}
                disabled={employmentStage !== 'permanent'}
              />
              <p className="mt-1 text-xs text-text-muted">
                {employmentStage === 'permanent'
                  ? 'Used for the permanent increment cycle. Defaults to join date if left blank.'
                  : 'Enable when stage is Permanent (optional on hire).'}
              </p>
            </FormField>
            <FormField label="Basic Salary" error={errors.basicSalary?.message}>
              <input
                type="number"
                min={0}
                step="1"
                placeholder="e.g. 50000"
                className={projectFormInputClass}
                {...register('basicSalary')}
              />
            </FormField>
            <FormField label="HRA" error={errors.hra?.message}>
              <input
                type="number"
                min={0}
                step="1"
                placeholder="0"
                className={projectFormInputClass}
                {...register('hra')}
              />
            </FormField>
            <FormField label="Utility Allowance" error={errors.utilityAllowance?.message}>
              <input
                type="number"
                min={0}
                step="1"
                placeholder="0"
                className={projectFormInputClass}
                {...register('utilityAllowance')}
              />
            </FormField>
            <FormField label="Conveyance Allowance" error={errors.conveyanceAllowance?.message}>
              <input
                type="number"
                min={0}
                step="1"
                placeholder="0"
                className={projectFormInputClass}
                {...register('conveyanceAllowance')}
              />
            </FormField>
            <FormField label="Bank Name" error={errors.bankName?.message}>
              <input
                placeholder="e.g. HBL"
                className={projectFormInputClass}
                {...register('bankName')}
              />
            </FormField>
            <FormField label="Bank Account No" error={errors.bankAccountNo?.message}>
              <input
                placeholder="Account number"
                className={projectFormInputClass}
                {...register('bankAccountNo')}
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Invite & Photo">
          <label className="mb-4 flex cursor-pointer items-center gap-2">
            <Checkbox
              checked={Boolean(sendInviteEmail)}
              onChange={(e) => setValue('sendInviteEmail', e.target.checked)}
            />
            <span className="text-sm font-medium text-heading">
              Send invitation email to set up their account
            </span>
          </label>
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
        </FormSection>
      </form>
    </EmployeeFormCard>
  )
}
