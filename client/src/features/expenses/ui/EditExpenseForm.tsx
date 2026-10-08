import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useEmployeesList } from '@/features/employees/hooks/useEmployees'
import type { UpdateExpensePayload } from '@/features/expenses/api/expensesApi'
import { uploadExpenseReceipt } from '@/features/expenses/lib/receipt-upload'
import {
  categoryLabels,
  expenseTypeLabels,
  MONTH_OPTIONS,
} from '@/features/expenses/model/expensesData'
import { expenseFormSchema, type ExpenseFormValues } from '@/features/expenses/model/schemas'
import type { Expense } from '@/features/expenses/model/types'
import {
  ExpenseFormCard,
  expenseFormInputClass,
  expenseFormTextareaClass,
  FormField,
} from '@/features/expenses/ui/ExpenseFormCard'
import { FileIcon, PlusIcon, TrashIcon } from '@/features/expenses/ui/icons'
import { useProjectsList } from '@/features/projects/hooks/useProjects'
import { getErrorMessage } from '@/shared/api/errors'
import { SelectField } from '@/shared/ui/SelectField'

type EditExpenseFormProps = {
  expense: Expense
  onSubmit: (values: UpdateExpensePayload) => Promise<void>
  onCancel: () => void
}

export function EditExpenseForm({ expense, onSubmit, onCancel }: EditExpenseFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [receiptRemoved, setReceiptRemoved] = useState(false)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

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
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      title: expense.title,
      expenseType: expense.expenseType ?? 'employee',
      category: expense.category,
      amount: expense.amount,
      date: expense.date,
      employeeId: expense.employeeId ?? '',
      projectId: expense.projectId ?? '',
      billingPeriodMonth: expense.billingPeriodMonth,
      billingPeriodYear: expense.billingPeriodYear,
      eventName: expense.eventName ?? '',
      eventDate: expense.eventDate ?? '',
      status: expense.status,
      description: expense.description,
    },
  })

  const expenseType = watch('expenseType')

  const onFormSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      setUploading(Boolean(receiptFile))
      let receipt: UpdateExpensePayload['receipt']
      if (receiptFile) {
        receipt = await uploadExpenseReceipt(receiptFile)
      } else if (receiptRemoved) {
        receipt = null
      }

      const { status: _status, ...rest } = values
      void _status
      await onSubmit({
        ...rest,
        employeeId: values.employeeId || null,
        projectId: values.projectId || null,
        billingPeriodMonth:
          values.expenseType === 'monthly' ? Number(values.billingPeriodMonth) : null,
        billingPeriodYear:
          values.expenseType === 'monthly' ? Number(values.billingPeriodYear) : null,
        eventName: values.expenseType === 'event' ? values.eventName || null : null,
        eventDate: values.expenseType === 'event' ? values.eventDate || null : null,
        ...(receipt !== undefined ? { receipt } : {}),
      })
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Unable to update expense. Please try again.'))
    } finally {
      setUploading(false)
    }
  })

  const existingReceipt = !receiptRemoved && !receiptFile ? expense.receipt : undefined

  return (
    <form id="edit-expense-form" onSubmit={onFormSubmit}>
      <ExpenseFormCard>
        <FormField label="Expense Title" error={errors.title?.message}>
          <input {...register('title')} className={expenseFormInputClass} />
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Expense Type" error={errors.expenseType?.message}>
            <SelectField {...register('expenseType')} className={expenseFormInputClass}>
              {Object.entries(expenseTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </SelectField>
          </FormField>

          <FormField label="Category" error={errors.category?.message}>
            <SelectField {...register('category')} className={expenseFormInputClass}>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </SelectField>
          </FormField>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Amount" error={errors.amount?.message}>
            <input
              {...register('amount')}
              type="number"
              step="0.01"
              min="0"
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
              <SelectField {...register('employeeId')} className={expenseFormInputClass}>
                <option value="">Select Employee</option>
                {employeeOptions.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </SelectField>
            </FormField>
            <FormField label="Project (optional)" error={errors.projectId?.message}>
              <SelectField {...register('projectId')} className={expenseFormInputClass}>
                <option value="">Select Project</option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name}
                  </option>
                ))}
              </SelectField>
            </FormField>
          </div>
        )}

        {expenseType === 'monthly' && (
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Billing Month" error={errors.billingPeriodMonth?.message}>
              <SelectField {...register('billingPeriodMonth')} className={expenseFormInputClass}>
                {MONTH_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </SelectField>
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
              <input {...register('eventName')} className={expenseFormInputClass} />
            </FormField>
            <FormField label="Event Date (optional)" error={errors.eventDate?.message}>
              <input {...register('eventDate')} type="date" className={expenseFormInputClass} />
            </FormField>
          </div>
        )}

        {(expenseType === 'monthly' || expenseType === 'event' || expenseType === 'other') && (
          <FormField label="Project (optional)" error={errors.projectId?.message}>
            <SelectField {...register('projectId')} className={expenseFormInputClass}>
              <option value="">Select Project</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.name}
                </option>
              ))}
            </SelectField>
          </FormField>
        )}

        <input type="hidden" {...register('status')} />

        <FormField label="Supporting Documents">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/*"
            className="hidden"
            onChange={(e) => {
              setReceiptFile(e.target.files?.[0] ?? null)
              setReceiptRemoved(false)
            }}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {(existingReceipt || receiptFile) && (
              <div className="flex items-center gap-3 rounded-lg border-2 border-dashed border-[#d9e4ef] bg-[#f8fafc] px-4 py-4">
                <FileIcon className="size-8 shrink-0 text-[#1877f2]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-heading">
                    {receiptFile?.name ?? existingReceipt?.filename}
                  </p>
                  <p className="text-xs text-text-muted">
                    {receiptFile
                      ? `${(receiptFile.size / 1024).toFixed(1)} KB`
                      : existingReceipt?.size}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setReceiptRemoved(true)
                    setReceiptFile(null)
                  }}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#dc2626] hover:bg-[#fef2f2]"
                  aria-label="Remove receipt"
                >
                  <TrashIcon />
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex min-h-[80px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#d9e4ef] bg-[#f8fafc] px-4 py-4 text-center hover:border-primary/40 hover:bg-[#f0f7ff]"
            >
              <PlusIcon className="mb-1 text-text-muted" />
              <p className="text-sm font-medium text-heading">Upload More</p>
            </button>
          </div>
        </FormField>

        <FormField label="Description" error={errors.description?.message}>
          <textarea {...register('description')} className={expenseFormTextareaClass} />
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
          {uploading ? 'Uploading…' : isSubmitting ? 'Updating…' : 'Update Expense'}
        </button>
      </div>
    </form>
  )
}
