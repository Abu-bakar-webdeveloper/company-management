import type { DragEvent } from 'react'
import type { BoardMember, BoardMilestone, BoardTask } from '@/features/tasks/model/types'
import { BoardAvatar } from '@/features/tasks/ui/BoardAvatar'
import { BoardDueDate } from '@/features/tasks/ui/BoardDueDate'
import { BoardMilestoneChip } from '@/features/tasks/ui/BoardMilestoneChip'
import { BoardPriorityFlag, boardPriorityBorderClass } from '@/features/tasks/ui/BoardPriorityFlag'
import { MessageIcon, PaperclipIcon } from '@/features/tasks/ui/boardIcons'
import { cn } from '@/shared/lib/cn'

type TaskBoardCardProps = {
  task: BoardTask
  members: Record<string, BoardMember>
  milestones: Record<string, BoardMilestone>
  canEdit: boolean
  dragging?: boolean
  onOpen: (task: BoardTask) => void
  onDragStart: (event: DragEvent, task: BoardTask) => void
}

export function TaskBoardCard({
  task,
  members,
  milestones,
  canEdit,
  dragging,
  onOpen,
  onDragStart,
}: TaskBoardCardProps) {
  const assignee = task.assigneeId ? members[task.assigneeId] : null
  const milestone = task.milestoneId ? milestones[task.milestoneId] : null
  const subDone = task.subtasks.filter((s) => s.done).length

  return (
    <div
      role="button"
      tabIndex={0}
      draggable={canEdit}
      onDragStart={(e) => {
        if (!canEdit) return
        e.dataTransfer.setData('application/x-bizflow-board-drag', 'task')
        onDragStart(e, task)
      }}
      onClick={() => onOpen(task)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen(task)
        }
      }}
      className={cn(
        'mb-2.5 overflow-hidden rounded-xl border border-border-card border-l-[3px] bg-surface shadow-[var(--shadow-stat)] transition-shadow hover:shadow-[var(--shadow-card)]',
        boardPriorityBorderClass(task.priority),
        canEdit ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
        dragging && 'opacity-40',
      )}
    >
      {task.image && (
        <div
          className="h-24 bg-cover bg-center"
          style={{ backgroundImage: `url(${task.image})` }}
        />
      )}
      <div className="px-3.5 pb-3.5 pt-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          <BoardPriorityFlag priority={task.priority} />
          <BoardMilestoneChip milestone={milestone} />
        </div>
        <p className="mb-2.5 text-[13.5px] font-semibold leading-snug text-heading">{task.title}</p>

        {task.subtasks.length > 0 && (
          <div className="mb-2.5">
            <div className="h-1 overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: `${(subDone / task.subtasks.length) * 100}%` }}
              />
            </div>
            <p className="mt-1 text-[10.5px] font-semibold text-placeholder-alt">
              {subDone}/{task.subtasks.length} subtasks
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <BoardAvatar member={assignee} />
            <BoardDueDate date={task.dueDate} />
          </div>
          <div className="flex items-center gap-2.5 text-placeholder-alt">
            {task.comments > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[11px]">
                <MessageIcon /> {task.comments}
              </span>
            )}
            {task.attachments > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[11px]">
                <PaperclipIcon /> {task.attachments}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
