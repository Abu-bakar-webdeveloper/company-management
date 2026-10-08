import { useMemo, useRef, useState, type DragEvent } from 'react'
import type {
  BoardColumn,
  BoardFilters,
  BoardMember,
  BoardMilestone,
  BoardRole,
  BoardTask,
} from '@/features/tasks/model/types'
import { canEditBoardTask, filterBoardTasks, membersById } from '@/features/tasks/lib/board-utils'
import { AddBoardColumn } from '@/features/tasks/ui/AddBoardColumn'
import { PendingColumnSkeleton } from '@/features/tasks/ui/BoardSkeletons'
import { DeleteColumnDialog } from '@/features/tasks/ui/DeleteColumnDialog'
import { BOARD_DRAG_TYPE, TaskBoardColumn } from '@/features/tasks/ui/TaskBoardColumn'

export type PendingBoardColumn = { tempId: string; name: string }
export type PendingBoardTask = { tempId: string; columnId: string }

type KanbanBoardProps = {
  columns: BoardColumn[]
  tasks: BoardTask[]
  members: BoardMember[]
  milestones: BoardMilestone[]
  role: BoardRole
  currentUserId: string | null
  filters: BoardFilters
  pendingColumns?: PendingBoardColumn[]
  pendingTasks?: PendingBoardTask[]
  pendingMoveTaskIds?: Set<string>
  pendingMoveColumnIds?: Set<string>
  isDeletingColumn?: boolean
  onOpenTask: (task: BoardTask) => void
  onQuickAdd: (columnId: string, title: string) => void | Promise<void>
  onRenameColumn: (columnId: string, name: string) => void | Promise<void>
  onDeleteColumn: (columnId: string, moveToColumnId?: string) => void | Promise<void>
  onAddColumn: (name: string) => void | Promise<void>
  onMoveTask: (taskId: string, columnId: string, sortOrder?: number) => void
  onReorderColumns: (orderedIds: string[]) => void
}

