import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import type { Task } from '@/features/tasks/model/types'
import { TaskPriorityBadge } from '@/features/tasks/ui/TaskPriorityBadge'
import { TaskStatusBadge } from '@/features/tasks/ui/TaskStatusBadge'
import { MoreVertIcon } from '@/features/platform/ui/icons'
import { DashboardSectionHeader } from '@/features/dashboard/ui/DashboardSectionHeader'
import { Card } from '@/shared/ui/Card'
import { cn } from '@/shared/lib/cn'

const TABLE_TITLE = 'Recently Added Tasks'

type TasksTableProps = {
  tasks: Task[]
  page: number
  total: number
  rangeStart: number
  rangeEnd: number
  totalPages: number
  onPageChange: (page: number) => void
  isFiltered?: boolean
}

const ACTION_TRANSITION_MS = 500
const ACTION_STAGGER_MS = 80

function getTaskBoardPath(task: Task): string {
  if (task.projectId) {
    return `/projects/${task.projectId}/board?task=${encodeURIComponent(task.id)}`
  }
  return `/tasks/${task.id}`
}

function getActionButtonStyle(buttonIndex: number, buttonCount: number, isOpen: boolean): CSSProperties {
  const openDelay = 100 + buttonIndex * ACTION_STAGGER_MS
  const closeDelay = (buttonCount - 1 - buttonIndex) * ACTION_STAGGER_MS

  return {
    transitionProperty: 'opacity, transform',
    transitionDuration: `${ACTION_TRANSITION_MS}ms`,
    transitionTimingFunction: 'ease-in-out',
    transitionDelay: isOpen ? `${openDelay}ms` : `${closeDelay}ms`,
    opacity: isOpen ? 1 : 0,
    transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(6px) scale(0.95)',
    pointerEvents: isOpen ? 'auto' : 'none',
  }
}

