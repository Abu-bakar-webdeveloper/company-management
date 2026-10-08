import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/model/AuthContext'
import { userHasPermission } from '@/features/auth/model/permissions'
import {
  useDeleteLeaveType,
  useEmployeeLeaveSummary,
  useLeaveRequests,
  useLeaveStats,
  useLeaveTypes,
  useRunLeaveEncashment,
} from '@/features/leave/hooks/useLeave'
import { filterLeaveRequests } from '@/features/leave/lib/leave-utils'
import type { LeaveManagementTab, LeaveRequestFilters } from '@/features/leave/model/types'
import { ExportReportIcon, PlusIcon } from '@/features/leave/ui/icons'
import { LeaveManagementTabs } from '@/features/leave/ui/LeaveManagementTabs'
import { LeaveRequestsTable } from '@/features/leave/ui/LeaveRequestsTable'
import { LeaveRequestToolbar } from '@/features/leave/ui/LeaveRequestToolbar'
import { LeaveStatsRow } from '@/features/leave/ui/LeaveStatsRow'
import { LeaveTypesTable } from '@/features/leave/ui/LeaveTypesTable'
import { MyLeaveBalances } from '@/features/leave/ui/MyLeaveBalances'
import { paginate } from '@/shared/lib/pagination'

const PAGE_SIZE = 4

const defaultFilters: LeaveRequestFilters = {
  search: '',
  leaveType: 'all',
  status: 'all',
  month: 'all',
}

function resolveScope(
  user: ReturnType<typeof useAuth>['user'],
  isPersonalView: boolean,
): 'mine' | 'team' | 'company' {
  if (!user) return 'mine'
  if (userHasPermission(user, 'leave:manage')) return 'company'
  // Managers use My Leaves for their own balance/requests
  if (isPersonalView) return 'mine'
  if (userHasPermission(user, 'leave:approve')) return 'team'
  return 'mine'
}

