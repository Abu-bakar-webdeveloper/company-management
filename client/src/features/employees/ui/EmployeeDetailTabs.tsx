import { useMemo } from 'react'
import { useAuth } from '@/features/auth/model/AuthContext'
import { isCompanyHubEnabled, type CompanyHub } from '@/features/auth/model/companyHubs'
import { userHasPermission } from '@/features/auth/model/permissions'
import type { EmployeeDetailTab } from '@/features/employees/model/types'
import { cn } from '@/shared/lib/cn'

const allTabs: { id: EmployeeDetailTab; label: string; hub: CompanyHub | null }[] = [
  { id: 'overview', label: 'Overview', hub: null },
  { id: 'projects', label: 'Projects', hub: 'work' },
  { id: 'leaves', label: 'Leaves', hub: 'people' },
  { id: 'performance', label: 'Performance', hub: 'people' },
  { id: 'salary', label: 'Salary', hub: 'finance' },
]

export function getVisibleEmployeeDetailTabs(
  user: ReturnType<typeof useAuth>['user'],
  employeeId: string,
): EmployeeDetailTab[] {
  const canSeeSalary =
    !!user &&
    (userHasPermission(user, 'salaries:read') ||
      (user.id === employeeId && userHasPermission(user, 'salaries:self')))
  return allTabs
    .filter((tab) => {
      if (tab.hub && !isCompanyHubEnabled(user?.enabledHubs, tab.hub)) return false
      if (tab.id === 'salary' && !canSeeSalary) return false
      return true
    })
    .map((tab) => tab.id)
}

type EmployeeDetailTabsProps = {
  active: EmployeeDetailTab
  onChange: (tab: EmployeeDetailTab) => void
  employeeId: string
}

export function EmployeeDetailTabs({ active, onChange, employeeId }: EmployeeDetailTabsProps) {
  const { user } = useAuth()

  const tabs = useMemo(() => {
    const visible = new Set(getVisibleEmployeeDetailTabs(user, employeeId))
    return allTabs.filter((tab) => visible.has(tab.id))
  }, [employeeId, user])

  return (
    <div className="flex gap-8 border-b border-border-card px-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'border-b-2 pb-3 pt-4 text-sm font-semibold transition-colors',
            active === tab.id
              ? 'border-primary text-primary hover:opacity-90'
              : 'border-transparent text-text-muted hover:text-heading',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
