import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/model/AuthContext'
import { toBoardColumn, toBoardTask } from '@/features/tasks/api/tasksApi'
import {
  useAddTaskAttachment,
  useCreateBoardColumn,
  useCreateBoardTask,
  useDeleteBoardColumn,
  useDeleteBoardTask,
  useDeleteTaskAttachment,
  useMoveBoardTask,
  useProjectBoard,
  useQuickCreateBoardTask,
  useReorderBoardColumns,
  useUpdateBoardColumn,
  useUpdateBoardTask,
} from '@/features/tasks/hooks/useTasks'
import type { BoardColumn, BoardFilters, BoardTask } from '@/features/tasks/model/types'
import {
  canEditBoardTask,
  resolveBoardRole,
} from '@/features/tasks/lib/board-utils'
import { BoardLoadSkeleton } from '@/features/tasks/ui/BoardSkeletons'
import { CreateBoardTaskModal } from '@/features/tasks/ui/CreateBoardTaskModal'
import {
  KanbanBoard,
  type PendingBoardColumn,
  type PendingBoardTask,
} from '@/features/tasks/ui/KanbanBoard'
import { TaskBoardDetailPanel } from '@/features/tasks/ui/TaskBoardDetailPanel'
import { TaskBoardHeader } from '@/features/tasks/ui/TaskBoardHeader'
import { getErrorMessage } from '@/shared/api/errors'
import { uploadTaskImageToCloudinary } from '@/shared/lib/uploadAvatar'

const emptyFilters: BoardFilters = {
  search: '',
  assignee: '',
  priority: '',
  milestone: '',
}

