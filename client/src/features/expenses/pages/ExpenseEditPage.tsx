import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { expensesApi } from '@/features/expenses/api/expensesApi'
import type { Expense } from '@/features/expenses/model/types'
import { EditExpenseForm } from '@/features/expenses/ui/EditExpenseForm'
import { getErrorMessage } from '@/shared/api/errors'
import { ArrowLeftIcon } from '@/shared/ui/icons'

export function ExpenseEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [expense, setExpense] = useState<Expense | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    void expensesApi
      .getById(id)
      .then((data) => setExpense(data))
      .catch(() => setExpense(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <p className="text-sm text-text-muted">Loading…</p>
      </div>
    )
  }

  if (!expense) {
    return (
      <div className="p-8">
        <p className="font-semibold text-heading">Expense not found</p>
        <Link to="/expenses" className="mt-4 inline-block text-sm text-[#1877f2]">
          Back to Expenses
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8">
      <Link
        to="/expenses"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-heading"
      >
        <ArrowLeftIcon className="text-text-muted" />
        Back to Expenses
      </Link>

      <header className="mb-6">
        <h1 className="text-[30px] font-bold leading-9 text-heading">Edit Expense</h1>
        <p className="mt-1 text-base leading-6 text-text-muted">
          Update the details for the {expense.title.toLowerCase()} expense.
        </p>
      </header>

      <div className="mx-auto">
        <EditExpenseForm
          expense={expense}
          onCancel={() => navigate(`/expenses/${expense.id}`)}
          onSubmit={async (values) => {
            try {
              await expensesApi.update(expense.id, values)
              navigate(`/expenses/${expense.id}`)
            } catch (error) {
              toast.error(getErrorMessage(error, 'Unable to update expense'))
              throw error
            }
          }}
        />
      </div>
    </div>
  )
}
