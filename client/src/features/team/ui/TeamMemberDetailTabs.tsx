import { useMemo } from 'react'
import { useAuth } from '@/features/auth/model/AuthContext'
import { isCompanyHubEnabled, type CompanyHub } from '@/features/auth/model/companyHubs'
import type { EmployeeDetailTab } from '@/features/employees/model/types'
import { cn } from '@/shared/lib/cn'

const allTabs: { id: EmployeeDetailTab; label: string; hub: CompanyHub | null }[] = [
  { id: 'overview', label: 'Overview', hub: null },
  { id: 'projects', label: 'Projects', hub: 'work' },
  { id: 'leaves', label: 'Leaves', hub: 'people' },
  { id: 'performance', label: 'Performance', hub: 'people' },
]

export function getVisibleTeamMemberDetailTabs(
  hubs?: readonly string[] | null,
): EmployeeDetailTab[] {
  return allTabs
    .filter((tab) => !tab.hub || isCompanyHubEnabled(hubs, tab.hub))
    .map((tab) => tab.id)
}

type TeamMemberDetailTabsProps = {
  active: EmployeeDetailTab
  onChange: (tab: EmployeeDetailTab) => void
}

export function TeamMemberDetailTabs({ active, onChange }: TeamMemberDetailTabsProps) {
  const { user } = useAuth()
  const tabs = useMemo(
    () =>
      allTabs.filter(
        (tab) => getVisibleTeamMemberDetailTabs(user?.enabledHubs).includes(tab.id),
      ),
    [user?.enabledHubs],
  )

  return (
    <div className="flex gap-8 border-b border-[#e4edf6] bg-white px-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            '-mb-px border-b-[3px] pb-3 pt-4 text-sm font-semibold transition-colors',
            active === tab.id
              ? 'border-[#1877f2] text-[#1877f2]'
              : 'border-transparent text-[#778499] hover:text-heading',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
