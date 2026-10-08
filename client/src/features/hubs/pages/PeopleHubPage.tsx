import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/model/AuthContext'
import { userHasAnyPermission, userHasPermission } from '@/features/auth/model/permissions'
import { attendanceApi } from '@/features/attendance/api/attendanceApi'
import { localDateString, mondayOfWeek } from '@/features/attendance/lib/attendance-utils'
import type { AttendanceDayStatus } from '@/features/attendance/model/types'
import { WorkRhythmHeatmap } from '@/features/attendance/ui/WorkRhythmHeatmap'
import { TeamWorkloadChart } from '@/features/dashboard/ui/TeamWorkloadChart'
import { useEmployeesList } from '@/features/employees/hooks/useEmployees'
import { HubBreakdownCard } from '@/features/hubs/ui/HubBreakdownCard'
import { HubDecisionCard } from '@/features/hubs/ui/HubDecisionCard'
// import { HubModulesGrid } from '@/features/hubs/ui/HubModulesGrid'
import { HubPageHeader } from '@/features/hubs/ui/HubPageHeader'
import { HubPageSkeleton } from '@/features/hubs/ui/HubPageSkeleton'
import { HubStatsRow, type HubStatCard } from '@/features/hubs/ui/HubStatsRow'
import {
  HubCheckIcon,
  HubClockIcon,
  HubUsersIcon,
  HubWarningIcon,
} from '@/features/hubs/ui/hubIcons'
import { leaveApi } from '@/features/leave/api/leaveApi'
import { formatLeaveDateRange } from '@/features/leave/lib/leave-utils'
import { performanceApi } from '@/features/performance/api/performanceApi'
import { PerformanceTrendChart } from '@/features/performance/ui/PerformanceTrendChart'
import { useTeamMembers } from '@/features/team/hooks/useTeam'
import { getErrorMessage } from '@/shared/api/errors'
import { queryKeys } from '@/shared/api/queryKeys'
import { Card } from '@/shared/ui/Card'

const ATTENDANCE_STATUS_LABEL: Record<AttendanceDayStatus, string> = {
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
  on_leave: 'On leave',
  half_day: 'Half day',
  weekend: 'Weekend',
  holiday: 'Holiday',
  not_arrived: 'Not arrived',
}

const ATTENDANCE_STATUS_COLOR: Record<AttendanceDayStatus, string> = {
  present: '#00B67A',
  late: '#F59E0B',
  absent: '#DC2626',
  on_leave: '#7C3AED',
  half_day: '#1877F2',
  weekend: '#94A3B8',
  holiday: '#94A3B8',
  not_arrived: '#F59E0B',
}

function resolveLeaveScope(
  user: NonNullable<ReturnType<typeof useAuth>['user']>,
): 'mine' | 'team' | 'company' {
  if (userHasPermission(user, 'leave:manage')) return 'company'
  if (userHasPermission(user, 'leave:approve')) return 'team'
  return 'mine'
}

function resolveAttendanceScope(
  user: NonNullable<ReturnType<typeof useAuth>['user']>,
): 'team' | 'company' | null {
  if (userHasPermission(user, 'attendance:manage')) return 'company'
  if (userHasPermission(user, 'attendance:team')) return 'team'
  return null
}

