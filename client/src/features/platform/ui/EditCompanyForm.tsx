import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import {
  useDeleteCompany,
  useResetCompanyAccess,
  useUpdateCompany,
  useUpdateCompanyStatus,
} from '@/features/platform/hooks/useCompanies'
import { editFormToUpdatePayload } from '@/features/platform/lib/company-utils'
import {
  countryOptions,
  currencyOptions,
  dateFormatOptions,
  startAsOptions,
  subscriptionPlanOptions,
  timezoneOptions,
} from '@/features/platform/model/companiesFormData'
import { companyEditFormSchema, type CompanyEditFormValues } from '@/features/platform/model/schemas'
import {
  ColorField,
  CompanyIconInput,
  CompanySelect,
} from '@/features/platform/ui/CompanyFormControls'
import {
  CompanyFormField,
  companyInputClass,
} from '@/features/platform/ui/CompanyFormField'
import { CompanyFormSection } from '@/features/platform/ui/CompanyFormSection'
import {
  BrandingSectionIcon,
  BuildingSectionIcon,
  CloseIcon,
  LocationSectionIcon,
  MailIcon,
  ModulesSectionIcon,
  SettingsSectionIcon,
} from '@/features/platform/ui/icons'
import { CompanyHubsField } from '@/features/platform/ui/CompanyHubsField'
import { PlatformActionCards } from '@/features/platform/ui/PlatformActionCards'
import { getErrorMessage } from '@/shared/api/errors'
import { Card } from '@/shared/ui/Card'

type EditCompanyFormProps = {
  companyId: string
  adminEmail: string
  defaultValues: CompanyEditFormValues
}

