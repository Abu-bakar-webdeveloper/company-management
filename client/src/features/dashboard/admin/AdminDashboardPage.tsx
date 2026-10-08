import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/model/AuthContext'
import {
  companyHubListLabel,
  isCompanyHubEnabled,
} from '@/features/auth/model/companyHubs'
import { userHasAnyPermission, userHasPermission } from '@/features/auth/model/permissions'
import { useSystemPreferences } from '@/features/settings/model/SystemPreferencesContext'
import { AdminStatCardsRowSkeleton } from '@/features/dashboard/ui/DashboardSkeletons'
import { DashboardPageHeader } from '@/features/dashboard/ui/DashboardPageHeader'
import { RecentActivities } from '@/features/dashboard/ui/RecentActivities'
import { expensesApi } from '@/features/expenses/api/expensesApi'
import { formatCurrency, formatExpenseDate } from '@/features/expenses/lib/expense-utils'
import { useEmployeesList } from '@/features/employees/hooks/useEmployees'
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
import { activitiesApi } from '@/features/notifications/api/activitiesApi'
import { toRecentActivityItems } from '@/features/notifications/lib/activity-mappers'
import { performanceApi } from '@/features/performance/api/performanceApi'
import { useProjectStats } from '@/features/projects/hooks/useProjects'
import { formatCompanyMoney } from '@/shared/lib/format'
import { queryKeys } from '@/shared/api/queryKeys'

