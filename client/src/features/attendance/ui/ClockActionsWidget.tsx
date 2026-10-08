import { toast } from 'sonner'
import { usePunch, useTodaySession } from '@/features/attendance/hooks/useAttendance'
import { formatTimeLabel } from '@/features/attendance/lib/attendance-utils'
import { capturePunchLocation } from '@/features/attendance/lib/punch-location'
import { useAuth } from '@/features/auth/model/AuthContext'
import { userHasPermission } from '@/features/auth/model/permissions'
import { getErrorMessage } from '@/shared/api/errors'
import { cn } from '@/shared/lib/cn'

type ClockActionsWidgetProps = {
  className?: string
}

export function ClockActionsWidget({ className }: ClockActionsWidgetProps) {
  const { user } = useAuth()
  const canPunch = !!user && userHasPermission(user, 'attendance:self')
  const sessionQuery = useTodaySession({ enabled: canPunch })
  const punch = usePunch()
  const session = sessionQuery.data
  const firstName = user?.fullName?.split(' ')[0] ?? 'there'

  if (!canPunch) return null

  const onPunch = async (type: 'clock_in' | 'break_start' | 'break_end' | 'clock_out') => {
    try {
      const captured = await capturePunchLocation()
      const result = await punch.mutateAsync({
        type,
        location: captured.location,
      })

      toast.success(
        type === 'clock_in'
          ? 'Clocked in'
          : type === 'clock_out'
            ? 'Clocked out'
            : type === 'break_start'
              ? 'Break started'
              : 'Break ended',
      )

      if (captured.missing) {
        toast.message('Location not shared', {
          description: 'HR can still see device/IP context for this punch.',
        })
      } else if (result.lastPunchLocation?.status === 'remote') {
        const site = result.lastPunchLocation.nearestSiteName
        toast.message('Recorded as remote', {
          description: site
            ? `Outside ${site}. Punch still counted.`
            : 'Outside configured office sites. Punch still counted.',
        })
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to record punch'))
    }
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-border-card bg-surface px-4 py-3 shadow-sm',
        className,
      )}
    >
      <p className="text-sm font-semibold text-heading">
        Welcome Back {firstName}{' '}
        <span aria-hidden>👋</span>
      </p>
      <p className="mt-0.5 text-xs text-text-muted" aria-live="polite">
        {sessionQuery.isLoading
          ? 'Loading…'
          : session?.sessionState === 'working'
            ? `Working · in at ${formatTimeLabel(session.clockInAt, session.timezone)}`
            : session?.sessionState === 'on_break'
              ? 'On break'
              : session?.sessionState === 'clocked_out'
                ? `Done · ${session.workHoursLabel}`
                : 'Not clocked in'}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          title="Clock in"
          aria-label="Clock in"
          disabled={!session?.canClockIn || punch.isPending}
          onClick={() => onPunch('clock_in')}
          className="flex size-10 items-center justify-center rounded-full bg-[#136DEC] text-white disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
        </button>
        <button
          type="button"
          title={session?.sessionState === 'on_break' ? 'End break' : 'Start break'}
          aria-label={session?.sessionState === 'on_break' ? 'End break' : 'Start break'}
          disabled={
            punch.isPending ||
            (!session?.canBreakStart && !session?.canBreakEnd)
          }
          onClick={() =>
            onPunch(session?.sessionState === 'on_break' ? 'break_end' : 'break_start')
          }
          className="flex size-10 items-center justify-center rounded-full bg-[#F59E0B] text-white disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        </button>
        <button
          type="button"
          title="Clock out"
          aria-label="Clock out"
          disabled={!session?.canClockOut || punch.isPending}
          onClick={() => onPunch('clock_out')}
          className="flex size-10 items-center justify-center rounded-full bg-[#EF4444] text-white disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
