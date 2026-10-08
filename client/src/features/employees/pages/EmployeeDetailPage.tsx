import { useEffect, useState } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/model/AuthContext'
import { useEmployee } from '@/features/employees/hooks/useEmployees'
import type { Employee } from '@/features/employees/model/types'
import type { EmployeeDetailTab } from '@/features/employees/model/types'
import { EmployeeDetailTabs, getVisibleEmployeeDetailTabs } from '@/features/employees/ui/EmployeeDetailTabs'
import { EmployeeLeavesTab } from '@/features/employees/ui/EmployeeLeavesTab'
import { EmployeeOverviewTab } from '@/features/employees/ui/EmployeeOverviewTab'
import { EmployeePerformanceTab } from '@/features/employees/ui/EmployeePerformanceTab'
import { EmployeeProfileHeader } from '@/features/employees/ui/EmployeeProfileHeader'
import { EmployeeProjectsTab } from '@/features/employees/ui/EmployeeProjectsTab'
import { EmployeeSalaryTab } from '@/features/employees/ui/EmployeeSalaryTab'
import { EditIcon } from '@/features/employees/ui/icons'
import { usePerformanceSummary } from '@/features/performance/hooks/usePerformanceSummary'
import { DetailCardSkeleton } from '@/shared/ui/DataSkeletons'

type EmployeeDetailLocationState = {
  employee?: Employee
}

const TAB_VALUES: EmployeeDetailTab[] = [
  'overview',
  'projects',
  'leaves',
  'performance',
  'salary',
]

function parseTab(value: string | null): EmployeeDetailTab {
  if (value && TAB_VALUES.includes(value as EmployeeDetailTab)) {
    return value as EmployeeDetailTab
  }
  return 'overview'
}

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { can, user } = useAuth()
  const previewEmployee = (location.state as EmployeeDetailLocationState | null)?.employee
  const { data: employee, isLoading } = useEmployee(id)
  const [activeTab, setActiveTab] = useState<EmployeeDetailTab>(() =>
    parseTab(searchParams.get('tab')),
  )

  useEffect(() => {
    setActiveTab(parseTab(searchParams.get('tab')))
  }, [searchParams])

  useEffect(() => {
    if (!id) return
    const visible = getVisibleEmployeeDetailTabs(user, id)
    if (!visible.includes(activeTab)) {
      setActiveTab('overview')
      setSearchParams({}, { replace: true })
    }
  }, [activeTab, id, setSearchParams, user])

  const displayEmployee =
    employee ?? (previewEmployee?.id === id ? previewEmployee : undefined)

  const { summary, loading: perfLoading, error: perfError } = usePerformanceSummary(
    displayEmployee?.id,
    activeTab === 'performance' && !!displayEmployee?.id,
  )

  if (isLoading && !displayEmployee) {
    return <DetailCardSkeleton />
  }

  if (!displayEmployee) {
    return (
      <div className="p-8">
        <p className="font-semibold text-heading">Employee not found</p>
        <Link to="/employees" className="mt-4 inline-block text-sm text-primary hover:opacity-90">
          Back to Employees
        </Link>
      </div>
    )
  }

  const canEdit = can('employees:write')

  const handleTabChange = (tab: EmployeeDetailTab) => {
    setActiveTab(tab)
    setSearchParams(tab === 'overview' ? {} : { tab }, { replace: true })
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[30px] font-bold leading-9 text-heading">Employee Details</h1>
          <p className="mt-1 text-base leading-6 text-text-muted">
            View and manage employee information
          </p>
        </div>
        {canEdit && (
          <Link
            to={`/employees/${displayEmployee.id}/edit`}
            className="flex h-10 items-center gap-2 rounded-lg bg-primary px-5 w-auto text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95"
          >
            <EditIcon className="text-white w-4 h-4" />
            Edit Employee
          </Link>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-border-card bg-surface shadow-(--shadow-stat)">
        <EmployeeProfileHeader employee={displayEmployee} />
        <EmployeeDetailTabs
          active={activeTab}
          onChange={handleTabChange}
          employeeId={displayEmployee.id}
        />
        {activeTab === 'overview' && <EmployeeOverviewTab employee={displayEmployee} />}
        {activeTab === 'projects' && <EmployeeProjectsTab employeeId={displayEmployee.id} />}
        {activeTab === 'leaves' && <EmployeeLeavesTab employeeId={displayEmployee.id} />}
        {activeTab === 'performance' && (
          <EmployeePerformanceTab summary={summary} loading={perfLoading} error={perfError} />
        )}
        {activeTab === 'salary' && <EmployeeSalaryTab employeeId={displayEmployee.id} />}
      </div>
    </div>
  )
}
