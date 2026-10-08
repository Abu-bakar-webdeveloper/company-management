import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/model/AuthContext'
import {
  canViewContractValue,
  userHasPermission,
} from '@/features/auth/model/permissions'
import { clientsApi } from '@/features/clients/api/clientsApi'
import { ProjectStatusDonut } from '@/features/dashboard/ui/ProjectStatusDonut'
import { ContractValueChart } from '@/features/hubs/ui/ContractValueChart'
import { HubBreakdownCard } from '@/features/hubs/ui/HubBreakdownCard'
import { HubDecisionCard } from '@/features/hubs/ui/HubDecisionCard'
// import { HubModulesGrid } from '@/features/hubs/ui/HubModulesGrid'
import { HubPageHeader } from '@/features/hubs/ui/HubPageHeader'
import { HubPageSkeleton } from '@/features/hubs/ui/HubPageSkeleton'
import { HubStatsRow, type HubStatCard } from '@/features/hubs/ui/HubStatsRow'
import {
  HubClockIcon,
  HubFolderIcon,
  HubWarningIcon,
} from '@/features/hubs/ui/hubIcons'
import { ProjectTimelineCard } from '@/features/hubs/ui/ProjectTimelineCard'
import { TaskCompletionTrendChart } from '@/features/hubs/ui/TaskCompletionTrendChart'
import { projectsApi } from '@/features/projects/api/projectsApi'
import { formatTimelineRange } from '@/features/projects/lib/project-utils'
import { ProjectStatusBadge } from '@/features/projects/ui/ProjectStatusBadge'
import { tasksApi, type TaskStatsScope } from '@/features/tasks/api/tasksApi'
import { getErrorMessage } from '@/shared/api/errors'
import { queryKeys } from '@/shared/api/queryKeys'
import { Card } from '@/shared/ui/Card'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'