function TaskRowActions({ task }: { task: Task }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonCount = task.actionVariant === 'view' ? 1 : 3
  const dotCloseDelay = (buttonCount - 1) * ACTION_STAGGER_MS + 180
  const viewPath = getTaskBoardPath(task)

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  if (task.actionVariant === 'view') {
    return (
      <Link
        to={viewPath}
        className="inline-block rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95"
      >
        View
      </Link>
    )
  }

  const dotButtonStyle: CSSProperties = {
    transitionProperty: 'opacity, transform',
    transitionDuration: `${ACTION_TRANSITION_MS}ms`,
    transitionTimingFunction: 'ease-in-out',
    transitionDelay: isOpen ? '0ms' : `${dotCloseDelay}ms`,
    opacity: isOpen ? 0 : 1,
    transform: isOpen ? 'scale(0.75)' : 'scale(1)',
    pointerEvents: isOpen ? 'none' : 'auto',
  }

  const actionsPanelStyle: CSSProperties = {
    transitionProperty: 'opacity, transform',
    transitionDuration: `${ACTION_TRANSITION_MS}ms`,
    transitionTimingFunction: 'ease-in-out',
    transitionDelay: isOpen ? '60ms' : `${(buttonCount - 1) * ACTION_STAGGER_MS + 40}ms`,
    opacity: isOpen ? 1 : 0,
    transform: isOpen ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.95)',
    pointerEvents: isOpen ? 'auto' : 'none',
  }

  return (
    <div ref={containerRef} className="relative mx-auto flex h-8 w-8 items-center justify-center">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={dotButtonStyle}
        className="absolute inset-0 flex items-center justify-center rounded-lg text-text-muted hover:bg-surface-muted"
        aria-label={`More actions for ${task.name}`}
        aria-expanded={isOpen}
      >
        <MoreVertIcon />
      </button>

      <div
        style={actionsPanelStyle}
        className="absolute left-1/2 top-1/2 z-20 flex items-center gap-1.5 whitespace-nowrap rounded-lg px-1"
      >
        <Link
          to={viewPath}
          style={getActionButtonStyle(0, buttonCount, isOpen)}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:opacity-95 xl:px-4 shadow-[0_4px_12px_rgba(15,23,42,0.08)]"
        >
          View
        </Link>
        <button
          type="button"
          style={getActionButtonStyle(1, buttonCount, isOpen)}
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-heading hover:bg-surface-muted xl:px-4 shadow-[0_4px_12px_rgba(15,23,42,0.08)]"
        >
          Edit
        </button>
        <button
          type="button"
          style={getActionButtonStyle(2, buttonCount, isOpen)}
          className="rounded-lg bg-[#fef2f2] px-3 py-1.5 text-xs font-medium text-danger hover:opacity-95 xl:px-4 shadow-[0_4px_12px_rgba(15,23,42,0.08)]"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export function TasksTable({
  tasks,
  page,
  total,
  rangeStart,
  rangeEnd,
  totalPages,
  onPageChange,
  isFiltered = false,
}: TasksTableProps) {
  const navigate = useNavigate()

  if (total === 0) {
    return (
      <Card className="overflow-hidden">
        <DashboardSectionHeader title={TABLE_TITLE} />
        <div className="p-4 sm:p-6">
          <ComingSoonState
            title={isFiltered ? 'No tasks found' : 'No tasks yet'}
            description={
              isFiltered
                ? 'Try adjusting your search or filters.'
                : 'Tasks assigned to you will appear here.'
            }
            minHeight="min-h-[280px]"
          />
        </div>
      </Card>
    )
  }

  const pageNumbers =
    totalPages <= 3
      ? Array.from({ length: totalPages }, (_, i) => i + 1)
      : page <= 2
        ? [1, 2, 3]
        : page >= totalPages - 1
          ? [totalPages - 2, totalPages - 1, totalPages]
          : [page - 1, page, page + 1]

  const openTask = (task: Task) => {
    void navigate(getTaskBoardPath(task))
  }

  return (
    <Card className="overflow-hidden">
      <DashboardSectionHeader title={TABLE_TITLE} />

      <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:hidden sm:p-6">
        {tasks.map((task) => (
          <div
            key={task.id}
            role="button"
            tabIndex={0}
            onClick={() => openTask(task)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                openTask(task)
              }
            }}
            className="cursor-pointer rounded-xl border border-border-card bg-surface p-4 hover:bg-surface-muted/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-heading">{task.name}</p>
                <p className="mt-1 text-xs text-text-muted">{task.project}</p>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <TaskRowActions task={task} />
              </div>
            </div>

            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="shrink-0 text-text-muted">Assigned By</dt>
                <dd className="truncate text-right text-heading">{task.assignedBy}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="shrink-0 text-text-muted">Due Date</dt>
                <dd className="text-heading">{task.dueDate}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="shrink-0 text-text-muted">Priority</dt>
                <dd>
                  <TaskPriorityBadge priority={task.priority} />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="shrink-0 text-text-muted">Status</dt>
                <dd>
                  <TaskStatusBadge status={task.status} />
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full table-fixed text-left text-sm">
          <colgroup>
            <col className="w-[18%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
            <col className="w-[12%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
          </colgroup>
          <thead>
            <tr className="bg-table-header text-xs font-semibold uppercase leading-4 tracking-wide text-heading xl:text-[16px]">
              <th className="px-4 py-3.5 xl:px-6">Task Name</th>
              <th className="px-4 py-3.5 xl:px-6">Project</th>
              <th className="px-4 py-3.5 xl:px-6">Assigned By</th>
              <th className="px-4 py-3.5 xl:px-6">Due Date</th>
              <th className="px-4 py-3.5 xl:px-6">Priority</th>
              <th className="px-4 py-3.5 xl:px-6">Status</th>
              <th className="px-4 py-3.5 text-center xl:px-6">Action</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr
                key={task.id}
                className="cursor-pointer border-t border-border-card hover:bg-surface-muted/60"
                onClick={() => openTask(task)}
              >
                <td className="truncate px-4 py-4 font-medium text-heading xl:px-6">{task.name}</td>
                <td className="truncate px-4 py-4 text-text-muted xl:px-6">{task.project}</td>
                <td className="truncate px-4 py-4 text-text-muted xl:px-6">{task.assignedBy}</td>
                <td className="px-4 py-4 text-text-muted xl:px-6">{task.dueDate}</td>
                <td className="px-4 py-4 xl:px-6">
                  <TaskPriorityBadge priority={task.priority} />
                </td>
                <td className="px-4 py-4 xl:px-6">
                  <TaskStatusBadge status={task.status} />
                </td>
                <td
                  className="relative overflow-visible px-4 py-4 text-center xl:px-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <TaskRowActions task={task} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 border-t border-border-card bg-table-header px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-text-muted">
          Showing {rangeStart} to {rangeEnd} of {total} results
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </button>
          {pageNumbers.map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={cn(
                'min-w-9 rounded-lg px-3 py-1.5 text-sm font-medium',
                pageNum === page
                  ? 'bg-primary text-white hover:opacity-95'
                  : 'border border-border bg-surface text-text-muted hover:bg-surface-muted',
              )}
            >
              {pageNum}
            </button>
          ))}
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </Card>
  )
}
