import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useEmployeesList } from '@/features/employees/hooks/useEmployees'
import type { CreateExpensePayload } from '@/features/expenses/api/expensesApi'
import { uploadExpenseReceipt } from '@/features/expenses/lib/receipt-upload'
import {
  categoryLabels,
  expenseTypeLabels,
  MONTH_OPTIONS,
} from '@/features/expenses/model/expensesData'
import { expenseFormSchema, type ExpenseFormValues } from '@/features/expenses/model/schemas'
import {
  ExpenseFormCard,
  expenseFormInputClass,
  expenseFormTextareaClass,
  FormField,
} from '@/features/expenses/ui/ExpenseFormCard'
import { ExpenseStatusToggle } from '@/features/expenses/ui/ExpenseStatusToggle'
import { UploadIcon } from '@/features/expenses/ui/icons'
import { useProjectsList } from '@/features/projects/hooks/useProjects'
import { getErrorMessage } from '@/shared/api/errors'
import { ChevronSelect } from '@/shared/ui/ChevronSelect'

type CreateExpenseFormProps = {
  onSubmit: (values: CreateExpensePayload) => Promise<void>
  onCancel: () => void
}

export function CreateExpenseForm({ onSubmit, onCancel }: CreateExpenseFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const now = new Date()

  const { data: employeesResult } = useEmployeesList({ page: 1, limit: 100 })
  const { data: projects = [] } = useProjectsList({ limit: 100 })

  const employeeOptions = useMemo(
    () =>
      (employeesResult?.employees ?? []).map((emp) => ({
        id: emp.id,
        name: emp.fullName,
      })),
    [employeesResult],
  )

  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      title: '',
      expenseType: 'employee',
      category: 'equipment',
      amount: 0,
      date: now.toISOString().slice(0, 10),
      employeeId: '',
      projectId: '',
      billingPeriodMonth: now.getMonth() + 1,
      billingPeriodYear: now.getFullYear(),
      eventName: '',
      eventDate: '',
      status: 'pending',
      description: '',
    },
  })

  const expenseType = watch('expenseType')

  const onFormSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      setUploading(Boolean(receiptFile))
      const receipt = receiptFile ? await uploadExpenseReceipt(receiptFile) : undefined
      await onSubmit({
        ...values,
        employeeId: values.employeeId || undefined,
        projectId: values.projectId || undefined,
        billingPeriodMonth:
          values.expenseType === 'monthly' ? Number(values.billingPeriodMonth) : undefined,
        billingPeriodYear:
          values.expenseType === 'monthly' ? Number(values.billingPeriodYear) : undefined,
        eventName: values.expenseType === 'event' ? values.eventName : undefined,
        eventDate: values.expenseType === 'event' ? values.eventDate || undefined : undefined,
        ...(receipt ? { receipt } : {}),
      })
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Unable to create expense. Please try again.'))
    } finally {
      setUploading(false)
    }
  })

  return (
    <form id="create-expense-form" onSubmit={onFormSubmit}>
      <ExpenseFormCard>
        <FormField label="Expense Title" error={errors.title?.message}>
          <input
            {...register('title')}
            placeholder="e.g. Client Dinner in Lahore"
            className={expenseFormInputClass}
          />
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Expense Type" error={errors.expenseType?.message}>
            <ChevronSelect {...register('expenseType')} className={expenseFormInputClass}>
              {Object.entries(expenseTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </ChevronSelect>
          </FormField>

          <FormField label="Category" error={errors.category?.message}>
            <ChevronSelect {...register('category')} className={expenseFormInputClass}>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </ChevronSelect>
          </FormField>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Amount" error={errors.amount?.message}>
            <input
              {...register('amount')}
              type="number"
              step="1"
              min="0"
              placeholder="$:00.00"
              className={expenseFormInputClass}
            />
          </FormField>

          <FormField label="Date" error={errors.date?.message}>
            <input {...register('date')} type="date" className={expenseFormInputClass} />
          </FormField>
        </div>

        {expenseType === 'employee' && (
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Employee" error={errors.employeeId?.message}>
              <ChevronSelect {...register('employeeId')} className={expenseFormInputClass}>
                <option value="">Select Employee</option>
                {employeeOptions.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </ChevronSelect>
            </FormField>

            <FormField label="Project (optional)" error={errors.projectId?.message}>
              <ChevronSelect {...register('projectId')} className={expenseFormInputClass}>
                <option value="">Select Project</option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name}
                  </option>
                ))}
              </ChevronSelect>
            </FormField>
          </div>
        )}

        {expenseType === 'monthly' && (
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Billing Month" error={errors.billingPeriodMonth?.message}>
              <ChevronSelect {...register('billingPeriodMonth')} className={expenseFormInputClass}>
                {MONTH_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </ChevronSelect>
            </FormField>
            <FormField label="Billing Year" error={errors.billingPeriodYear?.message}>
              <input
                {...register('billingPeriodYear')}
                type="number"
                min={2000}
                max={2100}
                className={expenseFormInputClass}
              />
            </FormField>
          </div>
        )}

        {expenseType === 'event' && (
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Event Name" error={errors.eventName?.message}>
              <input
                {...register('eventName')}
                placeholder="e.g. Annual Kickoff"
                className={expenseFormInputClass}
              />
            </FormField>
            <FormField label="Event Date (optional)" error={errors.eventDate?.message}>
              <input {...register('eventDate')} type="date" className={expenseFormInputClass} />
            </FormField>
          </div>
        )}

        {(expenseType === 'monthly' || expenseType === 'event' || expenseType === 'other') && (
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Project (optional)" error={errors.projectId?.message}>
              <ChevronSelect {...register('projectId')} className={expenseFormInputClass}>
                <option value="">Select Project</option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name}
                  </option>
                ))}
              </ChevronSelect>
            </FormField>
            <FormField label="Status" error={errors.status?.message}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <ExpenseStatusToggle value={field.value} onChange={field.onChange} />
                )}
              />
            </FormField>
          </div>
        )}

        {expenseType === 'employee' && (
          <FormField label="Status" error={errors.status?.message}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <ExpenseStatusToggle value={field.value} onChange={field.onChange} />
              )}
            />
          </FormField>
        )}

        <FormField label="Upload Receipt">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/*"
            className="hidden"
            onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex min-h-[140px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#d9e4ef] bg-[#f8fafc] px-6 py-8 text-center transition-colors hover:border-primary/40 hover:bg-[#f0f7ff]"
          >
            <UploadIcon className="mb-3 text-text-muted" />
            <p className="text-sm font-medium text-heading">
              {receiptFile ? receiptFile.name : 'Click to upload or drag & drop'}
            </p>
            <p className="mt-1 text-xs text-text-muted">PDF, PNG, JPG (10MB)</p>
          </button>
        </FormField>

        <FormField label="Description" error={errors.description?.message}>
          <textarea
            {...register('description')}
            placeholder="Provide additional details about the expense"
            className={expenseFormTextareaClass}
          />
        </FormField>

        {submitError && <p className="text-sm text-danger">{submitError}</p>}
      </ExpenseFormCard>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting || uploading}
          className="h-10 rounded-xl border border-[#e2e8f0] bg-surface px-6 text-sm font-semibold text-heading hover:bg-[#f8fafc]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || uploading}
          className="h-10 rounded-xl bg-primary px-10 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95 disabled:opacity-70"
        >
          {uploading ? 'Uploading…' : isSubmitting ? 'Creating…' : 'Create Expense'}
        </button>
      </div>
    </form>
  )
}