export function PeopleHubPage() {
  const { user } = useAuth()

  const canEmployees = Boolean(user && userHasPermission(user, 'employees:read'))
  const canTeam = Boolean(user && userHasPermission(user, 'team:read'))
  const canAttendanceTeam = Boolean(
    user && userHasAnyPermission(user, ['attendance:manage', 'attendance:team']),
  )
  const canAttendanceSelf = Boolean(user && userHasPermission(user, 'attendance:self'))
  const isAttendanceSelfOnly = canAttendanceSelf && !canAttendanceTeam
  const canLeave = Boolean(
    user && userHasAnyPermission(user, ['leave:manage', 'leave:approve', 'leave:request']),
  )
  const canLeaveApprove = Boolean(
    user && userHasAnyPermission(user, ['leave:manage', 'leave:approve']),
  )
  const canPerformance = Boolean(user && userHasPermission(user, 'performance:read'))
  const isSelfPeopleView = Boolean(
    user &&
      (user.role === 'employee' ||
        (!canAttendanceTeam && !canLeaveApprove && !canEmployees && !canTeam)),
  )

  const leaveScope = user ? resolveLeaveScope(user) : 'mine'
  const attendanceScope = user ? resolveAttendanceScope(user) : null
  const [weekFrom, setWeekFrom] = useState(() => mondayOfWeek(localDateString()))

  const employees = useEmployeesList({ page: 1, limit: 1 })
  const team = useTeamMembers()

  const attendance = useQuery({
    queryKey: queryKeys.attendance.dashboard({
      scope: attendanceScope ?? 'team',
      weekFrom,
    }),
    queryFn: () =>
      attendanceApi.getDashboard({
        scope: attendanceScope ?? 'team',
        weekFrom,
      }),
    enabled: Boolean(attendanceScope),
  })

  const todaySession = useQuery({
    queryKey: queryKeys.attendance.today(),
    queryFn: () => attendanceApi.getToday(),
    enabled: isAttendanceSelfOnly,
  })

  const leaveStats = useQuery({
    queryKey: queryKeys.leaves.stats(leaveScope),
    queryFn: () => leaveApi.getRequestStats(leaveScope),
    enabled: canLeave,
  })

  const leaveRequests = useQuery({
    queryKey: queryKeys.leaves.requests({
      scope: leaveScope,
      status: isSelfPeopleView ? 'pending_all' : 'pending',
      limit: 5,
    }),
    queryFn: async () => {
      if (!isSelfPeopleView) {
        return leaveApi.listRequests({ scope: leaveScope, status: 'pending', limit: 5 })
      }
      const [actionable, overdue] = await Promise.all([
        leaveApi.listRequests({ scope: leaveScope, status: 'pending', limit: 5 }),
        leaveApi.listRequests({ scope: leaveScope, status: 'overdue', limit: 5 }),
      ])
      return [...overdue, ...actionable].slice(0, 5)
    },
    enabled: canLeave,
  })

  const performanceStats = useQuery({
    queryKey: ['performance', 'hub-stats', user?.role ?? 'anon'],
    queryFn: () => performanceApi.getStats(),
    enabled: canPerformance,
  })

  // Don't block first paint on performance stats — those cards fill in progressively.
  const loading =
    (canEmployees && employees.isLoading) ||
    (canTeam && !canEmployees && team.isLoading) ||
    (Boolean(attendanceScope) && attendance.isLoading) ||
    (isAttendanceSelfOnly && todaySession.isLoading) ||
    (canLeave && (leaveStats.isLoading || leaveRequests.isLoading))

  const stats = useMemo((): HubStatCard[] => {
    const cards: HubStatCard[] = []
    const att = attendance.data?.stats
    const leave = leaveStats.data
    const perf = performanceStats.data
    const employeeTotal = employees.data?.pagination.total
    const teamTotal = team.data?.members.length
    const session = todaySession.data

    if (canEmployees) {
      cards.push({
        id: 'employees',
        label: 'Employees',
        value: employeeTotal != null ? String(employeeTotal) : '—',
        hint: employeeTotal != null ? 'Active workforce' : 'Loading…',
        hintClass: 'text-primary',
        icon: <HubUsersIcon />,
        iconBg: 'bg-[#EFF6FF] text-primary',
        border: 'border-primary-muted',
      })
    } else if (canTeam) {
      cards.push({
        id: 'team',
        label: 'My team',
        value: teamTotal != null ? String(teamTotal).padStart(2, '0') : '—',
        hint: teamTotal != null ? 'Direct reports' : 'Loading…',
        hintClass: 'text-primary',
        icon: <HubUsersIcon />,
        iconBg: 'bg-[#EFF6FF] text-primary',
        border: 'border-primary-muted',
      })
    }

    if (canAttendanceTeam) {
      const present = att?.present
      cards.push({
        id: 'present',
        label: canTeam || attendanceScope === 'team' ? 'Team present' : 'Present today',
        value: present != null ? String(present).padStart(2, '0') : '—',
        hint:
          att != null
            ? att.onLeave > 0
              ? `${att.onLeave} on leave`
              : 'Attendance looking healthy'
            : 'Today',
        hintClass: att && att.absent > 0 ? 'text-[#D97706]' : 'text-[#00B67A]',
        icon: <HubCheckIcon />,
        iconBg: 'bg-[#ECFDF5] text-[#00B67A]',
        border: 'border-[#A7F3D0]',
      })
    } else if (isAttendanceSelfOnly) {
      const status = session?.status
      const label = status ? ATTENDANCE_STATUS_LABEL[status] : '—'
      cards.push({
        id: 'present',
        label: 'My status today',
        value: label,
        hint: session?.workHoursLabel
          ? `${session.workHoursLabel} worked`
          : session
            ? 'Your attendance today'
            : 'Today',
        hintClass:
          status === 'absent' || status === 'late' ? 'text-[#D97706]' : 'text-[#00B67A]',
        icon: <HubCheckIcon />,
        iconBg: 'bg-[#ECFDF5] text-[#00B67A]',
        border: 'border-[#A7F3D0]',
      })
    }

    if (canLeave) {
      const pending = leave?.pending
      const overdue = leave?.overdue ?? 0
      const myOpen = pending != null ? pending + overdue : null
      const displayCount = canLeaveApprove ? pending : myOpen
      cards.push({
        id: 'leave',
        label: canLeaveApprove ? 'Pending leave' : 'My pending leave',
        value: displayCount != null ? String(displayCount).padStart(2, '0') : '—',
        hint:
          displayCount != null && displayCount > 0
            ? canLeaveApprove
              ? overdue > 0
                ? `${pending} to review · ${overdue} overdue`
                : 'Needs manager follow-up'
              : overdue > 0
                ? 'Includes overdue requests'
                : 'Awaiting approval'
            : 'All caught up',
        hintClass: displayCount != null && displayCount > 0 ? 'text-[#D97706]' : 'text-[#00B67A]',
        icon: <HubClockIcon />,
        iconBg: 'bg-[#FFF7ED] text-[#F59E0B]',
        border: 'border-[#FDE68A]',
      })
    }

    if (canPerformance) {
      const reviewsDue = perf?.reviewsDue
      cards.push({
        id: 'reviews',
        label: isSelfPeopleView ? 'My review' : 'Reviews due',
        value:
          isSelfPeopleView && perf
            ? perf.avgRating > 0
              ? perf.avgRating.toFixed(1)
              : reviewsDue != null && reviewsDue > 0
                ? 'Due'
                : '—'
            : reviewsDue != null
              ? String(reviewsDue).padStart(2, '0')
              : '—',
        hint:
          perf != null
            ? isSelfPeopleView
              ? perf.avgRating > 0
                ? 'Latest rating'
                : reviewsDue != null && reviewsDue > 0
                  ? 'Review not submitted yet'
                  : 'No rating this period'
              : perf.lowPerformance > 0
                ? `${perf.lowPerformance} at risk`
                : `Avg rating ${perf.avgRating.toFixed(1)}`
            : 'Performance',
        hintClass:
          reviewsDue != null && reviewsDue > 0 ? 'text-[#DC2626]' : 'text-text-muted',
        icon: <HubWarningIcon />,
        iconBg: 'bg-[#FEF2F2] text-[#DC2626]',
        border: 'border-[#DC262633]',
      })
    }

    return cards.slice(0, 4)
  }, [
    canEmployees,
    canTeam,
    canAttendanceTeam,
    isAttendanceSelfOnly,
    canLeave,
    canLeaveApprove,
    canPerformance,
    isSelfPeopleView,
    attendanceScope,
    employees.data,
    team.data,
    attendance.data,
    todaySession.data,
    leaveStats.data,
    performanceStats.data,
  ])

  const attendanceBreakdown = useMemo(() => {
    if (isAttendanceSelfOnly) {
      const session = todaySession.data
      if (!session) return []
      const status = session.status
      const expectedMinutes = 8 * 60
      const hoursPercent = Math.min(
        100,
        Math.round((session.totalWorkMinutes / expectedMinutes) * 100),
      )
      return [
        {
          id: 'status',
          label: 'Status',
          value: ATTENDANCE_STATUS_LABEL[status],
          percent: 100,
          color: ATTENDANCE_STATUS_COLOR[status],
        },
        {
          id: 'hours',
          label: 'Hours worked',
          value: session.workHoursLabel || '0h',
          percent: hoursPercent,
          color: '#136DEC',
        },
      ]
    }

    const att = attendance.data?.stats
    if (!att) return []
    const total = Math.max(att.totalEmployees, 1)
    return [
      {
        id: 'present',
        label: 'Present',
        value: att.present,
        percent: (att.present / total) * 100,
        color: '#00B67A',
      },
      {
        id: 'late',
        label: 'Late',
        value: att.late,
        percent: (att.late / total) * 100,
        color: '#F59E0B',
      },
      {
        id: 'absent',
        label: 'Absent',
        value: att.absent,
        percent: (att.absent / total) * 100,
        color: '#DC2626',
      },
      {
        id: 'onLeave',
        label: 'On leave',
        value: att.onLeave,
        percent: (att.onLeave / total) * 100,
        color: '#7C3AED',
      },
    ]
  }, [attendance.data, isAttendanceSelfOnly, todaySession.data])

  const leaveBreakdown = useMemo(() => {
    const leave = leaveStats.data
    if (!leave || leave.total === 0) return []
    const total = Math.max(leave.total, 1)
    return [
      {
        id: 'pending',
        label: 'Pending',
        value: leave.pending,
        percent: (leave.pending / total) * 100,
        color: '#F59E0B',
      },
      {
        id: 'overdue',
        label: 'Overdue',
        value: leave.overdue,
        percent: (leave.overdue / total) * 100,
        color: '#DC2626',
      },
      {
        id: 'approved',
        label: 'Approved',
        value: leave.approved,
        percent: (leave.approved / total) * 100,
        color: '#00B67A',
      },
      {
        id: 'rejected',
        label: 'Rejected',
        value: leave.rejected,
        percent: (leave.rejected / total) * 100,
        color: '#64748B',
      },
      {
        id: 'onLeave',
        label: 'Currently on leave',
        value: leave.currentlyOnLeave,
        percent: (leave.currentlyOnLeave / total) * 100,
        color: '#1877F2',
      },
    ].filter((item) => item.id === 'onLeave' || item.value > 0)
  }, [leaveStats.data])

  const pendingLeaveItems = useMemo(
    () =>
      (leaveRequests.data ?? []).slice(0, 5).map((req) => ({
        id: req.id,
        title: isSelfPeopleView ? req.leaveTypeName : req.employeeName,
        subtitle: isSelfPeopleView
          ? formatLeaveDateRange(req.startDate, req.endDate)
          : `${req.leaveTypeName} · ${formatLeaveDateRange(req.startDate, req.endDate)}`,
        meta: req.isOverdue ? 'Overdue' : `${req.durationDays}d`,
        metaClass: req.isOverdue
          ? 'text-sm font-bold text-[#DC2626]'
          : 'text-sm font-bold text-[#D97706]',
        href: `/leave/requests/${req.id}`,
        avatarName: req.employeeName,
        avatarUrl: req.avatar,
      })),
    [leaveRequests.data, isSelfPeopleView],
  )

  const performanceItems = useMemo(() => {
    const perf = performanceStats.data
    if (!perf) return []
    const items = []
    if (!isSelfPeopleView && perf.topPerformer && perf.topPerformer !== '—') {
      items.push({
        id: 'top',
        title: perf.topPerformer,
        subtitle: 'Top performer this period',
        meta: perf.avgRating > 0 ? `${perf.avgRating.toFixed(1)} avg` : 'MVP',
        metaClass: 'text-sm font-bold text-[#7C3AED]',
        href: '/performance',
      })
    }
    if (isSelfPeopleView && perf.avgRating > 0) {
      items.push({
        id: 'rating',
        title: `Rating ${perf.avgRating.toFixed(1)}`,
        subtitle: 'Your performance this period',
        meta: perf.avgRating >= 4 ? 'Strong' : 'Review',
        metaClass: 'text-sm font-bold text-[#7C3AED]',
        href: '/performance',
      })
    }
    if (perf.reviewsDue > 0) {
      items.push({
        id: 'due',
        title: isSelfPeopleView
          ? 'Your review is due'
          : `${perf.reviewsDue} reviews due`,
        subtitle: isSelfPeopleView ? 'Waiting on manager feedback' : 'Needs manager follow-up',
        meta: 'Urgent',
        metaClass: 'text-sm font-bold text-[#D97706]',
        href: '/performance',
      })
    }
    if (!isSelfPeopleView && perf.lowPerformance > 0) {
      items.push({
        id: 'risk',
        title: `${perf.lowPerformance} at risk`,
        subtitle: 'Needs improvement / critical',
        meta: 'Attention',
        metaClass: 'text-sm font-bold text-[#DC2626]',
        href: '/performance',
      })
    }
    return items
  }, [performanceStats.data, isSelfPeopleView])

  if (loading) return <HubPageSkeleton />

  const error =
    (canEmployees && employees.isError) ||
    (canTeam && !canEmployees && team.isError) ||
    (Boolean(attendanceScope) && attendance.isError) ||
    (isAttendanceSelfOnly && todaySession.isError) ||
    (canLeave && leaveStats.isError) ||
    (canPerformance && performanceStats.isError)
      ? getErrorMessage(
          (canEmployees ? employees.error : null) ??
            (canTeam && !canEmployees ? team.error : null) ??
            (attendanceScope ? attendance.error : null) ??
            (isAttendanceSelfOnly ? todaySession.error : null) ??
            leaveStats.error ??
            performanceStats.error,
          'Some people data could not be loaded.',
        )
      : null

  const attendanceTitle = isAttendanceSelfOnly
    ? 'My attendance today'
    : attendanceScope === 'team'
      ? 'Team attendance today'
      : 'Attendance today'

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <HubPageHeader
        title="Workforce"
        subtitle={
          isSelfPeopleView
            ? 'Your leave, attendance, and performance at a glance.'
            : canTeam || attendanceScope === 'team'
              ? "Your team's health, leave coverage, and who needs action today."
              : 'Workforce health, leave coverage, and who needs action today.'
        }
      />

      {/* <HubModulesGrid modules={modules} /> */}

      {error ? (
        <Card className="mb-6 border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 text-sm text-[#92400E]">
          {error}
        </Card>
      ) : null}

      <HubStatsRow cards={stats} />

      <div className="flex flex-col gap-6">
        {/* Above fold: one primary chart + one decision column */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr]">
          {canAttendanceTeam && attendance.data ? (
            <WorkRhythmHeatmap
              cells={attendance.data.workRhythm}
              weekFrom={attendance.data.weekFrom ?? weekFrom}
              onWeekChange={(value) => setWeekFrom(mondayOfWeek(value))}
            />
          ) : (canAttendanceTeam || isAttendanceSelfOnly) ? (
            <HubBreakdownCard
              title={attendanceTitle}
              items={attendanceBreakdown}
              empty="No attendance yet"
              emptyDescription="Attendance for today will show up here as the team clocks in."
              actionTo={canAttendanceTeam ? '/attendance' : '/my-attendance'}
              actionLabel="Open attendance"
            />
          ) : canLeave ? (
            <HubBreakdownCard
              title={canLeaveApprove ? 'Leave requests' : 'My leave requests'}
              items={leaveBreakdown}
              empty="No leave requests yet"
              actionTo="/leave"
              actionLabel="Open leave"
            />
          ) : null}

          {canLeave ? (
            <HubDecisionCard
              title={canLeaveApprove ? 'Pending leave' : 'My pending leave'}
              empty="No pending leave requests"
              items={pendingLeaveItems}
              actionTo="/leave"
            />
          ) : canPerformance ? (
            <HubDecisionCard
              title={isSelfPeopleView ? 'My performance' : 'Performance spotlight'}
              empty="No performance signals this period"
              items={performanceItems}
              actionTo="/performance"
              actionLabel="Open performance"
            />
          ) : null}
        </div>

        {/* Secondary decisions / breakdowns */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {canLeave && canAttendanceTeam && (
            <HubBreakdownCard
              title={canLeaveApprove ? 'Leave requests' : 'My leave requests'}
              items={leaveBreakdown}
              empty="No leave requests yet"
              emptyDescription="Leave request status will show up here once people submit requests."
              actionTo="/leave"
              actionLabel="Open leave"
            />
          )}
          {canPerformance && canLeave && (
            <HubDecisionCard
              title={isSelfPeopleView ? 'My performance' : 'Performance spotlight'}
              empty="No performance signals this period"
              items={performanceItems}
              actionTo="/performance"
              actionLabel="Open performance"
            />
          )}
        </div>

        {/* Insights: secondary charts */}
        {canAttendanceTeam && attendance.data ? (
          <section aria-label="Workforce insights">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">
              Insights
            </h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <HubBreakdownCard
                title="Clock-in status"
                items={
                  attendance.data
                    ? [
                        {
                          id: 'onTime',
                          label: 'On time',
                          value: attendance.data.clockInStatus.onTime,
                          percent: attendance.data.clockInStatus.onTimePercent,
                          color: '#00B67A',
                        },
                        {
                          id: 'late',
                          label: 'Late',
                          value: attendance.data.clockInStatus.late,
                          percent:
                            attendance.data.stats.totalEmployees > 0
                              ? (attendance.data.clockInStatus.late /
                                  attendance.data.stats.totalEmployees) *
                                100
                              : 0,
                          color: '#EF4444',
                        },
                        {
                          id: 'notArrived',
                          label: 'Not arrived',
                          value: attendance.data.clockInStatus.notArrived,
                          percent:
                            attendance.data.stats.totalEmployees > 0
                              ? (attendance.data.clockInStatus.notArrived /
                                  attendance.data.stats.totalEmployees) *
                                100
                              : 0,
                          color: '#F59E0B',
                        },
                      ].filter((item) => Number(item.value) > 0)
                    : []
                }
                empty="No clock-in data yet"
                variant="donut"
                centerLabel={
                  attendance.data
                    ? `${attendance.data.clockInStatus.onTimePercent}%`
                    : undefined
                }
                centerSubLabel="On time"
                actionTo="/attendance"
              />
              {canPerformance && !isSelfPeopleView ? (
                <PerformanceTrendChart
                  data={performanceStats.data?.monthlyTrendData ?? []}
                  title="Company score trend"
                  compact
                  actionTo="/performance"
                />
              ) : canTeam ? (
                <TeamWorkloadChart />
              ) : null}
            </div>
            {canPerformance && !isSelfPeopleView && canTeam ? (
              <div className="mt-4">
                <TeamWorkloadChart />
              </div>
            ) : null}
          </section>
        ) : canPerformance && !isSelfPeopleView ? (
          <section aria-label="Workforce insights">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">
              Insights
            </h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <PerformanceTrendChart
                data={performanceStats.data?.monthlyTrendData ?? []}
                title="Company score trend"
                compact
                actionTo="/performance"
              />
              {canTeam ? <TeamWorkloadChart /> : null}
            </div>
          </section>
        ) : canTeam ? (
          <section aria-label="Workforce insights">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">
              Insights
            </h2>
            <TeamWorkloadChart />
          </section>
        ) : null}
      </div>
    </div>
  )
}
