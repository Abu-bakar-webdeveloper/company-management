import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { HrLeaveRequestsTable } from '@/features/dashboard/hr/ui/HrLeaveRequestsTable'
import { EmployeeActivitiesCard } from '@/features/dashboard/employee/ui/EmployeeActivitiesCard'
import { useAuth } from '@/features/auth/model/AuthContext'
import { isCompanyHubEnabled } from '@/features/auth/model/companyHubs'
import { useEmployeesList } from '@/features/employees/hooks/useEmployees'
import { HubBreakdownCard, type HubBreakdownItem } from '@/features/hubs/ui/HubBreakdownCard'
import { HubDecisionCard, type HubDecisionItem } from '@/features/hubs/ui/HubDecisionCard'
import { HubStatsRow, type HubStatCard } from '@/features/hubs/ui/HubStatsRow'
import {
  HubClockIcon,
  HubUsersIcon,
  HubWarningIcon,
  HubCheckIcon,
} from '@/features/hubs/ui/hubIcons'
import { leaveApi } from '@/features/leave/api/leaveApi'
import { formatLeaveDateRange } from '@/features/leave/lib/leave-utils'
import { useLeaveStats } from '@/features/leave/hooks/useLeave'
import { activitiesApi } from '@/features/notifications/api/activitiesApi'
import { toEmployeeActivityItems } from '@/features/notifications/lib/activity-mappers'
import { useSystemPreferences } from '@/features/settings/model/SystemPreferencesContext'
import { queryKeys } from '@/shared/api/queryKeys'

export function HrDashboardPage() {
  const { user } = useAuth()
  const { preferences } = useSystemPreferences()
  const peopleHub = isCompanyHubEnabled(user?.enabledHubs, 'people')
  const leaveStats = useLeaveStats('company')
  const employees = useEmployeesList({ page: 1, limit: 1 })
  const leavePending = useQuery({
    queryKey: queryKeys.leaves.requests({ scope: 'company', status: 'pending', limit: 8 }),
    queryFn: () => leaveApi.listRequests({ scope: 'company', status: 'pending', limit: 8 }),
    enabled: peopleHub,
  })
  const activitiesQuery = useQuery({
    queryKey: queryKeys.activities.list({ scope: 'company', limit: 8 }),
    queryFn: () => activitiesApi.list({ scope: 'company', limit: 8 }),
  })
  const activityItems = useMemo(
    () => toEmployeeActivityItems(activitiesQuery.data?.activities ?? []),
    [activitiesQuery.data?.activities],
  )

  const hubStats = useMemo((): HubStatCard[] => {
    const employeeTotal = employees.data?.pagination.total
    const onLeave = leaveStats.data?.currentlyOnLeave
    const pending = leaveStats.data?.pending
    const overdue = leaveStats.data?.overdue ?? 0
    const approved = leaveStats.data?.approved

    return [
      {
        id: 'employees',
        label: 'Employees',
        value: employeeTotal != null ? String(employeeTotal).padStart(2, '0') : '—',
        hint: 'Active workforce',
        hintClass: 'text-primary',
        icon: <HubUsersIcon />,
        iconBg: 'bg-[#EFF6FF] text-primary',
        border: 'border-primary-muted',
      },
      {
        id: 'on-leave',
        label: 'Currently on leave',
        value: onLeave != null ? String(onLeave).padStart(2, '0') : '—',
        hint: 'Out today',
        hintClass: 'text-[#7C3AED]',
        icon: <HubClockIcon />,
        iconBg: 'bg-[#F5F3FF] text-[#7C3AED]',
        border: 'border-[#DDD6FE]',
      },
      {
        id: 'pending-leave',
        label: 'Pending leave',
        value: pending != null ? String(pending).padStart(2, '0') : '—',
        hint:
          pending != null && pending > 0
            ? 'Needs approval'
            : overdue > 0
              ? `${overdue} overdue on Leave`
              : 'All clear',
        hintClass:
          (pending != null && pending > 0) || overdue > 0 ? 'text-[#D97706]' : 'text-[#00B67A]',
        icon: <HubWarningIcon />,
        iconBg: 'bg-[#FFF7ED] text-[#F59E0B]',
        border: 'border-[#FDE68A]',
      },
      {
        id: 'approved-leave',
        label: 'Approved leave',
        value: approved != null ? String(approved).padStart(2, '0') : '—',
        hint: 'This period',
        hintClass: 'text-[#00B67A]',
        icon: <HubCheckIcon />,
        iconBg: 'bg-[#ECFDF5] text-[#00B67A]',
        border: 'border-[#A7F3D0]',
      },
    ].filter(() => peopleHub)
  }, [leaveStats.data, employees.data, peopleHub])

  const leaveBreakdown = useMemo((): HubBreakdownItem[] => {
    if (!leaveStats.data || leaveStats.data.total === 0) return []
    const { approved, pending, overdue, rejected, total } = leaveStats.data
    return [
      {
        id: 'approved',
        label: 'Approved',
        value: approved,
        percent: Math.round((approved / total) * 100),
        color: '#00B67A',
      },
      {
        id: 'pending',
        label: 'Pending',
        value: pending,
        percent: Math.round((pending / total) * 100),
        color: '#F59E0B',
      },
      {
        id: 'overdue',
        label: 'Overdue',
        value: overdue,
        percent: Math.round((overdue / total) * 100),
        color: '#DC2626',
      },
      {
        id: 'rejected',
        label: 'Rejected',
        value: rejected,
        percent: Math.round((rejected / total) * 100),
        color: '#64748B',
      },
    ].filter((item) => Number(item.value) > 0)
  }, [leaveStats.data])

  const decisionItems = useMemo((): HubDecisionItem[] => {
    return (leavePending.data ?? []).map((req) => ({
      id: req.id,
      title: req.employeeName,
      subtitle: `${req.leaveTypeName} · ${formatLeaveDateRange(req.startDate, req.endDate)}`,
      meta: 'Pending',
      metaClass: 'text-xs font-semibold text-[#D97706]',
      href: `/leave/requests/${req.id}`,
      avatarName: req.employeeName,
      avatarUrl: req.avatar,
    }))
  }, [leavePending.data])

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-[28px] font-bold leading-9 text-[#1E293B] sm:text-[30px]">HR Dashboard</h1>
        <p className="mt-1 text-sm leading-6 text-[#64748B] sm:text-base">
          Workforce snapshot for today.
        </p>
      </header>

      {preferences.showQuickStats && <HubStatsRow cards={hubStats} />}

      {peopleHub && (
        <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <HubBreakdownCard
            title="Leave status"
            items={leaveBreakdown}
            empty="No leave requests yet"
            actionTo="/leave"
          />
          <HubDecisionCard
            title="Pending leave approvals"
            empty="No pending leave requests."
            items={decisionItems}
            actionTo="/leave"
          />
        </section>
      )}

      <section className="mb-6">
        <EmployeeActivitiesCard title="Recent HR Activities" items={activityItems} />
      </section>

      {peopleHub && (
        <section>
          <HrLeaveRequestsTable />
        </section>
      )}
    </div>
  )
}
