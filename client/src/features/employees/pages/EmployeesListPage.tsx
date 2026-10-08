import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/model/AuthContext'
import { useEmployeesList } from '@/features/employees/hooks/useEmployees'
import { mapListStatusFilter } from '@/features/employees/lib/employee-mappers'
import type { EmployeeListFilters } from '@/features/employees/model/types'
import { EmployeeToolbar } from '@/features/employees/ui/EmployeeToolbar'
import { EmployeesTable } from '@/features/employees/ui/EmployeesTable'
import { filterEmployees } from '@/features/employees/lib/employee-utils'
import { paginate } from '@/shared/lib/pagination'
import { PlusIcon } from '@/features/employees/ui/icons'
import { TableSkeleton } from '@/shared/ui/DataSkeletons'

const PAGE_SIZE = 10

const defaultFilters: EmployeeListFilters = {
  search: '',
  department: 'all',
  status: 'all',
}

export function EmployeesListPage() {
  const { can } = useAuth()
  const [filters, setFilters] = useState<EmployeeListFilters>(defaultFilters)
  const [page, setPage] = useState(1)

  const departmentFiltered = filters.department !== 'all'
  const isFiltered =
    filters.search.trim() !== '' ||
    filters.department !== 'all' ||
    filters.status !== 'all'

  const { data, isLoading } = useEmployeesList({
    page: departmentFiltered ? 1 : page,
    limit: departmentFiltered ? 100 : PAGE_SIZE,
    search: filters.search.trim() || undefined,
    status: mapListStatusFilter(filters.status),
  })

  useEffect(() => {
    setPage(1)
  }, [filters])

  const filtered = useMemo(() => {
    const employees = data?.employees ?? []
    if (!departmentFiltered) return employees
    return filterEmployees(employees, '', filters.department, 'all')
  }, [data?.employees, filters.department, departmentFiltered])

  const pagination = useMemo(() => {
    if (departmentFiltered) {
      return paginate(filtered, page, PAGE_SIZE)
    }

    const serverPagination = data?.pagination
    return {
      items: filtered,
      currentPage: serverPagination?.page ?? page,
      total: serverPagination?.total ?? filtered.length,
      start: serverPagination
        ? (serverPagination.page - 1) * serverPagination.limit + 1
        : 1,
      end: serverPagination
        ? Math.min(serverPagination.page * serverPagination.limit, serverPagination.total)
        : filtered.length,
      totalPages: serverPagination?.totalPages ?? 1,
    }
  }, [filtered, page, departmentFiltered, data?.pagination])

  const canCreate = can('employees:write')
  const showToolbar = !isLoading && (isFiltered || pagination.total > 0)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-8 text-heading sm:text-[30px] sm:leading-9">
            Employees
          </h1>
          <p className="mt-1 text-sm leading-6 text-text-muted sm:text-base">
            Manage and monitor all company personnel
          </p>
        </div>
        {canCreate && (
          <Link
            to="/employees/new"
            className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95 sm:w-auto"
          >
            <PlusIcon />
            Add Employee
          </Link>
        )}
      </header>

      {showToolbar ? <EmployeeToolbar filters={filters} onChange={setFilters} /> : null}

      {isLoading ? (
        <TableSkeleton columns={6} rows={8} />
      ) : (
        <EmployeesTable
          employees={pagination.items}
          page={pagination.currentPage}
          total={pagination.total}
          rangeStart={pagination.start}
          rangeEnd={pagination.end}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
          isFiltered={isFiltered}
          canEdit={canCreate}
        />
      )}
    </div>
  )
}
