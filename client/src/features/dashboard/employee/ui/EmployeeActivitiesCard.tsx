import {
  type EmployeeActivityItem,
} from '@/features/dashboard/employee/model/employeeDashboardData'
import {
  ActivityCheckIcon,
  ActivityRefreshIcon,
  ActivitySendIcon,
} from '@/features/dashboard/employee/ui/employeeIcons'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { cn } from '@/shared/lib/cn'

const iconStyles = {
  check: 'bg-[#ECFDF5] text-[#00B67A]',
  play: 'bg-[#FFF7ED] text-[#F97316]',
  refresh: 'bg-[#EFF6FF] text-[#1877F2]',
}

function ActivityIcon({ type }: { type: EmployeeActivityItem['icon'] }) {
  return (
    <div
      className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-full',
        iconStyles[type],
      )}
    >
      {type === 'check' && <ActivityCheckIcon />}
      {type === 'play' && <ActivitySendIcon />}
      {type === 'refresh' && <ActivityRefreshIcon />}
    </div>
  )
}

type EmployeeActivitiesCardProps = {
  title?: string
  items?: EmployeeActivityItem[]
}

export function EmployeeActivitiesCard({
  title = 'My Activities',
  items = [],
}: EmployeeActivitiesCardProps) {
  const showComingSoon = items.length === 0

  return (
    <div className="flex h-[300px] flex-col rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:h-[334px] sm:p-6">
      <h3 className="mb-6 shrink-0 text-xl font-semibold leading-6 text-[#1E293B] sm:text-2xl">{title}</h3>
      {showComingSoon ? (
        <ComingSoonState
          className="flex-1"
          title="No activities yet"
          description="Your recent activity will show up here as things happen."
          minHeight="min-h-0"
        />
      ) : (
        <ul className="scrollbar-app -mr-1 flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pr-2">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4">
              <ActivityIcon type={item.icon} />
              <div className="min-w-0 flex-1 pt-1">
                <p className="text-sm font-semibold leading-5 text-[#1E293B]">{item.title}</p>
                <p className="mt-1 text-xs text-[#64748B]">{item.time}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
