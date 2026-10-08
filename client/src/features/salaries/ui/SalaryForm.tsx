import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useEmployeesList } from '@/features/employees/hooks/useEmployees'
import { expensesApi } from '@/features/expenses/api/expensesApi'
import { salariesApi } from '@/features/salaries/api/salariesApi'
import {
  emptyDeductions,
  emptyEarnings,
  MONTH_OPTIONS,
  statusLabels,
} from '@/features/salaries/model/salariesData'
import { salaryFormSchema, type SalaryFormValues } from '@/features/salaries/model/schemas'
import type { Salary } from '@/features/salaries/model/types'
import { formatCurrency } from '@/features/salaries/lib/salary-utils'
import {
  ExpenseFormCard,
  expenseFormInputClass,
  expenseFormTextareaClass,
  FormField,
} from '@/features/expenses/ui/ExpenseFormCard'
import { ApiError, getErrorMessage } from '@/shared/api/errors'
import { Checkbox } from '@/shared/ui/Checkbox'
import { ChevronSelect } from '@/shared/ui/ChevronSelect'

type SalaryFormProps = {
  mode: 'create' | 'edit'
  initial?: Salary
  onSubmit: (values: SalaryFormValues) => Promise<void>
  onCancel: () => void
}

const EARNING_FIELDS: { key: keyof SalaryFormValues['earnings']; label: string }[] = [
  { key: 'basic', label: 'Basic' },
  { key: 'hra', label: 'HRA' },
  { key: 'utilityAllowance', label: 'Utility Allowance' },
  { key: 'conveyanceAllowance', label: 'Conveyance Allowance' },
  { key: 'reimburse', label: 'Reimburse' },
  { key: 'overTime', label: 'Over Time' },
  { key: 'bonus', label: 'Bonus' },
  { key: 'loanIssued', label: 'Loan Issued' },
  { key: 'leaveEncashment', label: 'Leave Encashment' },
]

const DEDUCTION_FIELDS: { key: keyof SalaryFormValues['deductions']; label: string }[] = [
  { key: 'leave', label: 'Leave' },
  { key: 'loan', label: 'Loan' },
  { key: 'providentFund', label: 'Provident Fund' },
  { key: 'advance', label: 'Advance' },
  { key: 'incomeTax', label: 'Income Tax' },
  { key: 'other', label: 'Other' },
]

const STRUCTURAL_EARNINGS = new Set([
  'basic',
  'hra',
  'utilityAllowance',
  'conveyanceAllowance',
  'loanIssued',
  'leaveEncashment',
])
const STRUCTURAL_DEDUCTIONS = new Set(['leave', 'loan', 'providentFund'])

function salaryToFormValues(salary: Salary): SalaryFormValues {
  return {
    employeeId: salary.employeeId,
    payPeriodMonth: salary.payPeriodMonth,
    payPeriodYear: salary.payPeriodYear,
    status: salary.status,
    description: salary.description,
    applyToEmployeeDefaults: false,
    earnings: {
      ...salary.earnings,
      leaveEncashment: salary.earnings.leaveEncashment ?? 0,
    },
    deductions: { ...salary.deductionBreakdown },
  }
}

