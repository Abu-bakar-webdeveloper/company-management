import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useClientOptions } from '@/features/clients/hooks/useClients'
import { useProjectManagerOptions } from '@/features/projects/hooks/useProjects'
import { priorityLabels, statusLabels } from '@/features/projects/model/projectsData'
import {
  projectFormSchema,
  projectSourceLabels,
  type ProjectFormValues,
} from '@/features/projects/model/schemas'
import {
  FormField,
  FormSection,
  ProjectFormCard,
  projectFormInputClass,
  projectFormTextareaClass,
} from '@/features/projects/ui/ProjectFormCard'
import { TeamMemberPicker } from '@/features/projects/ui/TeamMemberPicker'
import { getErrorMessage } from '@/shared/api/errors'
import { SelectField } from '@/shared/ui/SelectField'
import { cn } from '@/shared/lib/cn'

type CreateProjectFormProps = {
  onSubmit: (values: ProjectFormValues) => Promise<void>
  onCancel: () => void
}

export function CreateProjectForm({ onSubmit, onCancel }: CreateProjectFormProps) {
  const { data: managers = [], isLoading: managersLoading } = useProjectManagerOptions()
  const { data: clients = [], isLoading: clientsLoading } = useClientOptions()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: '',
      description: '',
      managerId: '',
      teamMemberIds: [],
      startDate: '',
      endDate: '',
      priority: 'medium',
      status: 'in_progress',
      clientMode: 'existing',
      clientId: '',
      newClientName: '',
      newClientEmail: '',
      newClientPhone: '',
      source: '',
      sourceNote: '',
      contractValue: '',
    },
  })

  const managerId = watch('managerId')
  const clientMode = watch('clientMode')
  const source = watch('source')

  const onFormSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      await onSubmit(values)
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to create project. Please try again.')
      setSubmitError(message)
      toast.error(message)
    }
  })

  return (
    <ProjectFormCard
      title="Create New Project"
      subtitle="Set up a new workspace for your team"
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
            form="create-project-form"
            disabled={isSubmitting}
            className="h-10 rounded-xl bg-primary px-10 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95 disabled:opacity-70"
          >
            {isSubmitting ? 'Creating…' : 'Create Project'}
          </button>
        </>
      }
    >
      <form id="create-project-form" onSubmit={onFormSubmit} className="space-y-2">
        {submitError && (
          <p className="mb-4 rounded-lg bg-[#fef2f2] px-4 py-3 text-sm text-danger">{submitError}</p>
        )}

        <FormSection title="Basic Information">
          <FormField label="Project Name" error={errors.name?.message}>
            <input
              {...register('name')}
              placeholder="e.g. Q3 Marketing Campaign"
              className={projectFormInputClass}
            />
          </FormField>
          <FormField label="Description" error={errors.description?.message}>
            <textarea
              {...register('description')}
              placeholder="Briefly describe the project goals and scope..."
              className={projectFormTextareaClass}
            />
          </FormField>
        </FormSection>

        <FormSection title="Client">
          <div className="mb-4 flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-heading">
              <input
                type="radio"
                value="existing"
                checked={clientMode === 'existing'}
                onChange={() => {
                  setValue('clientMode', 'existing')
                  setValue('clientId', '')
                }}
                className="size-4 accent-primary"
              />
              Existing client
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-medium text-heading">
              <input
                type="radio"
                value="new"
                checked={clientMode === 'new'}
                onChange={() => {
                  setValue('clientMode', 'new')
                  setValue('clientId', '')
                }}
                className="size-4 accent-primary"
              />
              New client
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-medium text-heading">
              <input
                type="radio"
                value="company"
                checked={clientMode === 'company'}
                onChange={() => {
                  setValue('clientMode', 'company')
                  setValue('clientId', '')
                  setValue('newClientName', '')
                  setValue('newClientEmail', '')
                  setValue('newClientPhone', '')
                }}
                className="size-4 accent-primary"
              />
              Company-owned
            </label>
          </div>

          {clientMode === 'existing' ? (
            <FormField label="Select client" error={errors.clientId?.message}>
              <div className="relative">
                <SelectField {...register('clientId')} className="h-11 rounded-lg text-sm">
                  <option value="">
                    {clientsLoading ? 'Loading clients…' : 'Select a client'}
                  </option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.clientCode})
                    </option>
                  ))}
                </SelectField>
              </div>
            </FormField>
          ) : null}

          {clientMode === 'new' ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label="Client name" error={errors.newClientName?.message}>
                <input
                  {...register('newClientName')}
                  placeholder="Acme Corporation"
                  className={projectFormInputClass}
                />
              </FormField>
              <FormField label="Email" error={errors.newClientEmail?.message}>
                <input
                  type="email"
                  {...register('newClientEmail')}
                  placeholder="contact@acme.com"
                  className={projectFormInputClass}
                />
              </FormField>
              <FormField label="Phone" error={errors.newClientPhone?.message}>
                <input
                  {...register('newClientPhone')}
                  placeholder="+1 555 0100"
                  className={projectFormInputClass}
                />
              </FormField>
            </div>
          ) : null}

          {clientMode === 'company' ? (
            <p className="mb-4 rounded-lg bg-[#f8fafc] px-4 py-3 text-sm text-text-muted">
              This project is internal to your company and will not be linked to an external
              client.
            </p>
          ) : null}

          <div className={cn('mt-4 grid gap-4 sm:grid-cols-2')}>
            <FormField label="Source" error={errors.source?.message}>
              <div className="relative">
                <SelectField {...register('source')} className="h-11 rounded-lg text-sm">
                  <option value="">Select source (optional)</option>
                  {Object.entries(projectSourceLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </SelectField>
              </div>
            </FormField>
            <FormField label="Contract value" error={errors.contractValue?.message}>
              <input
                type="number"
                min={0}
                step="0.01"
                {...register('contractValue')}
                placeholder="0"
                className={projectFormInputClass}
              />
            </FormField>
            {(source === 'other' || source === 'referral') && (
              <FormField label="Source note" className="sm:col-span-2">
                <input
                  {...register('sourceNote')}
                  placeholder="Optional details"
                  className={projectFormInputClass}
                />
              </FormField>
            )}
          </div>
        </FormSection>

        <FormSection title="Team & Leadership">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Project Manager" error={errors.managerId?.message}>
              <div className="relative">
                <SelectField
                  {...register('managerId')}
                  className="h-11 rounded-lg text-sm"
                  defaultValue=""
                >
                  <option value="" disabled>
                    {managersLoading ? 'Loading managers…' : 'Select Manager'}
                  </option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName}
                    </option>
                  ))}
                </SelectField>
              </div>
            </FormField>
            <FormField label="Team Members">
              <Controller
                name="teamMemberIds"
                control={control}
                render={({ field }) => (
                  <TeamMemberPicker
                    value={field.value}
                    onChange={field.onChange}
                    excludeIds={managerId ? [managerId] : []}
                  />
                )}
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Timeline & Status">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Start Date" error={errors.startDate?.message}>
              <input type="date" {...register('startDate')} className={projectFormInputClass} />
            </FormField>
            <FormField label="Deadline" error={errors.endDate?.message}>
              <input type="date" {...register('endDate')} className={projectFormInputClass} />
            </FormField>
            <FormField label="Priority" error={errors.priority?.message}>
              <div className="relative">
                <SelectField {...register('priority')} className="h-11 rounded-lg text-sm">
                  {Object.entries(priorityLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label.replace(' Priority', '')}
                    </option>
                  ))}
                </SelectField>
              </div>
            </FormField>
            <FormField label="Status" error={errors.status?.message}>
              <div className="relative">
                <SelectField {...register('status')} className="h-11 rounded-lg text-sm">
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </SelectField>
              </div>
            </FormField>
          </div>
        </FormSection>
      </form>
    </ProjectFormCard>
  )
}
