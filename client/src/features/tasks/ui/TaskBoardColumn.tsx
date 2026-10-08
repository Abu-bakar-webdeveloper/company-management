import { useState, type DragEvent } from 'react'
import { PlusIcon } from '@/features/projects/ui/icons'
import type {
  BoardColumn,
  BoardMember,
  BoardMilestone,
  BoardRole,
  BoardTask,
} from '@/features/tasks/model/types'
import { canEditBoardTask } from '@/features/tasks/lib/board-utils'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  DragHandleIcon,
  MoreHorizontalIcon,
  TrashIcon,
} from '@/features/tasks/ui/boardIcons'
import { PendingTaskCardSkeleton } from '@/features/tasks/ui/BoardSkeletons'
import { TaskBoardCard } from '@/features/tasks/ui/TaskBoardCard'
import { cn } from '@/shared/lib/cn'

export const BOARD_DRAG_TYPE = 'application/x-bizflow-board-drag'

type TaskBoardColumnProps = {
  column: BoardColumn
  tasks: BoardTask[]
  members: Record<string, BoardMember>
  milestones: Record<string, BoardMilestone>
  role: BoardRole
  currentUserId: string | null
  draggingId: string | null
  columnDragging: boolean
  columnDropHighlight: boolean
  canMoveLeft: boolean
  canMoveRight: boolean
  dropIndex: number | null
  pendingTaskCount?: number
  pendingMove?: boolean
  pendingMoveTaskIds?: Set<string>
  onOpenTask: (task: BoardTask) => void
  onTaskDragStart: (event: DragEvent, task: BoardTask) => void
  onTaskDragOverIndex: (columnId: string, index: number) => void
  onDropCard: (event: DragEvent, columnId: string) => void
  onColumnDragStart: (event: DragEvent, column: BoardColumn) => void
  onColumnDragOver: (event: DragEvent, columnId: string) => void
  onColumnDrop: (event: DragEvent, columnId: string) => void
  onColumnDragEnd: () => void
  onMoveColumn: (columnId: string, direction: 'left' | 'right') => void
  onQuickAdd: (columnId: string, title: string) => void
  onRename: (columnId: string, name: string) => void
  onDeleteRequest: (columnId: string) => void
}

