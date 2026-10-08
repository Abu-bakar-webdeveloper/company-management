import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ClockActionsWidget } from '@/features/attendance'
import { getManagerStatCards } from '@/features/dashboard/manager/lib/managerStatCards'
import { useAuth } from '@/features/auth/model/AuthContext'
import { companyHubListLabel, isCompanyHubEnabled } from '@/features/auth/model/companyHubs'
import { userHasAnyPermission, userHasPermission } from '@/features/auth/model/permissions'
import { useSystemPreferences } from '@/features/settings/model/SystemPreferencesContext'
import { DashboardPageHeader } from '@/features/dashboard/ui/DashboardPageHeader'
import { RecentActivities } from '@/features/dashboard/ui/RecentActivities'
import { HubDecisionCard, type HubDecisionItem } from '@/features/hubs/ui/HubDecisionCard'
import { HubStatsRow, type HubStatCard } from '@/features/hubs/ui/HubStatsRow'
import {
  HubClockIcon,
  HubFolderIcon,
  HubUsersIcon,
  HubWarningIcon,
} from '@/features/hubs/ui/hubIcons'
import { leaveApi } from '@/features/leave/api/leaveApi'
import { formatLeaveDateRange } from '@/features/leave/lib/leave-utils'
import { useLeaveStats } from '@/features/leave/hooks/useLeave'
import { activitiesApi } from '@/features/notifications/api/activitiesApi'
import { toRecentActivityItems } from '@/features/notifications/lib/activity-mappers'
import { performanceApi } from '@/features/performance/api/performanceApi'
import type { PerformanceStats } from '@/features/performance/model/contracts'
import { useProjectStats } from '@/features/projects/hooks/useProjects'
import { useTeamMembers } from '@/features/team/hooks/useTeam'
import { queryKeys } from '@/shared/api/queryKeys'

export function ManagerDashboardPage() {
  const { user } = useAuth()
  const { preferences } = useSystemPreferences()
  const firstName = user?.fullName.split(' ')[0] ?? 'Manager'
  const peopleHub = isCompanyHubEnabled(user?.enabledHubs, 'people')
  const workHub = isCompanyHubEnabled(user?.enabledHubs, 'work')
  const canLeave = Boolean(
    user && userHasAnyPermission(user, ['leave:manage', 'leave:approve', 'leave:request']),
  )
  const canPerformance = Boolean(user && userHasPermission(user, 'performance:read'))
  const leaveStats = useLeaveStats('team')
  const projectStats = useProjectStats()
  const teamMembers = useTeamMembers()
  const activitiesQuery = useQuery({
    queryKey: queryKeys.activities.list({ scope: 'team', limit: 8 }),
    queryFn: () => activitiesApi.list({ scope: 'team', limit: 8 }),
  })
  const activityItems = useMemo(
    () => toRecentActivityItems(activitiesQuery.data?.activities ?? []),
    [activitiesQuery.data?.activities],
  )
  const leavePending = useQuery({
    queryKey: queryKeys.leaves.requests({ scope: 'team', status: 'pending', limit: 8 }),
    queryFn: () => leaveApi.listRequests({ scope: 'team', status: 'pending', limit: 8 }),
    enabled: canLeave,
  })
  const [perfStats, setPerfStats] = useState<PerformanceStats | null>(null)

  useEffect(() => {
    if (!user?.id || !canPerformance) return
    void performanceApi
      .getStats()
      .then(setPerfStats)
      .catch(() => setPerfStats(null))
  }, [user?.id, canPerformance])

  const hubStats = useMemo((): HubStatCard[] => {
    const base = getManagerStatCards()
    const byId = Object.fromEntries(base.map((c) => [c.id, c]))

    const teamCount = teamMembers.data?.members.length
    const projects = projectStats.data
    const leave = leaveStats.data
    const reviewsDue = perfStats?.reviewsDue ?? 0

    return [
      {
        id: 'team',
        label: 'My team',
        value: teamCount != null ? String(teamCount).padStart(2, '0') : '—',
        hint: teamCount != null ? 'Direct reports' : 'Loading…',
        hintClass: 'text-primary',
        icon: <HubUsersIcon />,
        iconBg: 'bg-[#EFF6FF] text-primary',
        border: 'border-primary-muted',
      },
      {
        id: 'projects',
        label: 'Projects active',
        value: projects != null ? String(projects.inProgress).padStart(2, '0') : '—',
        hint: projects != null ? `${projects.total} total` : (byId.projects?.badge ?? ''),
        hintClass: 'text-primary',
        icon: <HubFolderIcon />,
        iconBg: 'bg-[#EFF6FF] text-primary',
        border: 'border-primary-muted',
      },
      {
        id: 'leave',
        label: 'Pending leave',
        value: leave != null ? String(leave.pending).padStart(2, '0') : '—',
        hint:
          leave != null
            ? leave.pending > 0
              ? 'Action required'
              : (leave.overdue ?? 0) > 0
                ? `${leave.overdue} overdue on Leave`
                : 'All clear'
            : 'Team leave',
        hintClass:
          leave && (leave.pending > 0 || (leave.overdue ?? 0) > 0)
            ? 'text-[#D97706]'
            : 'text-[#00B67A]',
        icon: <HubWarningIcon />,
        iconBg: 'bg-[#FFF7ED] text-[#F59E0B]',
        border: 'border-[#FDE68A]',
      },
      {
        id: 'performance',
        label: 'Reviews due',
        value: String(reviewsDue).padStart(2, '0'),
        hint:
          perfStats && perfStats.avgRating > 0
            ? `Team avg ${perfStats.avgRating}/5`
            : 'Team reviews',
        hintClass: reviewsDue > 0 ? 'text-[#D97706]' : 'text-[#00B67A]',
        icon: <HubClockIcon />,
        iconBg: 'bg-[#F5F3FF] text-[#7C3AED]',
        border: 'border-[#DDD6FE]',
      },
    ].filter((card) => {
      if (card.id === 'team' || card.id === 'leave' || card.id === 'performance') return peopleHub
      if (card.id === 'projects') return workHub
      return true
    })
  }, [leaveStats.data, projectStats.data, teamMembers.data, perfStats, peopleHub, workHub])

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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <DashboardPageHeader
          title="Manager Dashboard"
          subtitle={`Welcome back, ${firstName}. Team snapshot across ${companyHubListLabel(user?.enabledHubs).toLowerCase()}.`}
        />
        <ClockActionsWidget className="w-full sm:w-auto sm:min-w-[220px] shrink-0" />
      </div>

      {preferences.showQuickStats && <HubStatsRow cards={hubStats} />}

      <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {peopleHub && (
          <HubDecisionCard
            title="Pending leave"
            empty="No pending leave requests for your team."
            items={decisionItems}
            actionTo="/leave"
            actionLabel="View all"
          />
        )}
        <RecentActivities title="Recent Team Activities" items={activityItems} />
      </section>
    </div>
  )
}