function formatDueLabel(dueDate: string): string {
  if (!dueDate) return 'No due date'
  const parsed = Date.parse(dueDate)
  if (Number.isNaN(parsed)) return dueDate
  return new Date(parsed).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

export function WorkHubPage() {
  const { user } = useAuth()

  const canProjects = Boolean(user && userHasPermission(user, 'projects:read'))
  const canTasks = Boolean(user && userHasPermission(user, 'tasks:read'))
  const canClients = Boolean(user && userHasPermission(user, 'clients:read'))
  const showContractValue = canViewContractValue(user?.role)
  const isOrgWorkView = Boolean(user && user.role !== 'employee')
  const taskScope: TaskStatsScope = isOrgWorkView ? 'company' : 'mine'

  const projectStats = useQuery({
    queryKey: queryKeys.projects.stats(),
    queryFn: () => projectsApi.getStats(),
    enabled: canProjects,
  })

  const recentProjects = useQuery({
    queryKey: queryKeys.projects.list({ page: 1, limit: 20 }),
    queryFn: () => projectsApi.listPaginated({ page: 1, limit: 20 }),
    enabled: canProjects,
  })

  const taskStats = useQuery({
    queryKey: queryKeys.tasks.stats(taskScope),
    queryFn: () => tasksApi.getStats(taskScope, undefined, 5),
    enabled: canTasks,
  })

  const milestoneStats = useQuery({
    queryKey: queryKeys.projects.milestoneStats(),
    queryFn: () => projectsApi.getMilestoneStats(5),
    enabled: canProjects && isOrgWorkView,
  })

  const clientStats = useQuery({
    queryKey: queryKeys.clients.stats(),
    queryFn: () => clientsApi.getStats(),
    enabled: canClients && showContractValue,
  })

  const loading =
    (canProjects && (projectStats.isLoading || recentProjects.isLoading)) ||
    (canTasks && taskStats.isLoading) ||
    (canClients && showContractValue && clientStats.isLoading) ||
    (canProjects && isOrgWorkView && milestoneStats.isLoading)

  const stats = useMemo((): HubStatCard[] => {
    const cards: HubStatCard[] = []
    const data = projectStats.data
    const tasks = taskStats.data
    const milestones = milestoneStats.data

    if (canProjects && data && isOrgWorkView) {
      cards.push({
        id: 'total',
        label: 'Total projects',
        value: String(data.total).padStart(2, '0'),
        hint: `${data.inProgress} currently active`,
        hintClass: 'text-primary',
        icon: <HubFolderIcon />,
        iconBg: 'bg-[#EFF6FF] text-primary',
        border: 'border-primary-muted',
      })
      cards.push({
        id: 'delayed',
        label: 'Delayed projects',
        value: String(data.delayed).padStart(2, '0'),
        hint: data.delayed > 0 ? 'Needs attention' : 'On track',
        hintClass: data.delayed > 0 ? 'text-[#DC2626]' : 'text-[#00B67A]',
        icon: <HubWarningIcon />,
        iconBg: 'bg-[#FEF2F2] text-[#DC2626]',
        border: 'border-[#DC262633]',
      })

      if (canTasks && tasks) {
        cards.push({
          id: 'tasksOverdue',
          label: 'Overdue tasks',
          value: String(tasks.overdue).padStart(2, '0'),
          hint:
            tasks.overdue > 0
              ? `${tasks.inProgress} in progress`
              : `${tasks.total} tasks company-wide`,
          hintClass: tasks.overdue > 0 ? 'text-[#DC2626]' : 'text-[#00B67A]',
          icon: <HubClockIcon />,
          iconBg: 'bg-[#FEF2F2] text-[#DC2626]',
          border: 'border-[#DC262633]',
        })
      }

      if (milestones) {
        cards.push({
          id: 'milestonesOverdue',
          label: 'Milestones overdue',
          value: String(milestones.overdue).padStart(2, '0'),
          hint:
            milestones.dueSoon > 0
              ? `${milestones.dueSoon} due in 7 days`
              : milestones.overdue > 0
                ? 'Past due date'
                : 'Delivery dates healthy',
          hintClass:
            milestones.overdue > 0
              ? 'text-[#DC2626]'
              : milestones.dueSoon > 0
                ? 'text-[#D97706]'
                : 'text-[#00B67A]',
          icon: <HubFolderIcon />,
          iconBg: 'bg-[#FFF7ED] text-[#F59E0B]',
          border: 'border-[#FDE68A]',
        })
      }
    } else if (canProjects && data) {
      cards.push(
        {
          id: 'total',
          label: 'Total projects',
          value: String(data.total).padStart(2, '0'),
          hint: `${data.inProgress} currently active`,
          hintClass: 'text-primary',
          icon: <HubFolderIcon />,
          iconBg: 'bg-[#EFF6FF] text-primary',
          border: 'border-primary-muted',
        },
        {
          id: 'delayed',
          label: 'Delayed',
          value: String(data.delayed).padStart(2, '0'),
          hint: data.delayed > 0 ? 'Needs attention' : 'On track',
          hintClass: data.delayed > 0 ? 'text-[#DC2626]' : 'text-[#00B67A]',
          icon: <HubWarningIcon />,
          iconBg: 'bg-[#FEF2F2] text-[#DC2626]',
          border: 'border-[#DC262633]',
        },
      )
    } else if (canTasks && tasks) {
      cards.push(
        {
          id: 'tasksTotal',
          label: 'My tasks',
          value: String(tasks.total).padStart(2, '0'),
          hint: `${tasks.inProgress} in progress`,
          hintClass: 'text-primary',
          icon: <HubFolderIcon />,
          iconBg: 'bg-[#EFF6FF] text-primary',
          border: 'border-primary-muted',
        },
        {
          id: 'tasksOverdue',
          label: 'Overdue',
          value: String(tasks.overdue).padStart(2, '0'),
          hint: tasks.overdue > 0 ? 'Needs attention' : 'All on time',
          hintClass: tasks.overdue > 0 ? 'text-[#DC2626]' : 'text-[#00B67A]',
          icon: <HubWarningIcon />,
          iconBg: 'bg-[#FEF2F2] text-[#DC2626]',
          border: 'border-[#DC262633]',
        },
      )
    }

    return cards.slice(0, 4)
  }, [
    canProjects,
    canTasks,
    isOrgWorkView,
    projectStats.data,
    taskStats.data,
    milestoneStats.data,
  ])

  const projectBreakdown = useMemo(() => {
    const data = projectStats.data
    if (!data || data.total === 0) return []
    const total = Math.max(data.total, 1)
    return [
      {
        id: 'inProgress',
        label: 'In progress',
        value: data.inProgress,
        percent: (data.inProgress / total) * 100,
        color: '#1877F2',
      },
      {
        id: 'completed',
        label: 'Completed',
        value: data.completed,
        percent: (data.completed / total) * 100,
        color: '#00B67A',
      },
      {
        id: 'delayed',
        label: 'Delayed',
        value: data.delayed,
        percent: (data.delayed / total) * 100,
        color: '#FF5C00',
      },
    ]
  }, [projectStats.data])

  const taskBreakdown = useMemo(() => {
    const tasks = taskStats.data
    if (!tasks || tasks.total === 0) return []
    const other = Math.max(0, tasks.total - tasks.completed - tasks.inProgress)
    const total = Math.max(tasks.total, 1)
    return [
      {
        id: 'done',
        label: 'Done',
        value: tasks.completed,
        percent: (tasks.completed / total) * 100,
        color: '#00B67A',
      },
      {
        id: 'active',
        label: 'In progress',
        value: tasks.inProgress,
        percent: (tasks.inProgress / total) * 100,
        color: '#1877F2',
      },
      {
        id: 'other',
        label: 'Other open',
        value: other,
        percent: (other / total) * 100,
        color: '#94A3B8',
      },
    ].filter((item) => Number(item.value) > 0)
  }, [taskStats.data])

  const projects = recentProjects.data?.projects ?? []

  const delayedItems = useMemo(
    () =>
      projects
        .filter((p) => p.status === 'delayed')
        .slice(0, 5)
        .map((project) => ({
          id: project.id,
          title: project.name,
          subtitle: formatTimelineRange(project.startDate, project.endDate),
          meta: 'Delayed',
          metaClass: 'text-sm font-bold text-[#DC2626]',
          badge: <ProjectStatusBadge status={project.status} />,
          href: `/projects/${project.id}`,
        })),
    [projects],
  )

  const overdueTaskItems = useMemo(
    () =>
      (taskStats.data?.overdueItems ?? []).slice(0, 5).map((task) => ({
        id: task.id,
        title: task.title,
        subtitle: task.projectName,
        meta: formatDueLabel(task.dueDate),
        metaClass: 'text-sm font-bold text-[#DC2626]',
        href: `/projects/${task.projectId}`,
      })),
    [taskStats.data],
  )

  const overdueMilestoneItems = useMemo(
    () =>
      (milestoneStats.data?.overdueItems ?? []).slice(0, 5).map((milestone) => ({
        id: milestone.id,
        title: milestone.title,
        subtitle: milestone.projectName,
        meta: formatDueLabel(milestone.dueDate),
        metaClass: 'text-sm font-bold text-[#DC2626]',
        href: `/projects/${milestone.projectId}?tab=milestones`,
      })),
    [milestoneStats.data],
  )

  if (loading) return <HubPageSkeleton />

  const error =
    projectStats.isError ||
    clientStats.isError ||
    taskStats.isError ||
    milestoneStats.isError
      ? getErrorMessage(
          projectStats.error ??
            clientStats.error ??
            taskStats.error ??
            milestoneStats.error,
          'Delivery hub data could not be loaded.',
        )
      : null

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <HubPageHeader
        title="Delivery"
        subtitle={
          isOrgWorkView
            ? 'Delivery health across projects, tasks, and milestones.'
            : 'Delivery health across projects and tasks.'
        }
      />

      {/* <HubModulesGrid modules={modules} /> */}

      {error ? (
        <Card className="mb-6 border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 text-sm text-[#92400E]">
          {error}
        </Card>
      ) : null}

      <HubStatsRow cards={stats} />

      <div className="flex flex-col gap-4 sm:gap-6">
        {canProjects ? (
          <>
            <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
              <ProjectStatusDonut />
              <HubDecisionCard
                title="Needs attention"
                empty="No delayed projects"
                emptyDescription="Delayed projects that need follow-up will show up here."
                items={delayedItems}
                actionTo="/projects"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {canTasks && isOrgWorkView ? (
                <HubDecisionCard
                  title="Overdue tasks"
                  empty="No overdue tasks"
                  items={overdueTaskItems}
                  actionTo="/projects"
                  actionLabel="Open projects"
                />
              ) : canTasks ? (
                <HubBreakdownCard
                  title="My task mix"
                  items={taskBreakdown}
                  empty="No tasks yet"
                  actionTo="/tasks"
                  actionLabel="Open tasks"
                />
              ) : (
                <HubBreakdownCard
                  title="Project mix"
                  items={projectBreakdown}
                  empty="No projects yet"
                  actionTo="/projects"
                  actionLabel="Open projects"
                />
              )}
              {isOrgWorkView && milestoneStats.data ? (
                <HubDecisionCard
                  title="Milestones overdue"
                  empty="No overdue milestones"
                  items={overdueMilestoneItems}
                  actionTo="/projects"
                  actionLabel="Open projects"
                />
              ) : canTasks ? (
                <HubBreakdownCard
                  title="Task status"
                  items={taskBreakdown}
                  empty="No tasks yet"
                  actionTo={isOrgWorkView ? '/projects' : '/tasks'}
                  actionLabel={isOrgWorkView ? 'Open projects' : 'Open tasks'}
                  variant="donut"
                  centerLabel={
                    taskStats.data && taskStats.data.total > 0
                      ? `${Math.round(
                          (taskStats.data.completed / taskStats.data.total) * 100,
                        )}%`
                      : undefined
                  }
                  centerSubLabel="Done"
                />
              ) : null}
            </div>

            <section aria-label="Delivery insights">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">
                Insights
              </h2>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {canClients && showContractValue ? (
                  <ContractValueChart
                    rows={clientStats.data?.topClientsByContractValue ?? []}
                  />
                ) : null}
                <ProjectTimelineCard projects={projects} />
                {canTasks ? (
                  <TaskCompletionTrendChart
                    enabled={canTasks}
                    scope={taskScope}
                    title={isOrgWorkView ? 'Task completion' : 'My task completion'}
                  />
                ) : null}
                {isOrgWorkView && canTasks && milestoneStats.data ? (
                  <HubBreakdownCard
                    title="Task status"
                    items={taskBreakdown}
                    empty="No tasks yet"
                    actionTo="/projects"
                    actionLabel="Open projects"
                    variant="donut"
                    centerLabel={
                      taskStats.data && taskStats.data.total > 0
                        ? `${Math.round(
                            (taskStats.data.completed / taskStats.data.total) * 100,
                          )}%`
                        : undefined
                    }
                    centerSubLabel="Done"
                  />
                ) : null}
              </div>
            </section>
          </>
        ) : (
          <Card className="p-4 sm:p-6">
            <h3 className="mb-4 text-base font-bold text-heading sm:text-lg">Delivery modules</h3>
            <ComingSoonState
              title="No project overview yet"
              description="Use the modules above to open tasks or clients available to your role."
              minHeight="min-h-[180px]"
              compact
            />
          </Card>
        )}
      </div>
    </div>
  )
}