export function EditCompanyForm({ companyId, adminEmail, defaultValues }: EditCompanyFormProps) {
  const navigate = useNavigate()
  const updateCompany = useUpdateCompany()
  const updateStatus = useUpdateCompanyStatus()
  const deleteCompany = useDeleteCompany()
  const resetAccess = useResetCompanyAccess()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompanyEditFormValues>({
    resolver: zodResolver(companyEditFormSchema),
    defaultValues,
  })

  const onFormSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      await updateCompany.mutateAsync({
        id: companyId,
        payload: editFormToUpdatePayload(values),
      })
      navigate(`/companies/${companyId}`)
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Unable to update company. Please try again.'))
    }
  })

  const handleSuspend = async () => {
    if (!window.confirm('Suspend this company? Users will lose access until reactivated.')) return
    setActionFeedback(null)
    setActionError(null)
    try {
      await updateStatus.mutateAsync({ id: companyId, status: 'inactive' })
      setActionFeedback('Company suspended successfully.')
    } catch (error) {
      setActionError(getErrorMessage(error, 'Unable to suspend company.'))
    }
  }

  const handleResetAccess = async () => {
    if (!window.confirm('Reset access for all users in this company? They will need to sign in again.')) {
      return
    }
    setActionFeedback(null)
    setActionError(null)
    try {
      await resetAccess.mutateAsync(companyId)
      setActionFeedback('Company access reset successfully.')
    } catch (error) {
      setActionError(getErrorMessage(error, 'Unable to reset company access.'))
    }
  }

  const handleDelete = async () => {
    if (
      !window.confirm(
        'This permanently removes users, projects, tasks, and leaves. This cannot be undone. Delete this company?',
      )
    ) {
      return
    }
    setActionFeedback(null)
    setActionError(null)
    try {
      await deleteCompany.mutateAsync(companyId)
      navigate('/companies')
    } catch (error) {
      setActionError(getErrorMessage(error, 'Unable to delete company.'))
    }
  }

  const isActionPending =
    updateStatus.isPending || resetAccess.isPending || deleteCompany.isPending

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-4 sm:p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-heading sm:text-2xl">Edit Company Profile</h2>
            <p className="mt-1 text-sm text-text-muted">
              Update company details, subscription, and workspace settings.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-text-muted hover:bg-surface-muted"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={onFormSubmit} className="flex flex-col gap-6" noValidate>
          <CompanyFormSection
            icon={<BuildingSectionIcon />}
            title="Company Information"
            subtitle="Basic details about the organization."
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <CompanyFormField label="Company Name" error={errors.companyName?.message}>
                <input className={companyInputClass} {...register('companyName')} />
              </CompanyFormField>

              <CompanyFormField label="Email Address" error={errors.email?.message}>
                <input className={companyInputClass} type="email" {...register('email')} />
              </CompanyFormField>

              <CompanyFormField label="Phone Number" error={errors.phone?.message}>
                <input className={companyInputClass} {...register('phone')} />
              </CompanyFormField>

              <CompanyFormField label="Starting Date" error={errors.startingDate?.message}>
                <input type="date" className={companyInputClass} {...register('startingDate')} />
              </CompanyFormField>

              <CompanyFormField label="Subscription Plan" error={errors.subscriptionPlan?.message}>
                <CompanySelect {...register('subscriptionPlan')}>
                  {subscriptionPlanOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </CompanySelect>
              </CompanyFormField>

              <CompanyFormField label="Status" error={errors.status?.message}>
                <CompanySelect {...register('status')}>
                  {startAsOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </CompanySelect>
              </CompanyFormField>

              <CompanyFormField label="Admin Full Name" error={errors.adminFullName?.message}>
                <input className={companyInputClass} {...register('adminFullName')} />
              </CompanyFormField>

              <CompanyFormField label="Admin Email">
                <CompanyIconInput icon={<MailIcon />} value={adminEmail} readOnly disabled />
              </CompanyFormField>

              <CompanyFormField label="Users" error={errors.users?.message}>
                <input className={companyInputClass} type="number" min={0} {...register('users')} />
              </CompanyFormField>
            </div>
          </CompanyFormSection>

          <CompanyFormSection
            icon={<ModulesSectionIcon />}
            title="Product access"
            subtitle="Choose which areas this company can use. At least one is required."
          >
            <Controller
              name="enabledHubs"
              control={control}
              render={({ field }) => (
                <CompanyHubsField
                  value={field.value ?? ['people', 'finance', 'work']}
                  onChange={field.onChange}
                  error={errors.enabledHubs?.message}
                />
              )}
            />
          </CompanyFormSection>

          <CompanyFormSection
            icon={<LocationSectionIcon />}
            title="Address Details"
            subtitle="Where the company is physically located."
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <CompanyFormField label="Country" error={errors.country?.message}>
                <CompanySelect {...register('country')}>
                  {countryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </CompanySelect>
              </CompanyFormField>

              <CompanyFormField label="City" error={errors.city?.message}>
                <input className={companyInputClass} {...register('city')} />
              </CompanyFormField>

              <CompanyFormField
                label="Address Line"
                className="md:col-span-2"
                error={errors.addressLine?.message}
              >
                <input className={companyInputClass} {...register('addressLine')} />
              </CompanyFormField>

              <CompanyFormField label="Postal Code" error={errors.postalCode?.message}>
                <input className={companyInputClass} {...register('postalCode')} />
              </CompanyFormField>
            </div>
          </CompanyFormSection>

          <CompanyFormSection
            icon={<BrandingSectionIcon />}
            title="Branding"
            subtitle="Customize how the company appears to users."
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Controller
                name="secondaryColor"
                control={control}
                render={({ field }) => (
                  <ColorField
                    label="Secondary Color"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.secondaryColor?.message}
                  />
                )}
              />
              <Controller
                name="primaryColor"
                control={control}
                render={({ field }) => (
                  <ColorField
                    label="Primary Color"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.primaryColor?.message}
                  />
                )}
              />
            </div>
          </CompanyFormSection>

          <CompanyFormSection
            icon={<SettingsSectionIcon />}
            title="System Settings"
            subtitle="Default preferences for this workspace."
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <CompanyFormField label="Timezone" error={errors.timezone?.message}>
                <CompanySelect {...register('timezone')}>
                  {timezoneOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </CompanySelect>
              </CompanyFormField>

              <CompanyFormField label="Currency" error={errors.currency?.message}>
                <CompanySelect {...register('currency')}>
                  {currencyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </CompanySelect>
              </CompanyFormField>

              <CompanyFormField label="Date Format" error={errors.dateFormat?.message}>
                <CompanySelect {...register('dateFormat')}>
                  {dateFormatOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </CompanySelect>
              </CompanyFormField>
            </div>
          </CompanyFormSection>

          {submitError && (
            <p className="rounded-lg bg-[#fef2f2] px-4 py-3 text-sm text-danger">{submitError}</p>
          )}

          <div className="flex justify-end gap-3">
            <Link
              to={`/companies/${companyId}`}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-surface px-5 text-sm font-semibold text-heading hover:bg-surface-muted"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95 disabled:opacity-70"
            >
              {isSubmitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Card>

      {actionFeedback && (
        <p className="rounded-lg bg-[#f0fdf4] px-4 py-3 text-sm text-success">{actionFeedback}</p>
      )}
      {actionError && (
        <p className="rounded-lg bg-[#fef2f2] px-4 py-3 text-sm text-danger">{actionError}</p>
      )}

      <PlatformActionCards
        variant="company"
        disabled={isActionPending}
        onReset={() => void handleResetAccess()}
        onSuspend={() => void handleSuspend()}
        onDelete={() => void handleDelete()}
      />
    </div>
  )
}
