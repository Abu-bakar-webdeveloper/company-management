import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { Card } from '@/shared/ui/Card'
import { cn } from '@/shared/lib/cn'

export type ActivityItem = {
  id: string
  title: string
  description: string
  time: string
  icon: 'user' | 'check' | 'warning'
}

const iconStyles = {
  user: 'bg-[#eff6ff] text-[#1877f2]',
  check: 'bg-[#ecfdf5] text-[#00b67a]',
  warning: 'bg-[#fff7ed] text-[#f97316]',
}

function ActivityIcon({ type }: { type: keyof typeof iconStyles }) {
  return (
    <div
      className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-full',
        iconStyles[type],
      )}
    >
      {type === 'user' && (
        <svg width="16" height="16" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.3333 16.5208L13.1458 14.3333H2.1875V12C2.1875 11.5278 2.30903 11.0938 2.55208 10.6979C2.79514 10.3021 3.11806 10 3.52083 9.79167C4.14583 9.47222 4.78125 9.21528 5.42708 9.02083C6.07292 8.82639 6.72917 8.68056 7.39583 8.58333L0 1.1875L1.1875 0L16.5208 15.3333L15.3333 16.5208ZM3.85417 12.6667H11.4792L8.97917 10.1667C8.95139 10.1667 8.93056 10.1667 8.91667 10.1667C8.90278 10.1667 8.88194 10.1667 8.85417 10.1667C8.07639 10.1667 7.30556 10.2604 6.54167 10.4479C5.77778 10.6354 5.02083 10.9167 4.27083 11.2917C4.14583 11.3611 4.04514 11.4583 3.96875 11.5833C3.89236 11.7083 3.85417 11.8472 3.85417 12V12.6667ZM14.1875 9.79167C14.5903 9.98611 14.9097 10.2812 15.1458 10.6771C15.3819 11.0729 15.5069 11.5 15.5208 11.9583L12.7292 9.16667C12.9792 9.26389 13.2257 9.36111 13.4688 9.45833C13.7118 9.55556 13.9514 9.66667 14.1875 9.79167ZM10.6875 7.125L9.45833 5.89583C9.77778 5.77083 10.0347 5.56597 10.2292 5.28125C10.4236 4.99653 10.5208 4.68056 10.5208 4.33333C10.5208 3.875 10.3576 3.48264 10.0312 3.15625C9.70486 2.82986 9.3125 2.66667 8.85417 2.66667C8.50694 2.66667 8.19097 2.76389 7.90625 2.95833C7.62153 3.15278 7.41667 3.40972 7.29167 3.72917L6.0625 2.5C6.38194 2.02778 6.78472 1.65972 7.27083 1.39583C7.75694 1.13194 8.28472 1 8.85417 1C9.77083 1 10.5556 1.32639 11.2083 1.97917C11.8611 2.63194 12.1875 3.41667 12.1875 4.33333C12.1875 4.90278 12.0556 5.43056 11.7917 5.91667C11.5278 6.40278 11.1597 6.80556 10.6875 7.125ZM11.4792 12.6667H3.85417C3.85417 12.6667 3.89236 12.6667 3.96875 12.6667C4.04514 12.6667 4.14583 12.6667 4.27083 12.6667C4.64583 12.6667 5.03472 12.6667 5.4375 12.6667C5.84028 12.6667 6.31597 12.6667 6.86458 12.6667C7.41319 12.6667 8.05903 12.6667 8.80208 12.6667C9.54514 12.6667 10.4375 12.6667 11.4792 12.6667Z" fill="#136DEC"/>
        </svg>
      )}
      {type === 'check' && (
        <svg width="16" height="16" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.16667 12.1667L13.0417 6.29167L11.875 5.125L7.16667 9.83333L4.79167 7.45833L3.625 8.625L7.16667 12.1667ZM8.33333 16.6667C7.18056 16.6667 6.09722 16.4479 5.08333 16.0104C4.06944 15.5729 3.1875 14.9792 2.4375 14.2292C1.6875 13.4792 1.09375 12.5972 0.65625 11.5833C0.21875 10.5694 0 9.48611 0 8.33333C0 7.18056 0.21875 6.09722 0.65625 5.08333C1.09375 4.06944 1.6875 3.1875 2.4375 2.4375C3.1875 1.6875 4.06944 1.09375 5.08333 0.65625C6.09722 0.21875 7.18056 0 8.33333 0C9.48611 0 10.5694 0.21875 11.5833 0.65625C12.5972 1.09375 13.4792 1.6875 14.2292 2.4375C14.9792 3.1875 15.5729 4.06944 16.0104 5.08333C16.4479 6.09722 16.6667 7.18056 16.6667 8.33333C16.6667 9.48611 16.4479 10.5694 16.0104 11.5833C15.5729 12.5972 14.9792 13.4792 14.2292 14.2292C13.4792 14.9792 12.5972 15.5729 11.5833 16.0104C10.5694 16.4479 9.48611 16.6667 8.33333 16.6667ZM8.33333 15C10.1944 15 11.7708 14.3542 13.0625 13.0625C14.3542 11.7708 15 10.1944 15 8.33333C15 6.47222 14.3542 4.89583 13.0625 3.60417C11.7708 2.3125 10.1944 1.66667 8.33333 1.66667C6.47222 1.66667 4.89583 2.3125 3.60417 3.60417C2.3125 4.89583 1.66667 6.47222 1.66667 8.33333C1.66667 10.1944 2.3125 11.7708 3.60417 13.0625C4.89583 14.3542 6.47222 15 8.33333 15Z" fill="#16A34A"/>
        </svg>
      )}
      {type === 'warning' && (
        <svg width="13" height="14" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 14.1667V0H7.5L7.83333 1.66667H12.5V10H6.66667L6.33333 8.33333H1.66667V14.1667H0ZM8.04167 8.33333H10.8333V3.33333H6.45833L6.125 1.66667H1.66667V6.66667H7.70833L8.04167 8.33333Z" fill="#2563EB"/>
        </svg>
      )}
    </div>
  )
}

type RecentActivitiesProps = {
  title?: string
  items?: ActivityItem[]
  /** When true (default), show empty state if no items are provided. */
  comingSoonWhenEmpty?: boolean
}

export function RecentActivities({
  title = 'Recent Activities',
  items,
  comingSoonWhenEmpty = true,
}: RecentActivitiesProps) {
  const list = items ?? []
  const showComingSoon = comingSoonWhenEmpty && list.length === 0

  return (
    <Card className="flex h-[334px] flex-col p-[25px]">
      <h3 className="mb-6 shrink-0 text-[24px] leading-6 font-semibold text-heading">{title}</h3>
      {showComingSoon ? (
        <ComingSoonState
          title="No activities yet"
          description="Recent activity will show up here as things happen."
          minHeight="min-h-0 flex-1"
        />
      ) : (
        <ul className="scrollbar-app -mr-1 flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pr-2">
          {list.map((item) => (
            <li key={item.id} className="flex gap-4">
              <ActivityIcon type={item.icon} />
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-semibold leading-5 text-heading">{item.title}</p>
                <p className="mt-0.5 text-xs font-normal text-text-muted">{item.description}</p>
                <p className="mt-1 text-[10px] leading-[15px] text-heading">{item.time}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
