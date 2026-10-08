import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { leaveTypeStatusLabels } from '@/features/leave/model/leaveData'
import {
  leaveTypeFormSchema,
  type LeaveTypeFormValues,
} from '@/features/leave/model/schemas'
import type { LeaveType } from '@/features/leave/model/types'
import {
  FormField,
  leaveFormInputClass,
  leaveFormTextareaClass,
  LeaveTypeFormCard,
  SegmentedToggle,
} from '@/features/leave/ui/LeaveTypeFormCard'
import { SelectField } from '@/shared/ui/SelectField'

type LeaveTypeFormProps = {
  leaveType?: LeaveType
  submitLabel: string
  onSubmit: (values: LeaveTypeFormValues) => Promise<void>
  onCancel: () => void
}

export function LeaveTypeForm({ leaveType, submitLabel, onSubmit, onCancel }: LeaveTypeFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LeaveTypeFormValues>({
    resolver: zodResolver(leaveTypeFormSchema),
    defaultValues: {
      name: '',
      maxDays: 12,
      unlimited: false,
      description: '',
      carryForward: true,
      paidLeave: true,
      status: 'active',
    },
  })

  const unlimited = watch('unlimited')
  const paidLeave = watch('paidLeave')

  useEffect(() => {
    if (!leaveType) return
    reset({
      name: leaveType.name,
      maxDays: leaveType.maxDays === 'unlimited' ? 12 : leaveType.maxDays,
      unlimited: leaveType.maxDays === 'unlimited',
      description: leaveType.description,
      carryForward: leaveType.paidLeave ? leaveType.carryForward : false,
      paidLeave: leaveType.paidLeave,
      status: leaveType.status,
    })
  }, [leaveType, reset])

  useEffect(() => {
    if (!paidLeave) {
      setValue('carryForward', false)
    }
  }, [paidLeave, setValue])

  const onFormSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      await onSubmit({
        ...values,
        carryForward: values.paidLeave ? values.carryForward : false,
      })
    } catch {
      setSubmitError('Unable to save leave type. Please try again.')
    }
  })

  return (
    <>
      <LeaveTypeFormCard>
        <form id="leave-type-form" onSubmit={onFormSubmit}>
          {submitError && (
            <p className="mb-4 rounded-lg bg-[#fef2f2] px-4 py-3 text-sm text-danger">{submitError}</p>
          )}

          <FormField label="Leave Type Name" error={errors.name?.message}>
            <input
              {...register('name')}
              placeholder="e.g. Annual Vacation, Sick Leave"
              className={leaveFormInputClass}
            />
          </FormField>

          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <FormField label="Maximum Days Allowed" error={errors.maxDays?.message}>
              <input
                type="number"
                {...register('maxDays')}
                disabled={unlimited}
                className={leaveFormInputClass}
              />
            </FormField>

            <Controller
              name="unlimited"
              control={control}
              render={({ field }) => (
                <SegmentedToggle
                  title="Unlimited Days"
                  description="No cap on days allowed"
                  value={field.value ?? false}
                  onChange={field.onChange}
                  options={{ trueLabel: 'Yes', falseLabel: 'No' }}
                />
              )}
            />
          </div>

          <div className="mb-5 grid min-w-0 gap-4 sm:grid-cols-2">
            <FormField label="Status" error={errors.status?.message}>
              <SelectField {...register('status')} className="h-11 rounded-lg text-sm">
                {Object.entries(leaveTypeStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </SelectField>
            </FormField>
          </div>

          <div className="mb-5 grid min-w-0 gap-4 sm:grid-cols-2">
            <Controller
              name="paidLeave"
              control={control}
              render={({ field }) => (
                <SegmentedToggle
                  title="Paid Leave"
                  description="Unpaid days are deducted from salary when payroll is generated"
                  value={field.value}
                  onChange={field.onChange}
                  options={{ trueLabel: 'Paid', falseLabel: 'Unpaid' }}
                />
              )}
            />

            <Controller
              name="carryForward"
              control={control}
              render={({ field }) => (
                <SegmentedToggle
                  title="Carry Forward"
                  description={
                    paidLeave
                      ? 'Yes = unused days roll into next year’s balance; No = eligible for year-end encashment'
                      : 'Not available for unpaid leave (no carry forward or encashment)'
                  }
                  value={paidLeave ? field.value : false}
                  onChange={field.onChange}
                  disabled={!paidLeave}
                  options={{ trueLabel: 'Yes', falseLabel: 'No' }}
                />
              )}
            />
          </div>

          <FormField label="Description" error={errors.description?.message}>
            <textarea
              {...register('description')}
              placeholder="Brief explanation of this leave category..."
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
          form="leave-type-form"
          disabled={isSubmitting}
          className="h-11 w-full rounded-lg bg-primary px-6 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95 disabled:opacity-70 sm:w-auto"
        >
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </>
  )
}
