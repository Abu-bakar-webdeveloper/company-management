import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  clientFormSchema,
  type ClientFormValues,
} from '@/features/clients/model/schemas'
import {
  FormField,
  FormSection,
  ProjectFormCard,
  projectFormInputClass,
  projectFormTextareaClass,
} from '@/features/projects/ui/ProjectFormCard'
import { getErrorMessage } from '@/shared/api/errors'
import { SelectField } from '@/shared/ui/SelectField'

type ClientFormProps = {
  title: string
  subtitle: string
  defaultValues?: Partial<ClientFormValues>
  submitLabel: string
  onSubmit: (values: ClientFormValues) => Promise<void>
  onCancel: () => void
}

const emptyDefaults: ClientFormValues = {
  name: '',
  email: '',
  phone: '',
  website: '',
  industry: '',
  address: {
    country: '',
    city: '',
    addressLine: '',
    postalCode: '',
  },
  primaryContact: {
    name: '',
    email: '',
    phone: '',
  },
  status: 'active',
  notes: '',
}

export function ClientForm({
  title,
  subtitle,
  defaultValues,
  submitLabel,
  onSubmit,
  onCancel,
}: ClientFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: { ...emptyDefaults, ...defaultValues },
  })

  const onFormSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      await onSubmit(values)
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to save client. Please try again.')
      setSubmitError(message)
      toast.error(message)
    }
  })

  return (
    <ProjectFormCard
      title={title}
      subtitle={subtitle}
      onClose={onCancel}
      footer={
        <>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-10 rounded-xl border border-[#e2e8f0] bg-surface px-6 text-sm font-semibold text-heading hover:bg-[#f8fafc]"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="client-form"
            disabled={isSubmitting}
            className="h-10 rounded-xl bg-primary px-10 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95 disabled:opacity-70"
          >
            {isSubmitting ? 'Saving…' : submitLabel}
          </button>
        </>
      }
    >
      <form id="client-form" onSubmit={onFormSubmit} className="space-y-2">
        {submitError && (
          <p className="mb-4 rounded-lg bg-[#fef2f2] px-4 py-3 text-sm text-danger">
            {submitError}
          </p>
        )}

        <FormSection title="Basic Information">
          <FormField label="Client Name" error={errors.name?.message}>
            <input
              {...register('name')}
              placeholder="e.g. Acme Corporation"
              className={projectFormInputClass}
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Email" error={errors.email?.message}>
              <input
                type="email"
                {...register('email')}
                placeholder="contact@acme.com"
                className={projectFormInputClass}
              />
            </FormField>
            <FormField label="Phone" error={errors.phone?.message}>
              <input
                {...register('phone')}
                placeholder="+1 555 0100"
                className={projectFormInputClass}
              />
            </FormField>
            <FormField label="Website" error={errors.website?.message}>
              <input
                {...register('website')}
                placeholder="https://acme.com"
                className={projectFormInputClass}
              />
            </FormField>
            <FormField label="Industry" error={errors.industry?.message}>
              <input
                {...register('industry')}
                placeholder="Technology"
                className={projectFormInputClass}
              />
            </FormField>
            <FormField label="Status" error={errors.status?.message}>
              <SelectField {...register('status')} className="h-11 rounded-lg text-sm">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </SelectField>
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Primary Contact">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Contact Name">
              <input
                {...register('primaryContact.name')}
                placeholder="Jane Doe"
                className={projectFormInputClass}
              />
            </FormField>
            <FormField label="Contact Phone">
              <input
                {...register('primaryContact.phone')}
                placeholder="+1 555 0101"
                className={projectFormInputClass}
              />
            </FormField>
            <FormField label="Contact Email" error={errors.primaryContact?.email?.message}>
              <input
                type="email"
                {...register('primaryContact.email')}
                placeholder="jane@acme.com"
                className={projectFormInputClass}
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Address">
          <FormField label="Address Line">
            <input
              {...register('address.addressLine')}
              placeholder="123 Main Street"
              className={projectFormInputClass}
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="City">
              <input {...register('address.city')} className={projectFormInputClass} />
            </FormField>
            <FormField label="Country">
              <input {...register('address.country')} className={projectFormInputClass} />
            </FormField>
            <FormField label="Postal Code">
              <input {...register('address.postalCode')} className={projectFormInputClass} />
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Notes">
          <FormField label="Internal Notes">
            <textarea
              {...register('notes')}
              placeholder="Optional notes about this client..."
              className={projectFormTextareaClass}
            />
          </FormField>
        </FormSection>
      </form>
    </ProjectFormCard>
  )
}
