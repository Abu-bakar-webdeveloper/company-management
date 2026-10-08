import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ClockActionsWidget } from '@/features/attendance'
import { getEmployeeStatCards } from '@/features/dashboard/employee/lib/employeeStatCards'
import { EmployeeActivitiesCard } from '@/features/dashboard/employee/ui/EmployeeActivitiesCard'
import { EmployeePerformanceCard } from '@/features/dashboard/employee/ui/EmployeePerformanceCard'
import { EmployeeLeaveTable } from '@/features/dashboard/employee/ui/EmployeeLeaveTable'
import { EmployeeSummaryStatCard } from '@/features/dashboard/employee/ui/EmployeeSummaryStatCard'
import { TasksStatusDonut } from '@/features/dashboard/employee/ui/TasksStatusDonut'
import { WorkProgressChart } from '@/features/dashboard/employee/ui/WorkProgressChart'
import { useAuth } from '@/features/auth/model/AuthContext'
import { isCompanyHubEnabled } from '@/features/auth/model/companyHubs'
import { userHasPermission } from '@/features/auth/model/permissions'
import { useEmployeeLeaveSummary, useLeaveStats } from '@/features/leave/hooks/useLeave'
import { activitiesApi } from '@/features/notifications/api/activitiesApi'
import { toEmployeeActivityItems } from '@/features/notifications/lib/activity-mappers'
import { usePerformanceSummary } from '@/features/performance/hooks/usePerformanceSummary'
import { useMemberProjects } from '@/features/projects/hooks/useProjects'
import { useSystemPreferences } from '@/features/settings/model/SystemPreferencesContext'
import { useTaskProgress, useTaskStats } from '@/features/tasks/hooks/useTasks'
import { queryKeys } from '@/shared/api/queryKeys'

export function EmployeeDashboardPage() {
  const { user } = useAuth()
  const { preferences } = useSystemPreferences()
  const displayName = user?.fullName ?? 'there'
  const peopleHub = isCompanyHubEnabled(user?.enabledHubs, 'people')
  const workHub = isCompanyHubEnabled(user?.enabledHubs, 'work')
  const taskStats = useTaskStats('mine')
  const leaveStats = useLeaveStats('mine')
  const leaveSummary = useEmployeeLeaveSummary(user?.id)
  const memberProjects = useMemberProjects(user?.id)
  const taskProgress = useTaskProgress('mine')
  const performance = usePerformanceSummary(
    user?.id,
    Boolean(user && userHasPermission(user, 'performance:read')),
  )
  const activitiesQuery = useQuery({
    queryKey: queryKeys.activities.list({ scope: 'me', limit: 8 }),
    queryFn: () => activitiesApi.list({ scope: 'me', limit: 8 }),
  })
  const activityItems = useMemo(
    () => toEmployeeActivityItems(activitiesQuery.data?.activities ?? []),
    [activitiesQuery.data?.activities],
  )

  const statCards = useMemo(() => {
    const hubByCard: Record<string, 'people' | 'work'> = {
      tasks: 'work',
      projects: 'work',
      leave: 'people',
      performance: 'people',
    }
    return getEmployeeStatCards()
      .filter((card) => isCompanyHubEnabled(user?.enabledHubs, hubByCard[card.id] ?? 'people'))
      .map((card) => {
      if (card.id === 'tasks' && taskStats.data) {
        const pending = taskStats.data.total - taskStats.data.completed
        return {
          ...card,
          value: String(Math.max(pending, 0)).padStart(2, '0'),
          valueSuffix: 'Open Tasks',
        }
      }
      if (card.id === 'projects' && memberProjects.data) {
        const active = memberProjects.data.filter((p) => p.status !== 'completed').length
        return {
          ...card,
          value: String(active).padStart(2, '0'),
          valueSuffix: 'Active Projects',
        }
      }
      if (card.id === 'leave') {
        if (leaveSummary.data) {
          return {
            ...card,
            value: String(leaveSummary.data.remainingBalance),
            valueSuffix: 'Days Remaining',
          }
        }
        if (leaveStats.data) {
          return {
            ...card,
            value: String(leaveStats.data.pending).padStart(2, '0'),
            valueSuffix: 'Pending Requests',
          }
        }
      }
      if (card.id === 'performance') {
        const rating = performance.summary?.overallRating
        if (rating != null && rating > 0) {
          return {
            ...card,
            value: `${rating} / 5`,
            valueSuffix: 'Score',
          }
        }
        return {
          ...card,
          value: '0 / 5',
          valueSuffix: 'Score',
        }
      }
      return card
    })
  }, [
    taskStats.data,
    memberProjects.data,
    leaveSummary.data,
    leaveStats.data,
    performance.summary,
    user?.enabledHubs,
  ])

  const progressTrend = useMemo(() => {
    const data = taskProgress.data ?? []
    if (data.length < 2) return undefined
    const prev = data[data.length - 2]?.completed ?? 0
    const curr = data[data.length - 1]?.completed ?? 0
    if (prev === 0) return curr > 0 ? '↑ New' : undefined
    const pct = Math.round(((curr - prev) / prev) * 100)
    return pct >= 0 ? `↑ ${pct}%` : `↓ ${Math.abs(pct)}%`
  }, [taskProgress.data])

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold leading-9 text-[#1E293B] sm:text-[30px]">
            Employee Dashboard
          </h1>
          <p className="mt-1 text-sm leading-6 text-[#64748B] sm:text-base">
            Welcome back, {displayName}.{' '}
            {workHub
              ? "Here's what's happening with your tasks today."
              : "Here's what's happening today."}
          </p>
        </div>
        <ClockActionsWidget className="w-full sm:w-auto sm:min-w-[220px]" />
      </header>

      {preferences.showQuickStats && statCards.length > 0 && (
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <EmployeeSummaryStatCard key={card.id} data={card} />
          ))}
        </section>
      )}

      {preferences.enableCharts && workHub && (
        <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
          <WorkProgressChart
            data={taskProgress.data}
            isLoading={taskProgress.isLoading}
            trend={progressTrend}
          />
          <TasksStatusDonut useLiveTaskStats />
        </section>
      )}

      <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <EmployeeActivitiesCard items={activityItems} />
        {peopleHub && <EmployeePerformanceCard />}
      </section>

      {peopleHub && (
        <section>
          <EmployeeLeaveTable />
        </section>
      )}
    </div>
  )
}
