import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { expensesApi } from '@/features/expenses/api/expensesApi'
import { useEmployeesList } from '@/features/employees/hooks/useEmployees'
import { paginate } from '@/shared/lib/pagination'
import type { Expense, ExpenseListFilters, ExpenseStats } from '@/features/expenses/model/types'
import { ExpenseStatsRow } from '@/features/expenses/ui/ExpenseStatsRow'
import { ExpensesTable } from '@/features/expenses/ui/ExpensesTable'
import { ExpenseToolbar } from '@/features/expenses/ui/ExpenseToolbar'
import { ExportIcon, PlusIcon } from '@/features/expenses/ui/icons'
import { useProjectsList } from '@/features/projects/hooks/useProjects'
import { getErrorMessage } from '@/shared/api/errors'

const PAGE_SIZE = 10

const defaultFilters: ExpenseListFilters = {
  search: '',
  expenseType: 'all',
  category: 'all',
  status: 'all',
  period: 'all',
  employeeId: 'all',
  projectId: 'all',
}

const emptyStats: ExpenseStats = { total: 0, pending: 0, approved: 0, rejected: 0 }

export function ExpensesListPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [stats, setStats] = useState<ExpenseStats>(emptyStats)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ExpenseListFilters>(defaultFilters)
  const [page, setPage] = useState(1)

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

  const projectOptions = useMemo(
    () => projects.map((proj) => ({ id: proj.id, name: proj.name })),
    [projects],
  )

  const loadExpenses = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        search: filters.search || undefined,
        expenseType: filters.expenseType === 'all' ? undefined : filters.expenseType,
        category: filters.category === 'all' ? undefined : filters.category,
        status: filters.status === 'all' ? undefined : filters.status,
        period: filters.period === 'all' ? undefined : filters.period,
        employeeId: filters.employeeId === 'all' ? undefined : filters.employeeId,
        projectId: filters.projectId === 'all' ? undefined : filters.projectId,
        limit: 100,
      }
      const [data, statsData] = await Promise.all([
        expensesApi.list(params),
        expensesApi.getStats(),
      ])
      setExpenses(data)
      setStats(statsData)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to load expenses'))
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    void loadExpenses()
  }, [loadExpenses])

  useEffect(() => {
    setPage(1)
  }, [filters])

  const pagination = useMemo(() => paginate(expenses, page, PAGE_SIZE), [expenses, page])

  const handleDelete = async (id: string) => {
    try {
      await expensesApi.remove(id)
      await loadExpenses()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to delete expense'))
    }
  }

  const isFiltered =
    filters.search.trim() !== '' ||
    filters.expenseType !== 'all' ||
    filters.category !== 'all' ||
    filters.status !== 'all' ||
    filters.period !== 'all' ||
    filters.employeeId !== 'all' ||
    filters.projectId !== 'all'
  const showToolbar = !loading && (isFiltered || pagination.total > 0)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-8 text-heading sm:text-[30px] sm:leading-9">
            Expenses
          </h1>
          <p className="mt-1 text-sm leading-6 text-text-muted sm:text-base">
            Manage company expenses and track approvals.
          </p>
        </div>
        <div className="grid w-full grid-cols-1 gap-3 sm:flex sm:w-auto sm:shrink-0 sm:items-center">
          <Link
            to="/reports/generate?type=expenses"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-5 text-sm font-semibold text-heading hover:bg-surface-muted sm:w-auto"
          >
            <ExportIcon />
            Export Report
          </Link>
          <Link
            to="/expenses/new"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95 sm:w-auto"
          >
            <PlusIcon />
            Add Expense
          </Link>
        </div>
      </header>

      <ExpenseStatsRow stats={stats} />
      {showToolbar ? (
        <ExpenseToolbar
          filters={filters}
          onChange={setFilters}
          employeeOptions={employeeOptions}
          projectOptions={projectOptions}
        />
      ) : null}

      {loading ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-border-card bg-surface shadow-[var(--shadow-stat)]">
          <p className="text-sm text-text-muted">Loading expenses…</p>
        </div>
      ) : (
        <ExpensesTable
          expenses={pagination.items}
          page={pagination.currentPage}
          total={pagination.total}
          rangeStart={pagination.start}
          rangeEnd={pagination.end}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
          onDelete={(id) => void handleDelete(id)}
          isFiltered={isFiltered}
        />
      )}
    </div>
  )
}
