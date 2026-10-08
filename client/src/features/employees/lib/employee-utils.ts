import { departmentLabels } from '@/features/employees/model/employeesData'
import type { Employee, EmployeeDepartment } from '@/features/employees/model/types'
import { formatCompanyDate, formatCompanyLongDate } from '@/shared/lib/format'

export function formatDate(iso: string): string {
  return formatCompanyDate(iso)
}

export function formatLongDate(iso: string): string {
  return formatCompanyLongDate(iso)
}

export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length <= 1) return { firstName: parts[0] ?? '', lastName: '' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

export function getEmployeeNames(employee: Employee) {
  if (employee.firstName) {
    return {
      firstName: employee.firstName,
      lastName: employee.lastName ?? '',
    }
  }
  return splitFullName(employee.fullName)
}

export function filterEmployees<
  T extends {
    fullName: string
    email: string
    employeeId: string
    jobTitle: string
    department: string
    status: string
  },
>(
  items: T[],
  search: string,
  department: string,
  status: string,
): T[] {
  const q = search.trim().toLowerCase()
  return items.filter((item) => {
    const deptLabel =
      item.department in departmentLabels
        ? departmentLabels[item.department as EmployeeDepartment]
        : item.department

    const matchesSearch =
      !q ||
      item.fullName.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.employeeId.toLowerCase().includes(q) ||
      item.jobTitle.toLowerCase().includes(q) ||
      ('roleLabel' in item && typeof item.roleLabel === 'string'
        ? item.roleLabel.toLowerCase().includes(q)
        : false) ||
      deptLabel.toLowerCase().includes(q)

    const matchesDepartment = department === 'all' || item.department === department
    const matchesStatus = status === 'all' || item.status === status
    return matchesSearch && matchesDepartment && matchesStatus
  })
}
