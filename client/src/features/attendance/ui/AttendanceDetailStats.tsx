import { formatTimeLabel } from '@/features/attendance/lib/attendance-utils'
import { cn } from '@/shared/lib/cn'

type DetailStat = {
  label: string
  value: string
  sub?: string
  iconBg: string
  iconColor: string
  icon: React.ReactNode
}

export function AttendanceDetailStats({
  checkIn,
  checkOut,
  workHoursToday,
  workingDaysThisMonth,
  timeZone,
}: {
  checkIn: string | null
  checkOut: string | null
  workHoursToday: string
  workingDaysThisMonth: number
  timeZone?: string
}) {
  const stats: DetailStat[] = [
    {
      label: 'Check in',
      value: formatTimeLabel(checkIn, timeZone),
      sub: 'TODAY',
      iconBg: 'bg-[#ECFDF5]',
      iconColor: 'text-[#00B67A]',
      icon: (
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
      ),
    },
    {
      label: 'Check Out',
      value: formatTimeLabel(checkOut, timeZone),
      sub: 'TODAY',
      iconBg: 'bg-[#FEF2F2]',
      iconColor: 'text-[#EF4444]',
      icon: (
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      ),
    },
    {
      label: 'Working Hours',
      value: workHoursToday,
      sub: 'TODAY',
      iconBg: 'bg-[#EFF6FF]',
      iconColor: 'text-[#136DEC]',
      icon: (
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      label: 'Working Days',
      value: `${workingDaysThisMonth} days`,
      sub: 'THIS MONTH',
      iconBg: 'bg-[#FFF7ED]',
      iconColor: 'text-[#EA580C]',
      icon: (
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
  ]

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-xl border border-border-card bg-surface p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-muted">{stat.label}</p>
              <p className="mt-1 text-xl font-bold text-heading">{stat.value}</p>
              {stat.sub && (
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                  {stat.sub}
                </p>
              )}
            </div>
            <div
              className={cn(
                'flex size-10 items-center justify-center rounded-lg',
                stat.iconBg,
                stat.iconColor,
              )}
            >
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