export function AdminDashboardPage() {
  const { user } = useAuth()
  const { preferences } = useSystemPreferences()
  const firstName = user?.fullName.split(' ')[0] ?? 'Admin'
  const peopleHub = isCompanyHubEnabled(user?.enabledHubs, 'people')
  const workHub = isCompanyHubEnabled(user?.enabledHubs, 'work')
  const financeHub = isCompanyHubEnabled(user?.enabledHubs, 'finance')
  const projectStats = useProjectStats()
  const employees = useEmployeesList({ page: 1, limit: 1 })
  const canReadExpenses = Boolean(user && userHasPermission(user, 'expenses:read'))
  const canPerformance = Boolean(user && userHasPermission(user, 'performance:read'))

  const canLeave = Boolean(
    user && userHasAnyPermission(user, ['leave:manage', 'leave:approve', 'leave:request']),
  )
  const leaveStats = useQuery({
    queryKey: queryKeys.leaves.stats('company'),
    queryFn: () => leaveApi.getRequestStats('company'),
    enabled: canLeave,
  })
  const leavePending = useQuery({
    queryKey: queryKeys.leaves.requests({ scope: 'company', status: 'pending', limit: 5 }),
    queryFn: () => leaveApi.listRequests({ scope: 'company', status: 'pending', limit: 5 }),
    enabled: canLeave,
  })
  const expenseStats = useQuery({
    queryKey: queryKeys.expenses.stats(),
    queryFn: () => expensesApi.getStats(),
    enabled: canReadExpenses,
  })
  const expensePending = useQuery({
    queryKey: queryKeys.expenses.list({ status: 'pending', limit: 5 }),
    queryFn: () => expensesApi.list({ status: 'pending', limit: 5 }),
    enabled: canReadExpenses,
  })
  const performanceStats = useQuery({
    queryKey: ['performance', 'dashboard-stats'],
    queryFn: () => performanceApi.getStats(),
    enabled: canPerformance,
  })
  const activitiesQuery = useQuery({
    queryKey: queryKeys.activities.list({ scope: 'company', limit: 8 }),
    queryFn: () => activitiesApi.list({ scope: 'company', limit: 8 }),
  })
  const activityItems = useMemo(
    () => toRecentActivityItems(activitiesQuery.data?.activities ?? []),
    [activitiesQuery.data?.activities],
  )

  const statsLoading =
    employees.isLoading ||
    projectStats.isLoading ||
    leaveStats.isLoading ||
    (canReadExpenses && expenseStats.isLoading)

  const hubStats = useMemo((): HubStatCard[] => {
    const employeeTotal = employees.data?.pagination.total
    const projects = projectStats.data
    const leave = leaveStats.data
    const expense = expenseStats.data
    const reviewsDue = performanceStats.data?.reviewsDue ?? 0
    const pendingLeave = peopleHub ? (leave?.pending ?? 0) : 0
    const overdueLeave = peopleHub ? (leave?.overdue ?? 0) : 0
    const pendingExpenseClaims = financeHub ? (expensePending.data?.length ?? 0) : 0

    const cards: HubStatCard[] = [
      {
        id: 'employees',
        label: 'Employees',
        value: employeeTotal != null ? String(employeeTotal) : '—',
        hint: employeeTotal != null ? 'Active workforce' : 'Loading…',
        hintClass: 'text-primary',
        icon: <HubUsersIcon />,
        iconBg: 'bg-[#EFF6FF] text-primary',
        border: 'border-primary-muted',
      },
      {
        id: 'projects',
        label: 'Projects active',
        value: projects != null ? String(projects.inProgress) : '—',
        hint: projects != null ? `${projects.total} total` : 'Loading…',
        hintClass: 'text-primary',
        icon: <HubFolderIcon />,
        iconBg: 'bg-[#EFF6FF] text-primary',
        border: 'border-primary-muted',
      },
      {
        id: 'approvals',
        label: 'Pending approvals',
        value: String(pendingLeave + (canReadExpenses ? pendingExpenseClaims : 0)),
        hint: canReadExpenses && peopleHub
          ? `${pendingLeave} leave${overdueLeave > 0 ? ` · ${overdueLeave} overdue` : ''} · ${formatCompanyMoney(expense?.pending ?? 0)} expenses`
          : canReadExpenses
            ? `${formatCompanyMoney(expense?.pending ?? 0)} expenses`
            : overdueLeave > 0
              ? `${pendingLeave} leave pending · ${overdueLeave} overdue`
              : `${pendingLeave} leave pending`,
        hintClass:
          pendingLeave > 0 || overdueLeave > 0 || (expense?.pending ?? 0) > 0
            ? 'text-[#D97706]'
            : 'text-[#00B67A]',
        icon: <HubWarningIcon />,
        iconBg: 'bg-[#FFF7ED] text-[#F59E0B]',
        border: 'border-[#FDE68A]',
      },
      {
        id: 'reviews',
        label: 'Reviews due',
        value: canPerformance ? String(reviewsDue) : '—',
        hint: canPerformance
          ? reviewsDue > 0
            ? 'Needs attention this period'
            : 'All reviews covered'
          : 'Reviews',
        hintClass: reviewsDue > 0 ? 'text-[#D97706]' : 'text-[#00B67A]',
        icon: <HubClockIcon />,
        iconBg: 'bg-[#F5F3FF] text-[#7C3AED]',
        border: 'border-[#DDD6FE]',
      },
    ]

    return cards.filter((card) => {
      if (card.id === 'employees' || card.id === 'reviews') return peopleHub
      if (card.id === 'projects') return workHub
      if (card.id === 'approvals') return peopleHub || financeHub
      return true
    })
  }, [
    employees.data,
    projectStats.data,
    leaveStats.data,
    expenseStats.data,
    expensePending.data,
    performanceStats.data,
    canReadExpenses,
    canPerformance,
    peopleHub,
    workHub,
    financeHub,
  ])

  const decisionItems = useMemo((): HubDecisionItem[] => {
    const items: HubDecisionItem[] = []

    for (const req of peopleHub ? (leavePending.data ?? []) : []) {
      items.push({
        id: `leave-${req.id}`,
        title: req.employeeName,
        subtitle: `${req.leaveTypeName} · ${formatLeaveDateRange(req.startDate, req.endDate)}`,
        meta: 'Leave',
        metaClass: 'text-xs font-semibold text-[#D97706]',
        href: `/leave/requests/${req.id}`,
        avatarName: req.employeeName,
        avatarUrl: req.avatar,
      })
    }

    for (const exp of financeHub ? (expensePending.data ?? []) : []) {
      items.push({
        id: `expense-${exp.id}`,
        title: exp.employeeName ?? exp.title,
        subtitle: `${exp.category} · ${formatExpenseDate(exp.date)}`,
        meta: formatCurrency(exp.amount),
        metaClass: 'text-sm font-bold text-[#D97706]',
        href: `/expenses/${exp.id}`,
        avatarName: exp.employeeName,
        avatarUrl: exp.employeeAvatar,
      })
    }

    const reviewsDue = performanceStats.data?.reviewsDue ?? 0
    if (peopleHub && reviewsDue > 0) {
      items.push({
        id: 'reviews-due',
        title: `${reviewsDue} performance review${reviewsDue === 1 ? '' : 's'} due`,
        subtitle: 'Open reviews to complete them',
        meta: 'Reviews',
        metaClass: 'text-xs font-semibold text-[#7C3AED]',
        href: '/performance',
      })
    }

    return items.slice(0, 8)
  }, [leavePending.data, expensePending.data, performanceStats.data, peopleHub, financeHub])

  return (
    <div className="p-8">
      <DashboardPageHeader
        title="Admin Dashboard"
        subtitle={`Welcome back, ${firstName}. Company snapshot across ${companyHubListLabel(user?.enabledHubs).toLowerCase()}.`}
      />

      {preferences.showQuickStats && (
        <section aria-busy={statsLoading} aria-label={statsLoading ? 'Loading stats' : undefined}>
          {statsLoading ? (
            <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <AdminStatCardsRowSkeleton />
            </div>
          ) : (
            <HubStatsRow cards={hubStats} />
          )}
        </section>
      )}

      <section className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {(peopleHub || financeHub) && (
          <HubDecisionCard
            title="Needs your decision"
            empty={
              peopleHub && financeHub
                ? 'No pending leave, expenses, or reviews right now.'
                : peopleHub
                  ? 'No pending leave or reviews right now.'
                  : 'No pending expenses right now.'
            }
            items={decisionItems}
            actionTo={peopleHub ? '/leave' : '/expenses'}
            actionLabel={peopleHub ? 'Open leave' : 'Open expenses'}
          />
        )}
        <RecentActivities items={activityItems} />
      </section>
    </div>
  )
}
