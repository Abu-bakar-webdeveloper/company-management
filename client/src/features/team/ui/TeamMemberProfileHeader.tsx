import { departmentLabels } from '@/features/employees/model/employeesData'
import { formatLongDate } from '@/features/employees/lib/employee-utils'
import { EmployeeStatusBadge } from '@/features/employees/ui/EmployeeStatusBadge'
import { MailSmallIcon, PhoneIcon } from '@/features/employees/ui/icons'
import type { TeamMemberDetail } from '@/features/team/model/teamMemberDetailData'
import { UserAvatar } from '@/shared/ui/UserAvatar'

export function TeamMemberProfileHeader({ detail }: { detail: TeamMemberDetail }) {
  return (
    <div className="border-b border-[#e2e8f0] bg-[#f0f7ff] px-6 py-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <UserAvatar
            name={detail.fullName}
            avatar={detail.avatar}
            size="3xl"
            rounded="xl"
            className="border-2 border-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
          />
          <div>
            <h2 className="text-2xl font-bold leading-8 text-heading">{detail.fullName}</h2>
            <p className="mt-1 text-sm font-medium text-[#1877f2]">
              {detail.jobTitle} • {departmentLabels[detail.department]} Department
            </p>
            <div className="mt-3 flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <span className="flex items-center gap-2 text-sm text-[#778499]">
                <MailSmallIcon />
                {detail.email}
              </span>
              <span className="flex items-center gap-2 text-sm text-[#778499]">
                <PhoneIcon />
                {detail.phone}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 gap-10 sm:gap-14">
          <div>
            <p className="text-xs font-medium text-[#778499]">Join Date</p>
            <p className="mt-1 text-sm font-semibold text-heading">
              {formatLongDate(detail.joinDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#778499]">Status</p>
            <div className="mt-1.5">
              <EmployeeStatusBadge status={detail.status} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
