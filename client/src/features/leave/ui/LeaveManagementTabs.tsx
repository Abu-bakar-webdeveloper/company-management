import type { LeaveManagementTab } from '@/features/leave/model/types'
import { cn } from '@/shared/lib/cn'

const tabs: { id: LeaveManagementTab; label: string }[] = [
  { id: 'requests', label: 'Leave Requests' },
  { id: 'types', label: 'Leave Types' },
]

type LeaveManagementTabsProps = {
  active: LeaveManagementTab
  onChange: (tab: LeaveManagementTab) => void
  showTypesTab?: boolean
}

export function LeaveManagementTabs({
  active,
  onChange,
  showTypesTab = true,
}: LeaveManagementTabsProps) {
  const visibleTabs = showTypesTab ? tabs : tabs.filter((tab) => tab.id === 'requests')

  return (
    <div className="mb-6 flex gap-6 border-b border-border-card">
      {visibleTabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'border-b-2 pb-3 text-sm font-medium transition-colors',
            active === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-heading',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
