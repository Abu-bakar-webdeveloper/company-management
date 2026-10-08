import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  companyFormDefaults,
  countryOptions,
  currencyOptions,
  dateFormatOptions,
  startAsOptions,
  subscriptionPlanOptions,
  timezoneOptions,
} from '@/features/platform/model/companiesFormData'
import { companyFormSchema, type CompanyFormValues } from '@/features/platform/model/schemas'
import {
  CompanyFormField,
  companyInputClass,
} from '@/features/platform/ui/CompanyFormField'
import {
  ColorField,
  CompanyIconInput,
  CompanySelect,
  LogoUploadField,
} from '@/features/platform/ui/CompanyFormControls'
import { CompanyFormSection } from '@/features/platform/ui/CompanyFormSection'
import {
  BrandingSectionIcon,
  BuildingSectionIcon,
  LocationSectionIcon,
  MailIcon,
  ModulesSectionIcon,
  SettingsSectionIcon,
} from '@/features/platform/ui/icons'
import { CompanyHubsField } from '@/features/platform/ui/CompanyHubsField'
import { getErrorMessage } from '@/shared/api/errors'

type AddCompanyFormProps = {
  onSubmit: (values: CompanyFormValues) => Promise<void>
  onCancel: () => void
}

export function AddCompanyForm({ onSubmit, onCancel }: AddCompanyFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: companyFormDefaults,
  })

  const onFormSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      await onSubmit(values)
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Unable to create company. Please try again.'))
    }
  })

  return (
    <form onSubmit={onFormSubmit} className="flex flex-col gap-6" noValidate>
      <CompanyFormSection
        icon={<BuildingSectionIcon />}
        title="Add Company"
        subtitle="Basic details about your organization."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <CompanyFormField label="Company Name" error={errors.companyName?.message}>
            <input
              className={companyInputClass}
              placeholder="Your Company Name"
              {...register('companyName')}
            />
          </CompanyFormField>

          <CompanyFormField label="Email Address" error={errors.email?.message}>
            <input
              className={companyInputClass}
              placeholder="info@company.com"
              type="email"
              {...register('email')}
            />
          </CompanyFormField>

          <CompanyFormField label="Phone Number" error={errors.phone?.message}>
            <input
              className={companyInputClass}
              placeholder="+92 300 1234567"
              {...register('phone')}
            />
          </CompanyFormField>

          <CompanyFormField label="Starting Date" error={errors.startingDate?.message}>
            <input
              type="date"
              className={companyInputClass}
              {...register('startingDate')}
            />
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

          <CompanyFormField label="Start As" error={errors.startAs?.message}>
            <CompanySelect {...register('startAs')}>
              {startAsOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </CompanySelect>
          </CompanyFormField>

          <CompanyFormField label="Admin Full Name" error={errors.adminFullName?.message}>
            <input
              className={companyInputClass}
              placeholder="e.g. John Doe"
              {...register('adminFullName')}
            />
          </CompanyFormField>

          <CompanyFormField label="Admin Email Address" error={errors.adminEmail?.message}>
            <CompanyIconInput
              icon={<MailIcon />}
              placeholder="john.doe@company.com"
              type="email"
              {...register('adminEmail')}
            />
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
        subtitle="Where your company is physically located."
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
            <input className={companyInputClass} placeholder="Your City" {...register('city')} />
          </CompanyFormField>

          <CompanyFormField label="Address Line" className="md:col-span-2" error={errors.addressLine?.message}>
            <input
              className={companyInputClass}
              placeholder="Enter street address ..."
              {...register('addressLine')}
            />
          </CompanyFormField>

          <CompanyFormField label="Postal Code" error={errors.postalCode?.message}>
            <input className={companyInputClass} placeholder="00000" {...register('postalCode')} />
          </CompanyFormField>
        </div>
      </CompanyFormSection>

      <CompanyFormSection
        icon={<BrandingSectionIcon />}
        title="Branding"
        subtitle="Customize how your company appears to users."
      >
        <div className="flex flex-col gap-5">
          <Controller
            name="logo"
            control={control}
            render={({ field }) => (
              <LogoUploadField
                value={field.value}
                onChange={field.onChange}
                error={errors.logo?.message}
              />
            )}
          />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Controller
              name="secondaryColor"
              control={control}
              render={({ field: { value, onChange } }) => (
                <ColorField
                  label="Secondary Color"
                  value={value ?? '#136DEC'}
                  onChange={onChange}
                  error={errors.secondaryColor?.message}
                />
              )}
            />
            <Controller
              name="primaryColor"
              control={control}
              render={({ field: { value, onChange } }) => (
                <ColorField
                  label="Primary Color"
                  value={value ?? '#00284F'}
                  onChange={onChange}
                  error={errors.primaryColor?.message}
                />
              )}
            />
          </div>
        </div>
      </CompanyFormSection>

      <CompanyFormSection
        icon={<SettingsSectionIcon />}
        title="System Settings"
        subtitle="System default preferences for your workspace."
        footer={
          <p className="text-sm text-text-muted">Settings apply to all users in this workspace.</p>
        }
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

      <div className="flex flex-wrap justify-end gap-3 pb-4">
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
          disabled={isSubmitting}
          className="h-11 rounded-lg bg-primary px-6 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95 disabled:opacity-70"
        >
          {isSubmitting ? 'Creating…' : 'Create Company'}
        </button>
      </div>
    </form>
  )
}
