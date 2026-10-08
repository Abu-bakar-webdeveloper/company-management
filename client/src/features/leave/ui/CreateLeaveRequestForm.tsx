import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  leaveRequestFormSchema,
  type LeaveRequestFormValues,
} from '@/features/leave/model/schemas'
import type { LeaveType } from '@/features/leave/model/types'
import { LeaveTypeIconBadge } from '@/features/leave/ui/icons'
import {
  FormField,
  leaveFormInputClass,
  leaveFormTextareaClass,
  LeaveTypeFormCard,
} from '@/features/leave/ui/LeaveTypeFormCard'
import { SelectField } from '@/shared/ui/SelectField'

type CreateLeaveRequestFormProps = {
  leaveTypes: LeaveType[]
  submitLabel?: string
  onSubmit: (values: LeaveRequestFormValues) => Promise<void>
  onCancel: () => void
}

export function CreateLeaveRequestForm({
  leaveTypes,
  submitLabel = 'Submit Request',
  onSubmit,
  onCancel,
}: CreateLeaveRequestFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const activeTypes = leaveTypes.filter((t) => t.status === 'active')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LeaveRequestFormValues>({
    resolver: zodResolver(leaveRequestFormSchema),
    defaultValues: {
      leaveTypeId: '',
      reason: '',
      startDate: '',
      endDate: '',
    },
  })

  const selectedTypeId = watch('leaveTypeId')
  const selectedType = activeTypes.find((t) => t.id === selectedTypeId)

  const onFormSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      await onSubmit(values)
    } catch {
      setSubmitError('Unable to submit leave request. Please check your balance and try again.')
    }
  })

  return (
    <>
      <LeaveTypeFormCard>
        <form id="leave-request-form" onSubmit={onFormSubmit}>
          {submitError && (
            <p className="mb-4 rounded-lg bg-[#fef2f2] px-4 py-3 text-sm text-danger">{submitError}</p>
          )}

          <FormField label="Leave Type" error={errors.leaveTypeId?.message}>
            <SelectField {...register('leaveTypeId')} className="h-11 rounded-lg text-sm">
              <option value="">Select leave type</option>
              {activeTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                  {type.maxDays === 'unlimited' ? ' (Unlimited)' : ` (${type.maxDays} days max)`}
                </option>
              ))}
            </SelectField>
          </FormField>

          {selectedType && (
            <div className="mb-5 flex items-center gap-3 rounded-lg bg-[#f8fafc] p-4">
              <LeaveTypeIconBadge icon={selectedType.icon} />
              <div>
                <p className="text-sm font-semibold text-heading">{selectedType.name}</p>
                <p className="text-xs text-text-muted">{selectedType.description}</p>
              </div>
            </div>
          )}

          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <FormField label="Start Date" error={errors.startDate?.message}>
              <input type="date" {...register('startDate')} className={leaveFormInputClass} />
            </FormField>
            <FormField label="End Date" error={errors.endDate?.message}>
              <input type="date" {...register('endDate')} className={leaveFormInputClass} />
            </FormField>
          </div>

          <FormField label="Reason for Leave" error={errors.reason?.message}>
            <textarea
              {...register('reason')}
              placeholder="Explain the reason for your leave request..."
              className={leaveFormTextareaClass}
            />
          </FormField>
        </form>
      </LeaveTypeFormCard>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="h-11 w-full rounded-lg border border-[#e2e8f0] bg-surface px-6 text-sm font-semibold text-heading hover:bg-[#f8fafc] sm:w-auto"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="leave-request-form"
          disabled={isSubmitting}
          className="h-11 w-full rounded-lg bg-primary px-6 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95 disabled:opacity-70 sm:w-auto"
        >
          {isSubmitting ? 'Submitting…' : submitLabel}
        </button>
      </div>
    </>
  )
}
