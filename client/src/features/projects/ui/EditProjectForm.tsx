import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
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
import type { Project } from '@/features/projects/model/types'
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

type EditProjectFormProps = {
  project: Project
  onSubmit: (values: ProjectFormValues) => Promise<void>
  onCancel: () => void
}

function projectToFormValues(project: Project): ProjectFormValues {
  return {
    name: project.name,
    description: project.description,
    managerId: project.managerId,
    teamMemberIds: project.team.map((member) => member.id),
    startDate: project.startDate,
    endDate: project.endDate,
    priority: project.priority,
    status: project.status,
    clientMode: project.clientId ? 'existing' : 'company',
    clientId: project.clientId ?? '',
    newClientName: '',
    newClientEmail: '',
    newClientPhone: '',
    source: project.source ?? '',
    sourceNote: project.sourceNote ?? '',
    contractValue: project.contractValue != null ? String(project.contractValue) : '',
  }
}

export function EditProjectForm({ project, onSubmit, onCancel }: EditProjectFormProps) {
  const { data: managers = [], isLoading: managersLoading } = useProjectManagerOptions()
  const { data: clients = [], isLoading: clientsLoading } = useClientOptions()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const managerChoices = (() => {
    const list = [...managers]
    if (
      project.managerId &&
      !list.some((manager) => manager.id === project.managerId)
    ) {
      list.unshift({
        id: project.managerId,
        email: '',
        fullName: project.managerName,
        role: 'manager',
        status: 'active',
        companyId: null,
      })
    }
    return list
  })()

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: projectToFormValues(project),
  })

  useEffect(() => {
    reset(projectToFormValues(project))
  }, [project, reset])

  const managerId = watch('managerId')
  const source = watch('source')
  const clientMode = watch('clientMode')

  const onFormSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      await onSubmit(values)
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to update project. Please try again.')
      setSubmitError(message)
      toast.error(message)
    }
  })

  return (
    <ProjectFormCard
      title="Edit Project"
      subtitle="Update project details and settings"
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
            form="edit-project-form"
            disabled={isSubmitting}
            className="h-10 rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95 disabled:opacity-70"
          >
            {isSubmitting ? 'Updating…' : 'Update Project'}
          </button>
        </>
      }
    >
      <form id="edit-project-form" onSubmit={onFormSubmit} className="space-y-2">
        {submitError && (
          <p className="mb-4 rounded-lg bg-[#fef2f2] px-4 py-3 text-sm text-danger">{submitError}</p>
        )}

        <FormSection title="Basic Information">
          <FormField label="Project Name" error={errors.name?.message}>
            <input {...register('name')} className={projectFormInputClass} />
          </FormField>
          <FormField label="Description" error={errors.description?.message}>
            <textarea {...register('description')} className={projectFormTextareaClass} />
          </FormField>
        </FormSection>

        <FormSection title="Client">
          <div className="mb-4 flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-heading">
              <input
                type="radio"
                value="existing"
                checked={clientMode === 'existing'}
                onChange={() => setValue('clientMode', 'existing')}
                className="size-4 accent-primary"
              />
              Existing client
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-medium text-heading">
              <input
                type="radio"
                value="company"
                checked={clientMode === 'company'}
                onChange={() => {
                  setValue('clientMode', 'company')
                  setValue('clientId', '')
                }}
                className="size-4 accent-primary"
              />
              Company-owned
            </label>
          </div>

          {clientMode === 'existing' ? (
            <FormField label="Client" error={errors.clientId?.message}>
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
          ) : (
            <p className="mb-4 rounded-lg bg-[#f8fafc] px-4 py-3 text-sm text-text-muted">
              This project is internal to your company and is not linked to an external client.
            </p>
          )}

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
                <SelectField {...register('managerId')} className="h-11 rounded-lg text-sm">
                  <option value="" disabled>
                    {managersLoading ? 'Loading managers…' : 'Select Manager'}
                  </option>
                  {managerChoices.map((m) => (
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
