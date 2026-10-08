import { departmentLabels } from '@/features/employees/model/employeesData'
import type { Employee } from '@/features/employees/model/types'
import { formatDate } from '@/features/employees/lib/employee-utils'
import {
  BriefcaseIcon,
  CalendarIcon,
  IdCardIcon,
  MapPinIcon,
} from '@/features/employees/ui/icons'
import { UserAvatar } from '@/shared/ui/UserAvatar'

function OverviewCard({
  icon,
  label,
  value,
  extra,
}: {
  icon: React.ReactNode
  label: string
  value: string
  extra?: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-border-card bg-surface p-5">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#eff6ff]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-text-muted">{label}</p>
        <p className="mt-1 text-base font-bold text-heading">{value}</p>
        {extra}
      </div>
    </div>
  )
}

export function EmployeeOverviewTab({ employee }: { employee: Employee }) {
  return (
    <div className="p-6">
      <h3 className="mb-5 text-base font-bold text-primary hover:opacity-90">Overview</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <OverviewCard icon={<IdCardIcon />} label="Employee ID" value={employee.employeeId} />
        <OverviewCard
          icon={<BriefcaseIcon />}
          label="Job Title"
          value={employee.jobTitle || '—'}
        />
        <OverviewCard
          icon={<CalendarIcon className="size-5 text-primary hover:opacity-90" />}
          label="Joining Date"
          value={formatDate(employee.joinDate)}
        />
        <OverviewCard
          icon={<MapPinIcon />}
          label="Work Location"
          value={employee.workLocation ?? 'On-site'}
        />
        <OverviewCard
          icon={<BriefcaseIcon />}
          label="Employment Type"
          value={employee.employmentType ?? 'Full-time'}
        />
        <div className="flex items-center gap-4 rounded-xl border border-border-card bg-surface p-5">
          {employee.managerName && (
            <UserAvatar
              name={employee.managerName}
              avatar={employee.managerAvatar}
              size="lg"
            />
          )}
          <div>
            <p className="text-xs font-medium text-text-muted">Manager</p>
            <p className="mt-1 text-base font-bold text-heading">
              {employee.managerName ?? '—'}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-xl border border-border-card bg-surface p-5">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-text-muted">Reportees</p>
            <p className="mt-1 text-base font-bold text-heading">
              {employee.reporteesCount ?? 0} members
            </p>
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs text-text-muted">
        Department: {departmentLabels[employee.department]}
      </p>
    </div>
  )
}
