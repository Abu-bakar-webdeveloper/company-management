import { Link } from 'react-router-dom'
import {
  categoryLabel,
  expenseTypeLabel,
  formatCurrency,
  formatExpenseDate,
} from '@/features/expenses/lib/expense-utils'
import type { Expense } from '@/features/expenses/model/types'
import {
  AvatarCircle,
  EditIcon,
  EyeIcon,
  PaperclipIcon,
  TrashIcon,
} from '@/features/expenses/ui/icons'
import { ExpenseStatusBadge } from '@/features/expenses/ui/ExpenseStatusBadge'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { Card } from '@/shared/ui/Card'
import { cn } from '@/shared/lib/cn'

type ExpensesTableProps = {
  expenses: Expense[]
  page: number
  total: number
  rangeStart: number
  rangeEnd: number
  totalPages: number
  onPageChange: (page: number) => void
  onDelete: (id: string) => void
  isFiltered?: boolean
}

function ExpenseActions({
  expense,
  onDelete,
}: {
  expense: Expense
  onDelete: (id: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Link
        to={`/expenses/${expense.id}/edit`}
        className="flex size-9 items-center justify-center rounded-lg bg-[#eff6ff] text-[#1877f2] hover:opacity-90"
        aria-label={`Edit ${expense.title}`}
      >
        <EditIcon />
      </Link>
      <Link
        to={`/expenses/${expense.id}`}
        className="flex size-9 items-center justify-center rounded-lg bg-[#eff6ff] text-[#1877f2] hover:opacity-90"
        aria-label={`View ${expense.title}`}
      >
        <EyeIcon />
      </Link>
      <button
        type="button"
        onClick={() => onDelete(expense.id)}
        className="flex size-9 items-center justify-center rounded-lg bg-[#fef2f2] text-[#dc2626] hover:opacity-90"
        aria-label={`Delete ${expense.title}`}
      >
        <TrashIcon />
      </button>
    </div>
  )
}

export function ExpensesTable({
  expenses,
  page,
  total,
  rangeStart,
  rangeEnd,
  totalPages,
  onPageChange,
  onDelete,
  isFiltered = false,
}: ExpensesTableProps) {
  if (total === 0) {
    return (
      <Card className="p-4 sm:p-6">
        <ComingSoonState
          title={isFiltered ? 'No expenses found' : 'No expenses yet'}
          description={
            isFiltered
              ? 'Try adjusting your search or filters.'
              : 'Add an expense to see it listed here.'
          }
          minHeight="min-h-[280px]"
        />
      </Card>
    )
  }

  const pageNumbers =
    totalPages <= 3
      ? Array.from({ length: totalPages }, (_, i) => i + 1)
      : page <= 2
        ? [1, 2, 3]
        : page >= totalPages - 1
          ? [totalPages - 2, totalPages - 1, totalPages]
          : [page - 1, page, page + 1]

  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:hidden sm:p-6">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="rounded-xl border border-border-card bg-surface p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg text-primary">
                  <PaperclipIcon className="size-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-heading">{expense.title}</p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {expenseTypeLabel(expense.expenseType ?? 'employee')} ·{' '}
                    {categoryLabel(expense.category)}
                  </p>
                </div>
              </div>
              <ExpenseStatusBadge status={expense.status} />
            </div>

            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-text-muted">Employee</dt>
                <dd className="flex min-w-0 items-center gap-2 text-heading">
                  {expense.employeeName ? (
                    <>
                      <AvatarCircle name={expense.employeeName} avatar={expense.employeeAvatar} />
                      <span className="truncate">{expense.employeeName}</span>
                    </>
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="shrink-0 text-text-muted">Project</dt>
                <dd className="truncate text-right text-heading">
                  {expense.projectName ?? '—'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-text-muted">Amount</dt>
                <dd className="font-semibold text-heading">{formatCurrency(expense.amount)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-text-muted">Date</dt>
                <dd className="text-heading">{formatExpenseDate(expense.date)}</dd>
              </div>
            </dl>

            <div className="mt-3 flex justify-end">
              <ExpenseActions expense={expense} onDelete={onDelete} />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-table-header text-xs font-semibold uppercase tracking-wide text-heading">
              <th className="px-6 py-3.5">Expense</th>
              <th className="px-6 py-3.5">Type</th>
              <th className="px-6 py-3.5">Category</th>
              <th className="px-6 py-3.5">Employee</th>
              <th className="px-6 py-3.5">Project</th>
              <th className="px-6 py-3.5">Amount</th>
              <th className="px-6 py-3.5">Date</th>
              <th className="px-6 py-3.5 text-center">Status</th>
              <th className="px-6 py-3.5 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id} className="border-t border-border-card">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg text-primary">
                      <PaperclipIcon className="size-3.5" />
                    </span>
                    <span className="font-semibold text-heading">{expense.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-heading">
                  {expenseTypeLabel(expense.expenseType ?? 'employee')}
                </td>
                <td className="px-6 py-4 text-heading">{categoryLabel(expense.category)}</td>
                <td className="px-6 py-4">
                  {expense.employeeName ? (
                    <div className="flex items-center gap-2.5">
                      <AvatarCircle name={expense.employeeName} avatar={expense.employeeAvatar} />
                      <span className="text-heading">{expense.employeeName}</span>
                    </div>
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-heading">{expense.projectName ?? '—'}</td>
                <td className="px-6 py-4 font-semibold text-heading">
                  {formatCurrency(expense.amount)}
                </td>
                <td className="px-6 py-4 text-heading">{formatExpenseDate(expense.date)}</td>
                <td className="px-6 py-4">
                  <ExpenseStatusBadge status={expense.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center">
                    <ExpenseActions expense={expense} onDelete={onDelete} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 border-t border-border-card bg-table-header px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-center text-sm text-text-muted sm:text-left">
          Showing {rangeStart} to {rangeEnd} of {total} results
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          {pageNumbers.map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={cn(
                'min-w-9 rounded-lg px-3 py-1.5 text-sm font-medium',
                pageNum === page
                  ? 'bg-[#1877f2] text-white'
                  : 'border border-border bg-surface text-text-muted hover:bg-surface-muted',
              )}
            >
              {pageNum}
            </button>
          ))}
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </Card>
  )
}