export function TaskBoardColumn({
  column,
  tasks,
  members,
  milestones,
  role,
  currentUserId,
  draggingId,
  columnDragging,
  columnDropHighlight,
  canMoveLeft,
  canMoveRight,
  dropIndex,
  pendingTaskCount = 0,
  pendingMove = false,
  pendingMoveTaskIds,
  onOpenTask,
  onTaskDragStart,
  onTaskDragOverIndex,
  onDropCard,
  onColumnDragStart,
  onColumnDragOver,
  onColumnDrop,
  onColumnDragEnd,
  onMoveColumn,
  onQuickAdd,
  onRename,
  onDeleteRequest,
}: TaskBoardColumnProps) {
  const [isCardOver, setIsCardOver] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(column.name)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [quickTitle, setQuickTitle] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const canManage = role === 'pm'
  const wipLimit = column.wipLimit ?? null
  const overLimit = wipLimit != null && tasks.length > wipLimit

  const submitQuickAdd = () => {
    if (quickTitle.trim()) onQuickAdd(column.id, quickTitle.trim())
    setQuickTitle('')
    setQuickAddOpen(false)
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        onColumnDragOver(e, column.id)
        if (role === 'viewer') return
        if (!columnDragging) {
          setIsCardOver(true)
          if (tasks.length === 0) onTaskDragOverIndex(column.id, 0)
        }
      }}
      onDragLeave={() => setIsCardOver(false)}
      onDrop={(e) => {
        setIsCardOver(false)
        const dragKind = e.dataTransfer.getData(BOARD_DRAG_TYPE)
        if (dragKind === 'column') {
          onColumnDrop(e, column.id)
          return
        }
        if (role !== 'viewer') onDropCard(e, column.id)
      }}
      className={cn(
        'flex w-[300px] shrink-0 flex-col rounded-2xl p-2.5 transition-colors',
        (columnDragging || pendingMove) && 'opacity-50',
        pendingMove && 'animate-pulse',
        columnDropHighlight
          ? 'border border-dashed border-primary bg-primary-muted'
          : isCardOver
            ? 'border border-dashed border-primary bg-primary-muted'
            : 'border border-transparent bg-surface-muted',
      )}
    >
      <div className="flex items-center justify-between px-1.5 pb-2.5 pt-1">
        <div className="flex min-w-0 items-center gap-1">
          {canManage && (
            <button
              type="button"
              draggable
              onDragStart={(e) => onColumnDragStart(e, column)}
              onDragEnd={onColumnDragEnd}
              className="cursor-grab rounded p-0.5 text-placeholder-alt hover:text-heading active:cursor-grabbing"
              aria-label="Drag to reorder column"
            >
              <DragHandleIcon />
            </button>
          )}
          {editingName ? (
            <input
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={() => {
                onRename(column.id, nameDraft.trim() || column.name)
                setEditingName(false)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur()
              }}
              className="w-36 rounded-md border border-primary px-1.5 py-0.5 text-sm font-bold text-heading outline-none"
            />
          ) : (
            <button
              type="button"
              className={cn(
                'flex min-w-0 items-center gap-2',
                canManage ? 'cursor-text' : 'cursor-default',
              )}
              onClick={() => {
                if (!canManage) return
                setNameDraft(column.name)
                setEditingName(true)
              }}
            >
              <span className="truncate text-sm font-bold text-heading">{column.name}</span>
              <span
                className={cn(
                  'shrink-0 rounded-full border px-1.5 py-px text-[11px] font-bold',
                  overLimit
                    ? 'border-[#fecaca] bg-[#fef2f2] text-danger'
                    : 'border-border bg-surface text-placeholder-alt',
                )}
              >
                {tasks.length}
                {wipLimit != null ? `/${wipLimit}` : ''}
              </span>
            </button>
          )}
        </div>

        {canManage && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-md p-1 text-text-muted hover:bg-surface hover:text-heading"
              aria-label="Column menu"
            >
              <MoreHorizontalIcon />
            </button>
            {menuOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10 cursor-default"
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-7 z-20 w-48 overflow-hidden rounded-xl border border-border-card bg-surface shadow-[var(--shadow-card)]">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12.5px] font-medium text-heading hover:bg-surface-muted"
                    onClick={() => {
                      setNameDraft(column.name)
                      setEditingName(true)
                      setMenuOpen(false)
                    }}
                  >
                    Rename column
                  </button>
                  <button
                    type="button"
                    disabled={!canMoveLeft}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12.5px] font-medium text-heading hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => {
                      onMoveColumn(column.id, 'left')
                      setMenuOpen(false)
                    }}
                  >
                    <ChevronLeftIcon /> Move left
                  </button>
                  <button
                    type="button"
                    disabled={!canMoveRight}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12.5px] font-medium text-heading hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => {
                      onMoveColumn(column.id, 'right')
                      setMenuOpen(false)
                    }}
                  >
                    <ChevronRightIcon /> Move right
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12.5px] font-medium text-danger hover:bg-[#fef2f2]"
                    onClick={() => {
                      onDeleteRequest(column.id)
                      setMenuOpen(false)
                    }}
                  >
                    <TrashIcon />
                    Delete column
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="min-h-10">
        {tasks.length === 0 && pendingTaskCount === 0 && !quickAddOpen && (
          <div className="mb-2 rounded-[10px] border-[1.5px] border-dashed border-border px-2.5 py-5 text-center text-xs text-placeholder-alt">
            No cards yet.
            {role !== 'viewer' && ' Drag one here or add below.'}
          </div>
        )}
        {tasks.map((t, index) => (
          <div key={t.id}>
            {dropIndex === index && (
              <div className="mb-2 h-1 rounded-full bg-primary" aria-hidden />
            )}
            <div
              onDragOver={(e) => {
                if (role === 'viewer' || columnDragging) return
                e.preventDefault()
                e.stopPropagation()
                const rect = e.currentTarget.getBoundingClientRect()
                const mid = rect.top + rect.height / 2
                onTaskDragOverIndex(column.id, e.clientY < mid ? index : index + 1)
              }}
              className={cn(pendingMoveTaskIds?.has(t.id) && 'animate-pulse opacity-60')}
            >
              <TaskBoardCard
                task={t}
                members={members}
                milestones={milestones}
                canEdit={canEditBoardTask(role, t, currentUserId)}
                onOpen={onOpenTask}
                onDragStart={onTaskDragStart}
                dragging={draggingId === t.id}
              />
            </div>
          </div>
        ))}
        {dropIndex === tasks.length && tasks.length > 0 && (
          <div className="mb-2 h-1 rounded-full bg-primary" aria-hidden />
        )}
        {Array.from({ length: pendingTaskCount }, (_, i) => (
          <PendingTaskCardSkeleton key={`pending-${column.id}-${i}`} />
        ))}
      </div>

      {role !== 'viewer' &&
        (quickAddOpen ? (
          <div className="rounded-[10px] border border-border-card bg-surface p-2">
            <textarea
              autoFocus
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder="Card title…"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  submitQuickAdd()
                }
                if (e.key === 'Escape') setQuickAddOpen(false)
              }}
              className="w-full resize-none border-none bg-transparent text-[13px] text-heading outline-none placeholder:text-placeholder-alt"
            />
            <div className="mt-1.5 flex gap-2">
              <button
                type="button"
                onClick={submitQuickAdd}
                className="rounded-md bg-primary px-3 py-1.5 text-[12.5px] font-semibold text-white hover:opacity-95"
              >
                Add card
              </button>
              <button
                type="button"
                onClick={() => setQuickAddOpen(false)}
                className="rounded-md p-1.5 text-text-muted hover:bg-surface-muted"
                aria-label="Cancel"
              >
                <CloseIcon className="size-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setQuickAddOpen(true)}
            className="flex w-full items-center gap-1.5 rounded-lg px-1.5 py-2 text-[13px] font-semibold text-text-muted hover:bg-[#E3E8F3]/60 hover:text-heading"
          >
            <PlusIcon className="size-3.5" /> Add a card
          </button>
        ))}
    </div>
  )
}