export function LeaveManagementPage() {
  const { user } = useAuth()
  const canManageTypes = user ? userHasPermission(user, 'leave:manage') : false
  const canRequest = user ? userHasPermission(user, 'leave:request') : false
  // Personal My Leaves for anyone who can request (employees + managers), not HR leave admins
  const isPersonalView = user
    ? userHasPermission(user, 'leave:request') && !userHasPermission(user, 'leave:manage')
    : false

  const scope = resolveScope(user, isPersonalView)
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeTab: LeaveManagementTab =
    tabParam === 'types' && canManageTypes ? 'types' : 'requests'

  const [filters, setFilters] = useState<LeaveRequestFilters>(defaultFilters)
  const [requestsPage, setRequestsPage] = useState(1)
  const [typesPage, setTypesPage] = useState(1)

  const { data: requests = [], isLoading: requestsLoading } = useLeaveRequests({
    scope,
    limit: 100,
    leaveTypeId: filters.leaveType !== 'all' ? filters.leaveType : undefined,
    status: filters.status === 'all' ? undefined : filters.status,
    month: filters.month !== 'all' ? filters.month : undefined,
    search: filters.search || undefined,
  })

  const { data: leaveTypes = [], isLoading: typesLoading } = useLeaveTypes()
  const { data: stats, isLoading: statsLoading } = useLeaveStats(scope)
  const { data: mySummary, isLoading: summaryLoading } = useEmployeeLeaveSummary(
    isPersonalView ? user?.id : undefined,
  )
  const deleteType = useDeleteLeaveType()
  const runEncashment = useRunLeaveEncashment()

  useEffect(() => {
    setRequestsPage(1)
  }, [filters])

  const loading =
    requestsLoading || typesLoading || statsLoading || (isPersonalView && summaryLoading)

  const isRequestsFiltered =
    filters.search.trim() !== '' ||
    filters.leaveType !== 'all' ||
    filters.status !== 'all' ||
    filters.month !== 'all'

  const filtered = useMemo(
    () =>
      filterLeaveRequests(
        requests,
        filters.search,
        filters.leaveType,
        filters.status,
        filters.month,
      ),
    [requests, filters],
  )

  const requestsPagination = useMemo(
    () => paginate(filtered, requestsPage, PAGE_SIZE),
    [filtered, requestsPage],
  )
  const typesPagination = useMemo(
    () => paginate(leaveTypes, typesPage, PAGE_SIZE),
    [leaveTypes, typesPage],
  )

  const showRequestsToolbar =
    !loading && (isRequestsFiltered || requestsPagination.total > 0)

  const setActiveTab = (tab: LeaveManagementTab) => {
    setSearchParams(tab === 'types' ? { tab: 'types' } : {})
  }

  const handleDeleteType = async (id: string) => {
    const type = leaveTypes.find((t) => t.id === id)
    const confirmed = window.confirm(
      `Delete "${type?.name ?? 'this leave type'}"? This cannot be undone.`,
    )
    if (!confirmed) return

    try {
      await deleteType.mutateAsync(id)
    } catch {
      window.alert(
        'Unable to delete this leave type. It may have existing requests — set it to inactive instead.',
      )
    }
  }

  const handleEncashment = async () => {
    const year = new Date().getFullYear()
    const confirmed = window.confirm(
      `Run paid-leave encashment for unused non-carry-forward leave in ${year}? Records will apply on next payroll generate for December ${year}.`,
    )
    if (!confirmed) return
    try {
      const result = await runEncashment.mutateAsync({
        year,
        targetMonth: 12,
        targetYear: year,
      })
      window.alert(
        result.created > 0
          ? `Created ${result.created} encashment record(s). Generate December payroll to include payouts.`
          : 'No new encashment records (already run or no unused days).',
      )
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message?: string }).message)
          : 'Unable to run encashment. Enable it in Payroll Settings first.'
      window.alert(message)
    }
  }

  const pageTitle = isPersonalView ? 'My Leaves' : 'Leave Management'
  const pageSubtitle = isPersonalView
    ? 'Track remaining balances by leave type and manage your requests'
    : 'Manage employee leave requests'

  const ctaClassName =
    'inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold sm:w-auto'

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-8 text-heading sm:text-[30px] sm:leading-9">
            {pageTitle}
          </h1>
          <p className="mt-1 text-sm leading-6 text-text-muted sm:text-base">{pageSubtitle}</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          {activeTab === 'requests' && !isPersonalView && (
            <Link
              to="/reports/generate?type=leaves"
              className={`${ctaClassName} border border-primary bg-surface text-primary hover:bg-[#eff6ff]`}
            >
              <ExportReportIcon />
              Export Report
            </Link>
          )}
          {canRequest && (
            <Link
              to="/leave/new"
              className={`${ctaClassName} bg-primary text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95`}
            >
              <PlusIcon />
              New Request
            </Link>
          )}
          {canManageTypes && activeTab === 'types' && (
            <>
              <button
                type="button"
                disabled={runEncashment.isPending}
                onClick={() => void handleEncashment()}
                className={`${ctaClassName} border border-border bg-surface text-heading hover:bg-surface-muted disabled:opacity-70`}
              >
                {runEncashment.isPending ? 'Running…' : 'Run Encashment'}
              </button>
              <Link
                to="/leave/types/new"
                className={`${ctaClassName} bg-primary text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95`}
              >
                <PlusIcon />
                Add Leave Type
              </Link>
            </>
          )}
        </div>
      </header>

      {canManageTypes ? (
        <LeaveManagementTabs active={activeTab} onChange={setActiveTab} />
      ) : null}

      {activeTab === 'requests' ? (
        <>
          {isPersonalView && mySummary ? <MyLeaveBalances summary={mySummary} /> : null}
          {!isPersonalView && stats ? <LeaveStatsRow stats={stats} /> : null}
          {showRequestsToolbar ? (
            <LeaveRequestToolbar
              filters={filters}
              leaveTypes={leaveTypes}
              onChange={setFilters}
            />
          ) : null}
          {loading ? (
            <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-border-card bg-surface shadow-(--shadow-stat)">
              <p className="text-sm text-text-muted">
                {isPersonalView ? 'Loading your leave balances…' : 'Loading leave requests…'}
              </p>
            </div>
          ) : (
            <>
              {isPersonalView ? (
                <div className="mb-3">
                  <h2 className="text-base font-bold text-heading">My Requests</h2>
                  <p className="text-sm text-text-muted">
                    History of leave you have applied for
                  </p>
                </div>
              ) : null}
              <LeaveRequestsTable
                requests={requestsPagination.items}
                page={requestsPagination.currentPage}
                total={requestsPagination.total}
                rangeStart={requestsPagination.start}
                rangeEnd={requestsPagination.end}
                totalPages={requestsPagination.totalPages}
                onPageChange={setRequestsPage}
                isFiltered={isRequestsFiltered}
              />
            </>
          )}
        </>
      ) : loading ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-border-card bg-surface shadow-(--shadow-stat)">
          <p className="text-sm text-text-muted">Loading leave types…</p>
        </div>
      ) : (
        <LeaveTypesTable
          types={typesPagination.items}
          page={typesPagination.currentPage}
          total={typesPagination.total}
          totalPages={typesPagination.totalPages}
          onPageChange={setTypesPage}
          onDelete={handleDeleteType}
        />
      )}
    </div>
  )
}
