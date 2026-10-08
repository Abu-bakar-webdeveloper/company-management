import { Link } from 'react-router-dom'
import type { BoardFilters, BoardMember, BoardMilestone } from '@/features/tasks/model/types'
import { BOARD_PRIORITY_OPTIONS } from '@/features/tasks/lib/board-utils'
import { LayoutGridIcon, SearchIcon } from '@/features/tasks/ui/boardIcons'
import { ArrowLeftIcon } from '@/features/tasks/ui/taskDetailIcons'
import { PlusIcon } from '@/features/projects/ui/icons'
import { Button } from '@/shared/ui/Button'
import { SelectField } from '@/shared/ui/SelectField'

type TaskBoardHeaderProps = {
  projectId: string
  projectName: string
  filters: BoardFilters
  members: BoardMember[]
  milestones: BoardMilestone[]
  onFiltersChange: (patch: Partial<BoardFilters>) => void
  canCreate: boolean
  onOpenCreate: () => void
}

const selectClass =
  '!h-9 rounded-lg px-2.5 text-[12.5px]'

export function TaskBoardHeader({
  projectId,
  projectName,
  filters,
  members,
  milestones,
  onFiltersChange,
  canCreate,
  onOpenCreate,
}: TaskBoardHeaderProps) {
  return (
    <header className="mb-5">
      <div className="mb-1 flex items-center gap-2 text-[13px] font-semibold text-text-muted">
        <Link
          to={`/projects/${projectId}`}
          className="inline-flex items-center gap-1.5 hover:text-primary"
        >
          <ArrowLeftIcon className="size-3.5" />
          Project
        </Link>
        <span aria-hidden>/</span>
        <span className="inline-flex items-center gap-1.5 text-heading">
          <LayoutGridIcon className="size-3.5 text-primary" />
          Task Board
        </span>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[25px] font-extrabold tracking-tight text-heading sm:text-[28px]">
            {projectName}
          </h1>
          <p className="mt-1 text-sm text-text-muted">Organize and track work on this project.</p>
        </div>
        {canCreate && (
          <Button type="button" size="md" shadow onClick={onOpenCreate} icon={<PlusIcon />} iconPosition="start">
            New task
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-placeholder-alt" />
          <input
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            placeholder="Search tasks…"
            className="h-9 w-44 rounded-lg border border-border bg-surface pl-8 pr-2.5 text-[12.5px] text-heading outline-none placeholder:text-placeholder-alt focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-52"
          />
        </div>

        <SelectField
          value={filters.assignee}
          onChange={(e) => onFiltersChange({ assignee: e.target.value })}
          className={selectClass}
          aria-label="Filter by assignee"
        >
          <option value="">All assignees</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </SelectField>

        <SelectField
          value={filters.milestone}
          onChange={(e) => onFiltersChange({ milestone: e.target.value })}
          className={selectClass}
          aria-label="Filter by milestone"
        >
          <option value="">All milestones</option>
          {milestones.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </SelectField>

        <SelectField
          value={filters.priority}
          onChange={(e) => onFiltersChange({ priority: e.target.value })}
          className={selectClass}
          aria-label="Filter by priority"
        >
          <option value="">All priorities</option>
          {BOARD_PRIORITY_OPTIONS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </SelectField>
      </div>
    </header>
  )
}
