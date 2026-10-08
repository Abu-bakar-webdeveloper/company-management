import type { AttendanceDayStatus } from '@/features/attendance/model/types'
import { cn } from '@/shared/lib/cn'

const STATUS_STYLES: Record<AttendanceDayStatus, string> = {
  present: 'bg-[#ECFDF5] text-[#00B67A]',
  late: 'bg-[#FFF7ED] text-[#EA580C]',
  absent: 'bg-[#FEF2F2] text-[#DC2626]',
  on_leave: 'bg-[#EFF6FF] text-[#136DEC]',
  half_day: 'bg-[#F5F3FF] text-[#9333EA]',
  weekend: 'bg-[#F1F5F9] text-[#64748B]',
  holiday: 'bg-[#F1F5F9] text-[#64748B]',
  not_arrived: 'bg-[#FFFBEB] text-[#D97706]',
}

const STATUS_LABELS: Record<AttendanceDayStatus, string> = {
  present: 'PRESENT',
  late: 'LATE',
  absent: 'ABSENT',
  on_leave: 'ON LEAVE',
  half_day: 'HALF DAY',
  weekend: 'WEEKEND',
  holiday: 'HOLIDAY',
  not_arrived: 'NOT ARRIVED',
}

export function AttendanceStatusBadge({ status }: { status: AttendanceDayStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
        STATUS_STYLES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