export function SalaryForm({ mode, initial, onSubmit, onCancel }: SalaryFormProps) {
  const now = new Date()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { data: employeesResult } = useEmployeesList({ page: 1, limit: 100 })
  const employees = employeesResult?.employees ?? []
  const lockStructural = mode === 'edit'

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SalaryFormValues>({
    resolver: zodResolver(salaryFormSchema),
    defaultValues: initial
      ? salaryToFormValues(initial)
      : {
          employeeId: '',
          payPeriodMonth: now.getMonth() + 1,
          payPeriodYear: now.getFullYear(),
          status: 'pending',
          description: '',
          applyToEmployeeDefaults: false,
          earnings: { ...emptyEarnings },
          deductions: { ...emptyDeductions },
        },
  })

  const employeeId = watch('employeeId')
  const payPeriodMonth = watch('payPeriodMonth')
  const payPeriodYear = watch('payPeriodYear')
  const earnings = watch('earnings')
  const deductions = watch('deductions')
  const applyToDefaults = watch('applyToEmployeeDefaults')
  const [approvedExpensesHint, setApprovedExpensesHint] = useState<{
    total: number
    count: number
  } | null>(null)

  const totals = useMemo(() => {
    const totalEarnings = Object.values(earnings ?? {}).reduce((a, b) => a + Number(b || 0), 0)
    const totalDeductions = Object.values(deductions ?? {}).reduce((a, b) => a + Number(b || 0), 0)
    return { totalEarnings, totalDeductions, net: totalEarnings - totalDeductions }
  }, [earnings, deductions])

  useEffect(() => {
    if (mode !== 'create' || !employeeId) return
    let cancelled = false
    void salariesApi
      .getEmployeeDefaults(employeeId)
      .then((defaults) => {
        if (cancelled) return
        setValue('earnings', defaults.earnings)
        setValue('deductions', defaults.deductions)
      })
      .catch(() => {
        /* keep zeros */
      })
    return () => {
      cancelled = true
    }
  }, [employeeId, mode, setValue])

  useEffect(() => {
    if (mode !== 'create' || !employeeId || !payPeriodMonth || !payPeriodYear) {
      setApprovedExpensesHint(null)
      return
    }
    let cancelled = false
    void expensesApi
      .getApprovedTotal({
        employeeId,
        month: Number(payPeriodMonth),
        year: Number(payPeriodYear),
      })
      .then((result) => {
        if (cancelled) return
        setApprovedExpensesHint(result.count > 0 ? result : null)
        if (result.total > 0) {
          const currentReimburse = Number(watch('earnings.reimburse') || 0)
          if (!currentReimburse) {
            setValue('earnings.reimburse', result.total)
          }
        }
      })
      .catch(() => {
        if (!cancelled) setApprovedExpensesHint(null)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only refetch when employee/period changes
  }, [employeeId, mode, payPeriodMonth, payPeriodYear, setValue])

  const onFormSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      await onSubmit(values)
    } catch (err) {
      const message = getErrorMessage(
        err,
        err instanceof ApiError ? err.message : 'Unable to save salary record.',
      )
      setSubmitError(message)
      toast.error(message)
    }
  })

  return (
    <form id="salary-form" onSubmit={onFormSubmit} className="space-y-6" noValidate>
      {submitError && (
        <p className="rounded-lg bg-[#fef2f2] px-4 py-3 text-sm text-danger">{submitError}</p>
      )}

      <ExpenseFormCard>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Employee" error={errors.employeeId?.message}>
            <ChevronSelect
              {...register('employeeId')}
              disabled={mode === 'edit'}
              className={expenseFormInputClass}
            >
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.employeeId})
                </option>
              ))}
            </ChevronSelect>
          </FormField>

          <FormField label="Status" error={errors.status?.message}>
            <ChevronSelect {...register('status')} className={expenseFormInputClass}>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </ChevronSelect>
          </FormField>

          <FormField label="Month" error={errors.payPeriodMonth?.message}>
            <ChevronSelect
              {...register('payPeriodMonth')}
              disabled={mode === 'edit'}
              className={expenseFormInputClass}
            >
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </ChevronSelect>
          </FormField>

          <FormField label="Year" error={errors.payPeriodYear?.message}>
            <input
              type="number"
              min={2000}
              max={2100}
              disabled={mode === 'edit'}
              className={expenseFormInputClass}
              {...register('payPeriodYear')}
            />
          </FormField>
        </div>

        <FormField label="Description" error={errors.description?.message}>
          <textarea
            {...register('description')}
            placeholder="Optional notes for this payroll period"
            className={expenseFormTextareaClass}
          />
        </FormField>
      </ExpenseFormCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <ExpenseFormCard>
          <h3 className="mb-4 text-lg font-bold text-heading">
            {lockStructural ? 'Editable earnings' : 'Earnings'}
          </h3>
          {lockStructural && (
            <p className="mb-3 rounded-lg bg-[#f8fafc] px-3 py-2 text-xs text-text-muted">
              Basic, allowances, loan issued, and leave encashment are set from the employee
              package / payroll generate. Change them via Employee → Salary. Only OT, bonus, and
              reimburse can be edited here.
            </p>
          )}
          {approvedExpensesHint && (
            <p className="mb-3 rounded-lg bg-primary-muted px-3 py-2 text-sm text-heading">
              {approvedExpensesHint.count} approved expense
              {approvedExpensesHint.count === 1 ? '' : 's'} this period (
              {formatCurrency(approvedExpensesHint.total)}) suggested for Reimburse.
            </p>
          )}
          <div className="space-y-3">
            {EARNING_FIELDS.filter(
              (field) => !(lockStructural && STRUCTURAL_EARNINGS.has(field.key)),
            ).map((field) => (
              <FormField
                key={field.key}
                label={field.label}
                error={errors.earnings?.[field.key]?.message}
              >
                <input
                  type="number"
                  min={0}
                  step="1"
                  className={expenseFormInputClass}
                  {...register(`earnings.${field.key}`)}
                />
              </FormField>
            ))}
          </div>
          <p className="mt-4 text-sm font-semibold text-heading">
            Total earnings: {formatCurrency(totals.totalEarnings)}
          </p>
        </ExpenseFormCard>

        <ExpenseFormCard>
          <h3 className="mb-4 text-lg font-bold text-heading">
            {lockStructural ? 'Editable deductions' : 'Deductions'}
          </h3>
          {lockStructural && (
            <p className="mb-3 rounded-lg bg-[#f8fafc] px-3 py-2 text-xs text-text-muted">
              Leave, loan EMI, and PF come from payroll generate. Only advance, tax, and other can
              be edited here.
            </p>
          )}
          <div className="space-y-3">
            {DEDUCTION_FIELDS.filter(
              (field) => !(lockStructural && STRUCTURAL_DEDUCTIONS.has(field.key)),
            ).map((field) => (
              <FormField
                key={field.key}
                label={field.label}
                error={errors.deductions?.[field.key]?.message}
              >
                <input
                  type="number"
                  min={0}
                  step="1"
                  className={expenseFormInputClass}
                  {...register(`deductions.${field.key}`)}
                />
              </FormField>
            ))}
          </div>
          <p className="mt-4 text-sm font-semibold text-heading">
            Total deductions: {formatCurrency(totals.totalDeductions)}
          </p>
        </ExpenseFormCard>
      </div>

      <ExpenseFormCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-text-muted">Net disbursement</p>
            <p className="text-2xl font-bold text-heading">{formatCurrency(totals.net)}</p>
          </div>
          {mode === 'create' && (
            <label className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={Boolean(applyToDefaults)}
                onChange={(e) => setValue('applyToEmployeeDefaults', e.target.checked)}
              />
              <span className="text-sm font-medium text-heading">
                Apply basic allowances to employee defaults
              </span>
            </label>
          )}
        </div>

        <div className="mt-6 flex gap-3">
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
            className="h-11 rounded-lg bg-[#1877f2] px-6 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95 disabled:opacity-70"
          >
            {isSubmitting
              ? 'Saving…'
              : mode === 'create'
                ? 'Create Payroll'
                : 'Save Changes'}
          </button>
        </div>
      </ExpenseFormCard>
    </form>
  )
}
