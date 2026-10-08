import { Link } from 'react-router-dom'
import type { Employee } from '@/features/employees/model/types'
import { departmentLabels } from '@/features/employees/model/employeesData'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { Card } from '@/shared/ui/Card'
import { EmployeeAvatar } from '@/features/employees/ui/EmployeeAvatar'
import { EmployeeStatusBadge } from '@/features/employees/ui/EmployeeStatusBadge'
import { formatDate } from '@/features/employees/lib/employee-utils'
import { EditIcon, EyeViewIcon } from '@/features/employees/ui/icons'
import { cn } from '@/shared/lib/cn'

type EmployeesTableProps = {
  employees: Employee[]
  page: number
  total: number
  rangeStart: number
  rangeEnd: number
  totalPages: number
  onPageChange: (page: number) => void
  isFiltered?: boolean
  canEdit?: boolean
}

function EmployeeRowActions({
  employee,
  canEdit,
}: {
  employee: Employee
  canEdit: boolean
}) {
  return (
    <div className="flex items-center justify-end gap-2 lg:justify-center">
      <Link
        to={`/employees/${employee.id}`}
        className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary hover:opacity-90"
        aria-label={`View ${employee.fullName}`}
        title="View details"
      >
        <EyeViewIcon />
      </Link>
      {canEdit ? (
        <Link
          to={`/employees/${employee.id}/edit`}
          className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary hover:opacity-90"
          aria-label={`Edit ${employee.fullName}`}
          title="Edit employee"
        >
          <EditIcon />
        </Link>
      ) : null}
    </div>
  )
}

export function EmployeesTable({
  employees,
  page,
  total,
  rangeStart,
  rangeEnd,
  totalPages,
  onPageChange,
  isFiltered = false,
  canEdit = false,
}: EmployeesTableProps) {
  if (total === 0) {
    return (
      <Card className="p-4 sm:p-6">
        <ComingSoonState
          title={isFiltered ? 'No employees found' : 'No employees yet'}
          description={
            isFiltered
              ? 'Try adjusting your search or filters.'
              : 'Add employees to see them listed here.'
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
      <div className="divide-y divide-border-card lg:hidden">
        {employees.map((employee) => (
          <div key={employee.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <EmployeeAvatar name={employee.fullName} avatar={employee.avatar} />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-heading">{employee.fullName}</p>
                  <p className="truncate text-xs text-text-muted">{employee.email}</p>
                </div>
              </div>
              <EmployeeStatusBadge status={employee.status} />
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-text-muted">Title</dt>
                <dd className="text-right font-medium text-heading">
                  {employee.jobTitle || '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-muted">Role</dt>
                <dd className="font-medium text-heading">{employee.roleLabel ?? 'Employee'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-muted">Department</dt>
                <dd className="font-medium text-heading">
                  {departmentLabels[employee.department]}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-muted">Join Date</dt>
                <dd className="text-heading">{formatDate(employee.joinDate)}</dd>
              </div>
            </dl>
            <div className="mt-3">
              <EmployeeRowActions employee={employee} canEdit={canEdit} />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-table-header text-[11px] font-semibold uppercase tracking-wide text-heading">
              <th className="px-6 py-3.5">Employee</th>
              <th className="px-6 py-3.5">Title</th>
              <th className="px-6 py-3.5">Role</th>
              <th className="px-6 py-3.5">Department</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Join Date</th>
              <th className="px-6 py-3.5 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id} className="border-t border-border-card">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <EmployeeAvatar name={employee.fullName} avatar={employee.avatar} />
                    <div>
                      <p className="font-semibold text-heading">{employee.fullName}</p>
                      <p className="text-xs text-text-muted">{employee.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-heading">{employee.jobTitle || '—'}</td>
                <td className="px-6 py-4 text-heading">{employee.roleLabel ?? 'Employee'}</td>
                <td className="px-6 py-4 text-heading">
                  {departmentLabels[employee.department]}
                </td>
                <td className="px-6 py-4">
                  <EmployeeStatusBadge status={employee.status} />
                </td>
                <td className="px-6 py-4 text-heading">{formatDate(employee.joinDate)}</td>
                <td className="px-6 py-4">
                  <EmployeeRowActions employee={employee} canEdit={canEdit} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 border-t border-border-card bg-table-header px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-text-muted">
          Showing {rangeStart} to {rangeEnd} of {total} results
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </button>
          {pageNumbers.map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={cn(
                'min-w-9 rounded-lg px-3 py-1.5 text-sm font-medium',
                pageNum === page
                  ? 'bg-primary text-white hover:opacity-95'
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
