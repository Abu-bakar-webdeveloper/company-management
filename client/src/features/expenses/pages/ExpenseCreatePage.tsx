import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { expensesApi } from '@/features/expenses/api/expensesApi'
import { CreateExpenseForm } from '@/features/expenses/ui/CreateExpenseForm'
import { getErrorMessage } from '@/shared/api/errors'
import { ArrowLeftIcon } from '@/shared/ui/icons'

export function ExpenseCreatePage() {
  const navigate = useNavigate()

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
        <h1 className="text-[30px] font-bold leading-9 text-heading">Add Expense</h1>
        <p className="mt-1 text-base leading-6 text-text-muted">
          Create a new expense entry for processing.
        </p>
      </header>

      <div className="mx-auto">
        <CreateExpenseForm
          onCancel={() => navigate('/expenses')}
          onSubmit={async (values) => {
            try {
              const created = await expensesApi.create(values)
              navigate(`/expenses/${created.id}`)
            } catch (error) {
              toast.error(getErrorMessage(error, 'Unable to create expense'))
              throw error
            }
          }}
        />
      </div>
    </div>
  )
}
