import type { ProjectDetailTab } from '@/features/projects/model/types'
import { cn } from '@/shared/lib/cn'

const tabs: { id: ProjectDetailTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'team', label: 'Team' },
  { id: 'milestones', label: 'Milestones' },
  { id: 'files', label: 'Files & Links' },
]

type ProjectDetailTabsProps = {
  active: ProjectDetailTab
  onChange: (tab: ProjectDetailTab) => void
}

export function ProjectDetailTabs({ active, onChange }: ProjectDetailTabsProps) {
  return (
    <div className="flex gap-6 border-b border-border-card px-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'border-b-2 pb-3 pt-4 text-xs font-bold transition-colors',
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
