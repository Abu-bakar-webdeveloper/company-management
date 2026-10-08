import { departmentLabels } from '@/features/employees/model/employeesData'
import type { Employee } from '@/features/employees/model/types'
import { EmployeeStatusBadge } from '@/features/employees/ui/EmployeeStatusBadge'
import { formatLongDate } from '@/features/employees/lib/employee-utils'
import { MailSmallIcon, PhoneIcon } from '@/features/employees/ui/icons'
import { UserAvatar } from '@/shared/ui/UserAvatar'

export function EmployeeProfileHeader({ employee }: { employee: Employee }) {
  return (
    <div className="border-b border-border-card bg-primary/10 px-6 py-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <UserAvatar
            key={employee.avatar ?? employee.id}
            name={employee.fullName}
            avatar={employee.avatar}
            size="3xl"
            rounded="xl"
            className="border-2 border-white shadow-sm"
          />
          <div>
            <h2 className="text-2xl font-bold text-heading">{employee.fullName}</h2>
            <p className="mt-1 text-sm font-medium text-primary hover:opacity-90">
              {[employee.jobTitle || employee.roleLabel, `${departmentLabels[employee.department]} Department`]
                .filter(Boolean)
                .join(' • ')}
            </p>
            <div className="mt-3 flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:gap-4">
              <span className="flex items-center gap-2 text-sm text-text-muted">
                <MailSmallIcon />
                {employee.email}
              </span>
              <span className="flex items-center gap-2 text-sm text-text-muted">
                <PhoneIcon />
                {employee.phone}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-8 sm:gap-12">
          <div>
            <p className="text-xs font-medium text-text-muted">Join Date</p>
            <p className="mt-1 text-sm font-semibold text-primary hover:opacity-90">
              {formatLongDate(employee.joinDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-text-muted">Status</p>
            <div className="mt-1.5">
              <EmployeeStatusBadge status={employee.status} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