export function KanbanBoard({
  columns,
  tasks,
  members,
  milestones,
  role,
  currentUserId,
  filters,
  pendingColumns = [],
  pendingTasks = [],
  pendingMoveTaskIds,
  pendingMoveColumnIds,
  isDeletingColumn = false,
  onOpenTask,
  onQuickAdd,
  onRenameColumn,
  onDeleteColumn,
  onAddColumn,
  onMoveTask,
  onReorderColumns,
}: KanbanBoardProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const dragTaskRef = useRef<BoardTask | null>(null)
  const dragColumnIdRef = useRef<string | null>(null)
  const [draggingColumnId, setDraggingColumnId] = useState<string | null>(null)
  const [columnDropTargetId, setColumnDropTargetId] = useState<string | null>(null)
  const [cardDrop, setCardDrop] = useState<{ columnId: string; index: number } | null>(null)

  const [deleteColumnId, setDeleteColumnId] = useState<string | null>(null)
  const [moveToId, setMoveToId] = useState('')

  const memberMap = useMemo(() => membersById(members), [members])
  const milestoneMap = useMemo(() => membersById(milestones), [milestones])
  const filtered = useMemo(() => filterBoardTasks(tasks, filters), [tasks, filters])

  const sortedColumns = useMemo(
    () => columns.slice().sort((a, b) => a.order - b.order),
    [columns],
  )

  const deleteColumn = columns.find((c) => c.id === deleteColumnId) ?? null
  const otherColumns = columns.filter((c) => c.id !== deleteColumnId)
  const cardsInDeleteColumn = deleteColumn
    ? tasks.filter((t) => t.columnId === deleteColumn.id).length
    : 0

  const handleTaskDragStart = (e: DragEvent, task: BoardTask) => {
    dragTaskRef.current = task
    dragColumnIdRef.current = null
    setDraggingColumnId(null)
    setDraggingId(task.id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData(BOARD_DRAG_TYPE, 'task')
  }

  const handleTaskDragOverIndex = (columnId: string, index: number) => {
    if (!dragTaskRef.current) return
    setCardDrop({ columnId, index })
  }

  const handleDropCard = (e: DragEvent, targetColumnId: string) => {
    e.preventDefault()
    const task = dragTaskRef.current
    const insertAt = cardDrop?.columnId === targetColumnId ? cardDrop.index : undefined
    setDraggingId(null)
    dragTaskRef.current = null
    setCardDrop(null)
    if (!task) return
    if (!canEditBoardTask(role, task, currentUserId)) return

    if (task.columnId === targetColumnId) {
      if (insertAt === undefined) return
      // Adjust for removing the card from its current index
      const columnTasks = filtered
        .filter((t) => t.columnId === targetColumnId)
        .sort((a, b) => a.sortOrder - b.sortOrder)
      const fromIndex = columnTasks.findIndex((t) => t.id === task.id)
      if (fromIndex < 0) return
      let toIndex = insertAt
      if (fromIndex < toIndex) toIndex -= 1
      if (toIndex === fromIndex) return
      onMoveTask(task.id, targetColumnId, toIndex)
      return
    }

    onMoveTask(task.id, targetColumnId, insertAt)
  }

  const handleColumnDragStart = (e: DragEvent, column: BoardColumn) => {
    dragColumnIdRef.current = column.id
    dragTaskRef.current = null
    setDraggingId(null)
    setDraggingColumnId(column.id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData(BOARD_DRAG_TYPE, 'column')
    // Stop card drag from competing
    e.stopPropagation()
  }

  const handleColumnDragOver = (e: DragEvent, columnId: string) => {
    if (!dragColumnIdRef.current) return
    e.preventDefault()
    if (dragColumnIdRef.current !== columnId) {
      setColumnDropTargetId(columnId)
    }
  }

  const handleColumnDrop = (e: DragEvent, targetColumnId: string) => {
    e.preventDefault()
    const sourceId = dragColumnIdRef.current
    setDraggingColumnId(null)
    setColumnDropTargetId(null)
    dragColumnIdRef.current = null
    if (!sourceId || sourceId === targetColumnId) return
    if (role !== 'pm') return

    const ids = sortedColumns.map((c) => c.id)
    const from = ids.indexOf(sourceId)
    const to = ids.indexOf(targetColumnId)
    if (from < 0 || to < 0) return
    const next = [...ids]
    next.splice(from, 1)
    next.splice(to, 0, sourceId)
    onReorderColumns(next)
  }

  const handleColumnDragEnd = () => {
    setDraggingColumnId(null)
    setColumnDropTargetId(null)
    dragColumnIdRef.current = null
  }

  const moveColumnByDirection = (columnId: string, direction: 'left' | 'right') => {
    if (role !== 'pm') return
    const ids = sortedColumns.map((c) => c.id)
    const from = ids.indexOf(columnId)
    if (from < 0) return
    const to = direction === 'left' ? from - 1 : from + 1
    if (to < 0 || to >= ids.length) return
    const next = [...ids]
    next.splice(from, 1)
    next.splice(to, 0, columnId)
    onReorderColumns(next)
  }

  const requestDeleteColumn = (id: string) => {
    const others = columns.filter((c) => c.id !== id)
    setDeleteColumnId(id)
    setMoveToId(others[0]?.id ?? '')
  }

  const confirmDeleteColumn = async () => {
    if (!deleteColumnId || isDeletingColumn) return
    try {
      await onDeleteColumn(
        deleteColumnId,
        cardsInDeleteColumn > 0 ? moveToId || undefined : undefined,
      )
      setDeleteColumnId(null)
    } catch {
      // Parent surfaces toast; keep dialog open for retry.
    }
  }

  if (columns.length === 0 && pendingColumns.length === 0) {
    return (
      <div className="px-5 py-20 text-center">
        <p className="mb-1.5 text-[15px] font-bold text-heading">This board is empty</p>
        <p className="mb-4 text-[13px] text-placeholder-alt">
          Add a column to start organizing work.
        </p>
        {role === 'pm' && (
          <div className="flex justify-center">
            <AddBoardColumn onAdd={onAddColumn} />
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="flex items-start gap-4 overflow-x-auto pb-5">
        {sortedColumns.map((col, colIndex) => (
          <TaskBoardColumn
            key={col.id}
            column={col}
            tasks={filtered
              .filter((t) => t.columnId === col.id)
              .sort((a, b) => a.sortOrder - b.sortOrder)}
            members={memberMap}
            milestones={milestoneMap}
            role={role}
            currentUserId={currentUserId}
            pendingTaskCount={pendingTasks.filter((p) => p.columnId === col.id).length}
            pendingMove={pendingMoveColumnIds?.has(col.id)}
            pendingMoveTaskIds={pendingMoveTaskIds}
            onOpenTask={onOpenTask}
            onTaskDragStart={handleTaskDragStart}
            onTaskDragOverIndex={handleTaskDragOverIndex}
            onDropCard={handleDropCard}
            draggingId={draggingId}
            columnDragging={draggingColumnId === col.id}
            columnDropHighlight={columnDropTargetId === col.id}
            canMoveLeft={colIndex > 0}
            canMoveRight={colIndex < sortedColumns.length - 1}
            dropIndex={cardDrop?.columnId === col.id ? cardDrop.index : null}
            onColumnDragStart={handleColumnDragStart}
            onColumnDragOver={handleColumnDragOver}
            onColumnDrop={handleColumnDrop}
            onColumnDragEnd={handleColumnDragEnd}
            onMoveColumn={moveColumnByDirection}
            onQuickAdd={onQuickAdd}
            onRename={onRenameColumn}
            onDeleteRequest={requestDeleteColumn}
          />
        ))}
        {pendingColumns.map((col) => (
          <PendingColumnSkeleton key={col.tempId} name={col.name} />
        ))}
        {role === 'pm' && <AddBoardColumn onAdd={onAddColumn} />}
      </div>

      <DeleteColumnDialog
        open={Boolean(deleteColumnId)}
        column={deleteColumn}
        otherColumns={otherColumns}
        cardCount={cardsInDeleteColumn}
        moveToId={moveToId}
        isPending={isDeletingColumn}
        onMoveToChange={setMoveToId}
        onClose={() => {
          if (!isDeletingColumn) setDeleteColumnId(null)
        }}
        onConfirm={confirmDeleteColumn}
      />
    </>
  )
}