function tempId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function ProjectTaskBoardPage() {
  const { id: projectId } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const taskFromUrl = searchParams.get('task')
  const { user } = useAuth()
  const { data: board, isLoading, isError } = useProjectBoard(projectId)

  const [filters, setFilters] = useState<BoardFilters>(emptyFilters)
  const [openTaskId, setOpenTaskId] = useState<string | null>(taskFromUrl)
  const [createOpen, setCreateOpen] = useState(false)
  const [optimisticTasks, setOptimisticTasks] = useState<BoardTask[] | null>(null)
  const [optimisticColumns, setOptimisticColumns] = useState<BoardColumn[] | null>(null)
  const [pendingColumns, setPendingColumns] = useState<PendingBoardColumn[]>([])
  const [pendingTasks, setPendingTasks] = useState<PendingBoardTask[]>([])
  const [pendingMoveTaskIds, setPendingMoveTaskIds] = useState<Set<string>>(() => new Set())
  const [pendingMoveColumnIds, setPendingMoveColumnIds] = useState<Set<string>>(() => new Set())
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false)
  const [attachmentError, setAttachmentError] = useState<string | null>(null)
  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const [isDeletingColumn, setIsDeletingColumn] = useState(false)

  const createColumn = useCreateBoardColumn(projectId ?? '')
  const updateColumn = useUpdateBoardColumn(projectId ?? '')
  const deleteColumn = useDeleteBoardColumn(projectId ?? '')
  const reorderColumns = useReorderBoardColumns(projectId ?? '')
  const quickCreate = useQuickCreateBoardTask(projectId ?? '')
  const createTask = useCreateBoardTask(projectId ?? '')
  const updateTask = useUpdateBoardTask(projectId ?? '')
  const deleteTask = useDeleteBoardTask(projectId ?? '')
  const moveTask = useMoveBoardTask(projectId ?? '')
  const addAttachment = useAddTaskAttachment(projectId ?? '')
  const removeAttachment = useDeleteTaskAttachment(projectId ?? '')

  const serverColumns = useMemo(
    () => (board?.columns ?? []).map(toBoardColumn),
    [board?.columns],
  )
  const columns = optimisticColumns ?? serverColumns
  const serverTasks = useMemo(
    () => (board?.tasks ?? []).map(toBoardTask),
    [board?.tasks],
  )
  const tasks = optimisticTasks ?? serverTasks
  const members = board?.members ?? []
  const milestones = board?.milestones ?? []

  const role = resolveBoardRole(user, board?.canManageBoard ?? false)
  const currentUserId = user?.id ?? null

  useEffect(() => {
    if (taskFromUrl) {
      setOpenTaskId(taskFromUrl)
    }
  }, [taskFromUrl])

  useEffect(() => {
    if (!taskFromUrl || isLoading || !board) return
    const exists = serverTasks.some((t) => t.id === taskFromUrl)
    if (!exists) {
      setOpenTaskId(null)
      const next = new URLSearchParams(searchParams)
      next.delete('task')
      setSearchParams(next, { replace: true })
    }
  }, [taskFromUrl, isLoading, board, serverTasks, searchParams, setSearchParams])

  const clearOpenTask = () => {
    setOpenTaskId(null)
    setAttachmentError(null)
    if (searchParams.has('task')) {
      const next = new URLSearchParams(searchParams)
      next.delete('task')
      setSearchParams(next, { replace: true })
    }
  }

  const openTask = useMemo(
    () => (openTaskId ? tasks.find((t) => t.id === openTaskId) ?? null : null),
    [openTaskId, tasks],
  )

  const attachFilesToTask = async (taskId: string, files: File[]) => {
    for (const file of files) {
      const uploaded = await uploadTaskImageToCloudinary(file)
      const mimeType =
        file.type ||
        (file.name.toLowerCase().endsWith('.png')
          ? 'image/png'
          : file.name.toLowerCase().endsWith('.webp')
            ? 'image/webp'
            : file.name.toLowerCase().endsWith('.gif')
              ? 'image/gif'
              : 'image/jpeg')
      await addAttachment.mutateAsync({
        taskId,
        payload: {
          url: uploaded.url,
          publicId: uploaded.publicId,
          fileName: file.name,
          mimeType,
          sizeBytes: file.size,
        },
      })
    }
  }

  if (!projectId) {
    return (
      <div className="p-8">
        <p className="font-semibold text-heading">Missing project</p>
      </div>
    )
  }

  if (isLoading) {
    return <BoardLoadSkeleton />
  }

  if (isError || !board) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="font-semibold text-heading">Project not found</p>
        <Link to="/projects" className="mt-4 inline-block text-sm text-primary">
          Back to Projects
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <TaskBoardHeader
        projectId={projectId}
        projectName={board.projectName}
        filters={filters}
        members={members}
        milestones={milestones}
        onFiltersChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
        canCreate={role !== 'viewer'}
        onOpenCreate={() => setCreateOpen(true)}
      />

      <KanbanBoard
        columns={columns}
        tasks={tasks}
        members={members}
        milestones={milestones}
        role={role}
        currentUserId={currentUserId}
        filters={filters}
        pendingColumns={pendingColumns}
        pendingTasks={pendingTasks}
        pendingMoveTaskIds={pendingMoveTaskIds}
        pendingMoveColumnIds={pendingMoveColumnIds}
        isDeletingColumn={isDeletingColumn}
        onOpenTask={(task) => {
          setOpenTaskId(task.id)
          setAttachmentError(null)
          const next = new URLSearchParams(searchParams)
          next.set('task', task.id)
          setSearchParams(next, { replace: true })
        }}
        onQuickAdd={async (columnId, title) => {
          const id = tempId('task')
          setPendingTasks((prev) => [...prev, { tempId: id, columnId }])
          try {
            await quickCreate.mutateAsync({ columnId, title })
            toast.success('Card created')
          } catch (error) {
            toast.error(getErrorMessage(error, 'Unable to create card'))
          } finally {
            setPendingTasks((prev) => prev.filter((p) => p.tempId !== id))
          }
        }}
        onRenameColumn={async (columnId, name) => {
          try {
            await updateColumn.mutateAsync({ columnId, name })
            toast.success('Column renamed')
          } catch (error) {
            toast.error(getErrorMessage(error, 'Unable to rename column'))
          }
        }}
        onDeleteColumn={async (columnId, moveToColumnId) => {
          setIsDeletingColumn(true)
          try {
            await deleteColumn.mutateAsync({ columnId, moveToColumnId })
            toast.success('Column deleted')
          } catch (error) {
            toast.error(getErrorMessage(error, 'Unable to delete column'))
            throw error
          } finally {
            setIsDeletingColumn(false)
          }
        }}
        onAddColumn={async (name) => {
          const id = tempId('col')
          setPendingColumns((prev) => [...prev, { tempId: id, name }])
          try {
            await createColumn.mutateAsync(name)
            toast.success('Column created')
          } catch (error) {
            toast.error(getErrorMessage(error, 'Unable to create column'))
          } finally {
            setPendingColumns((prev) => prev.filter((p) => p.tempId !== id))
          }
        }}
        onReorderColumns={(orderedIds) => {
          const previous = (optimisticColumns ?? serverColumns).map((c) => c.id)
          setOptimisticColumns((prev) => {
            const base = prev ?? serverColumns
            return orderedIds.map((id, index) => {
              const col = base.find((c) => c.id === id)
              return col ? { ...col, order: index } : { id, name: 'Column', order: index }
            })
          })
          setPendingMoveColumnIds(new Set(orderedIds.filter((id, i) => previous[i] !== id)))
          void reorderColumns
            .mutateAsync(orderedIds)
            .catch((error) => {
              toast.error(getErrorMessage(error, 'Unable to reorder columns'))
            })
            .finally(() => {
              setOptimisticColumns(null)
              setPendingMoveColumnIds(new Set())
            })
        }}
        onMoveTask={(taskId, columnId, sortOrder) => {
          setOptimisticTasks((prev) => {
            const base = prev ?? serverTasks
            const moving = base.find((t) => t.id === taskId)
            if (!moving) return base

            const others = base.filter((t) => t.id !== taskId)
            const targetTasks = others
              .filter((t) => t.columnId === columnId)
              .sort((a, b) => a.sortOrder - b.sortOrder)
            const insertAt =
              sortOrder === undefined
                ? targetTasks.length
                : Math.max(0, Math.min(sortOrder, targetTasks.length))
            targetTasks.splice(insertAt, 0, { ...moving, columnId })

            const reindexedTarget = targetTasks.map((t, index) => ({ ...t, sortOrder: index }))
            const targetIds = new Set(reindexedTarget.map((t) => t.id))
            const rest = others
              .filter((t) => t.columnId !== columnId)
              .map((t) => t)

            if (moving.columnId !== columnId) {
              const oldColumnTasks = others
                .filter((t) => t.columnId === moving.columnId)
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((t, index) => ({ ...t, sortOrder: index }))
              return [
                ...rest.filter((t) => t.columnId !== moving.columnId),
                ...oldColumnTasks,
                ...reindexedTarget,
              ]
            }

            return [...rest.filter((t) => !targetIds.has(t.id)), ...reindexedTarget]
          })
          setPendingMoveTaskIds((prev) => new Set(prev).add(taskId))
          void moveTask
            .mutateAsync({ taskId, columnId, sortOrder })
            .catch((error) => {
              toast.error(getErrorMessage(error, 'Unable to move card'))
            })
            .finally(() => {
              setOptimisticTasks(null)
              setPendingMoveTaskIds((prev) => {
                const next = new Set(prev)
                next.delete(taskId)
                return next
              })
            })
        }}
      />

      {openTask && (
        <TaskBoardDetailPanel
          task={openTask}
          members={members}
          milestones={milestones}
          canEdit={canEditBoardTask(role, openTask, currentUserId)}
          isUploadingAttachment={isUploadingAttachment}
          attachmentError={attachmentError}
          onClose={clearOpenTask}
          onUpdate={async (updated) => {
            try {
              const dto = await updateTask.mutateAsync({
                taskId: updated.id,
                payload: {
                  title: updated.title,
                  description: updated.description,
                  assigneeId: updated.assigneeId,
                  milestoneId: updated.milestoneId,
                  priority: updated.priority,
                  dueDate: updated.dueDate || null,
                  subtasks: updated.subtasks.map((s) => ({
                    id: s.id.startsWith('local-') ? undefined : s.id,
                    text: s.text,
                    done: s.done,
                  })),
                },
              })
              return toBoardTask(dto)
            } catch (error) {
              toast.error(getErrorMessage(error, 'Unable to save changes'))
              throw error
            }
          }}
          onDelete={async (id) => {
            try {
              await deleteTask.mutateAsync(id)
              toast.success('Card deleted')
              clearOpenTask()
            } catch (error) {
              toast.error(getErrorMessage(error, 'Unable to delete card'))
            }
          }}
          onUploadAttachments={async (files) => {
            setAttachmentError(null)
            setIsUploadingAttachment(true)
            try {
              await attachFilesToTask(openTask.id, files)
              toast.success(files.length > 1 ? 'Images uploaded' : 'Image uploaded')
            } catch {
              setAttachmentError('Unable to upload image. Please try again.')
              toast.error('Unable to upload image')
            } finally {
              setIsUploadingAttachment(false)
            }
          }}
          onRemoveAttachment={async (attachmentId) => {
            setAttachmentError(null)
            try {
              await removeAttachment.mutateAsync({
                taskId: openTask.id,
                attachmentId,
              })
              toast.success('Image removed')
            } catch {
              setAttachmentError('Unable to remove image. Please try again.')
              toast.error('Unable to remove image')
            }
          }}
        />
      )}

      <CreateBoardTaskModal
        open={createOpen}
        columns={columns}
        members={members}
        milestones={milestones}
        defaultColumnId={columns[0]?.id ?? ''}
        defaultAssigneeId={currentUserId}
        isSubmitting={isCreatingTask}
        onClose={() => setCreateOpen(false)}
        onCreate={async (payload) => {
          const pendingId = tempId('task')
          setIsCreatingTask(true)
          setPendingTasks((prev) => [
            ...prev,
            { tempId: pendingId, columnId: payload.columnId },
          ])
          try {
            const dto = await createTask.mutateAsync({
              title: payload.title,
              description: payload.description,
              columnId: payload.columnId,
              assigneeId: payload.assigneeId,
              milestoneId: payload.milestoneId,
              priority: payload.priority,
              dueDate: payload.dueDate || null,
              subtasks: payload.subtasks.map((s) => ({ text: s.text, done: s.done })),
            })
            if (payload.imageFiles.length > 0) {
              try {
                await attachFilesToTask(dto.id, payload.imageFiles)
              } catch {
                toast.error('Card created, but image upload failed')
              }
            }
            toast.success('Card created')
          } catch (error) {
            toast.error(getErrorMessage(error, 'Unable to create card'))
            throw error
          } finally {
            setIsCreatingTask(false)
            setPendingTasks((prev) => prev.filter((p) => p.tempId !== pendingId))
          }
        }}
      />
    </div>
  )
}
