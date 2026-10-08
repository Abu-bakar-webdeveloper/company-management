import { useEffect, useMemo, useRef, useState } from 'react'
import type {
  BoardMember,
  BoardMilestone,
  BoardTask,
  BoardTaskPriority,
} from '@/features/tasks/model/types'
import { BOARD_PRIORITY_OPTIONS } from '@/features/tasks/lib/board-utils'
import { BoardAvatar } from '@/features/tasks/ui/BoardAvatar'
import { BoardMilestoneChip } from '@/features/tasks/ui/BoardMilestoneChip'
import { BoardPriorityFlag } from '@/features/tasks/ui/BoardPriorityFlag'
import { TaskAttachmentsSection } from '@/features/tasks/ui/TaskAttachmentsSection'
import { CloseIcon, MessageIcon, PaperclipIcon, TrashIcon } from '@/features/tasks/ui/boardIcons'
import { PlusIcon } from '@/features/projects/ui/icons'
import { cn } from '@/shared/lib/cn'
import { SelectField } from '@/shared/ui/SelectField'

type TaskBoardDetailPanelProps = {
  task: BoardTask
  members: BoardMember[]
  milestones: BoardMilestone[]
  canEdit: boolean
  isUploadingAttachment?: boolean
  attachmentError?: string | null
  onClose: () => void
  onUpdate: (task: BoardTask) => BoardTask | Promise<BoardTask>
  onDelete: (id: string) => void | Promise<void>
  onUploadAttachments: (files: File[]) => void | Promise<void>
  onRemoveAttachment: (attachmentId: string) => void | Promise<void>
}

const AUTOSAVE_DELAY_MS = 600

const fieldClass =
  '!h-9 w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[13px] text-heading outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'

function isTaskDirty(a: BoardTask, b: BoardTask): boolean {
  return (
    a.title !== b.title ||
    a.description !== b.description ||
    a.assigneeId !== b.assigneeId ||
    a.priority !== b.priority ||
    a.dueDate !== b.dueDate ||
    a.milestoneId !== b.milestoneId ||
    JSON.stringify(a.subtasks) !== JSON.stringify(b.subtasks)
  )
}

function applySavedToLocal(current: BoardTask, snapshot: BoardTask, saved: BoardTask): BoardTask {
  if (!isTaskDirty(current, snapshot)) {
    return {
      ...saved,
      attachmentItems: current.attachmentItems,
      attachments: current.attachments,
      image: current.image,
    }
  }

  const idByOld = new Map(
    snapshot.subtasks.map((subtask, index) => [subtask.id, saved.subtasks[index]?.id ?? subtask.id]),
  )

  return {
    ...current,
    subtasks: current.subtasks.map((subtask) => ({
      ...subtask,
      id: idByOld.get(subtask.id) ?? subtask.id,
    })),
  }
}

export function TaskBoardDetailPanel({
  task,
  members,
  milestones,
  canEdit,
  isUploadingAttachment,
  attachmentError,
  onClose,
  onUpdate,
  onDelete,
  onUploadAttachments,
  onRemoveAttachment,
}: TaskBoardDetailPanelProps) {
  const [local, setLocal] = useState(task)
  const [baseline, setBaseline] = useState(task)
  const [newSubtask, setNewSubtask] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const localRef = useRef(local)
  const baselineRef = useRef(baseline)
  const onUpdateRef = useRef(onUpdate)
  const onCloseRef = useRef(onClose)
  const canEditRef = useRef(canEdit)
  const saveSeqRef = useRef(0)
  const debounceTimerRef = useRef<number | null>(null)
  const skipUnmountFlushRef = useRef(false)

  localRef.current = local
  baselineRef.current = baseline
  onUpdateRef.current = onUpdate
  onCloseRef.current = onClose
  canEditRef.current = canEdit

  useEffect(() => {
    setLocal(task)
    setBaseline(task)
    setSaveError(null)
    setNewSubtask('')
    saveSeqRef.current += 1
    skipUnmountFlushRef.current = false
  }, [task.id])

  useEffect(() => {
    setLocal((prev) => ({
      ...prev,
      attachmentItems: task.attachmentItems,
      attachments: task.attachments,
      image: task.image,
    }))
    setBaseline((prev) => ({
      ...prev,
      attachmentItems: task.attachmentItems,
      attachments: task.attachments,
      image: task.image,
    }))
  }, [task.attachmentItems, task.attachments, task.image])

  const isDirty = useMemo(() => isTaskDirty(local, baseline), [local, baseline])

  const persist = async (snapshot: BoardTask) => {
    if (!canEditRef.current || !isTaskDirty(snapshot, baselineRef.current)) return

    const seq = ++saveSeqRef.current
    setIsSaving(true)
    try {
      const saved = await onUpdateRef.current(snapshot)
      if (seq !== saveSeqRef.current) return

      setBaseline({
        ...saved,
        attachmentItems: localRef.current.attachmentItems,
        attachments: localRef.current.attachments,
        image: localRef.current.image,
      })
      setLocal((current) => applySavedToLocal(current, snapshot, saved))
      setSaveError(null)
    } catch {
      if (seq === saveSeqRef.current) {
        setSaveError('Unable to save changes. Please try again.')
      }
    } finally {
      if (seq === saveSeqRef.current) setIsSaving(false)
    }
  }

  const flushPendingSave = () => {
    if (debounceTimerRef.current != null) {
      window.clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    const snapshot = localRef.current
    if (canEditRef.current && isTaskDirty(snapshot, baselineRef.current)) {
      baselineRef.current = snapshot
      void Promise.resolve(onUpdateRef.current(snapshot)).catch(() => {
        setSaveError('Unable to save changes. Please try again.')
      })
    }
  }

  const handleClose = () => {
    skipUnmountFlushRef.current = true
    flushPendingSave()
    onCloseRef.current()
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      skipUnmountFlushRef.current = true
      if (debounceTimerRef.current != null) {
        window.clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
      const snapshot = localRef.current
      if (canEditRef.current && isTaskDirty(snapshot, baselineRef.current)) {
        baselineRef.current = snapshot
        void onUpdateRef.current(snapshot)
      }
      onCloseRef.current()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    if (!canEdit || !isDirty) return

    if (debounceTimerRef.current != null) {
      window.clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = window.setTimeout(() => {
      debounceTimerRef.current = null
      void persist(localRef.current)
    }, AUTOSAVE_DELAY_MS)

    return () => {
      if (debounceTimerRef.current != null) {
        window.clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
    }
  }, [canEdit, isDirty, local, baseline])

  useEffect(() => {
    return () => {
      if (skipUnmountFlushRef.current) return
      if (debounceTimerRef.current != null) {
        window.clearTimeout(debounceTimerRef.current)
      }
      const snapshot = localRef.current
      if (canEditRef.current && isTaskDirty(snapshot, baselineRef.current)) {
        void onUpdateRef.current(snapshot)
      }
    }
  }, [])

  const patchLocal = (patch: Partial<BoardTask>) => {
    setLocal((prev) => ({ ...prev, ...patch }))
    setSaveError(null)
  }

  const assignee = members.find((m) => m.id === local.assigneeId)
  const milestone = milestones.find((m) => m.id === local.milestoneId)

  const toggleSub = (id: string) => {
    patchLocal({
      subtasks: local.subtasks.map((s) => (s.id === id ? { ...s, done: !s.done } : s)),
    })
  }

  const addSubtask = () => {
    if (!newSubtask.trim()) return
    patchLocal({
      subtasks: [
        ...local.subtasks,
        { id: `local-${Date.now()}`, text: newSubtask.trim(), done: false },
      ],
    })
    setNewSubtask('')
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close panel"
        onClick={handleClose}
        className="fixed inset-0 z-40 bg-[#0a1628]/40 backdrop-blur-[2px]"
      />
      <aside
        role="dialog"
        aria-modal="true"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[440px] flex-col border-l border-border-card bg-surface shadow-[var(--shadow-card)]"
      >
        {local.image && (
          <div
            className="h-[150px] shrink-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${local.image})` }}
          />
        )}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="mb-3.5 flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <BoardPriorityFlag priority={local.priority} />
              <BoardMilestoneChip milestone={milestone} />
              {(isSaving || isDirty) && canEdit && (
                <span className="text-[11px] font-semibold text-text-muted">
                  {isSaving ? 'Saving…' : 'Unsaved'}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg p-1 text-text-muted hover:bg-surface-muted hover:text-heading"
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </div>

          {canEdit ? (
            <textarea
              value={local.title}
              onChange={(e) => patchLocal({ title: e.target.value })}
              rows={2}
              className="mb-3.5 w-full resize-none border-none bg-transparent text-[19px] font-bold text-heading outline-none"
            />
          ) : (
            <h2 className="mb-3.5 text-[19px] font-bold text-heading">{local.title}</h2>
          )}

          <div className="mb-5 grid grid-cols-[90px_1fr] items-center gap-y-3.5 text-[13px]">
            <span className="font-semibold text-text-muted">Assignee</span>
            <div className="flex items-center gap-2">
              <BoardAvatar member={assignee} size="sm" />
              {canEdit ? (
                <SelectField
                  value={local.assigneeId ?? ''}
                  onChange={(e) => patchLocal({ assigneeId: e.target.value || null })}
                  className={fieldClass}
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </SelectField>
              ) : (
                <span className="text-heading">{assignee?.name ?? '—'}</span>
              )}
            </div>

            <span className="font-semibold text-text-muted">Priority</span>
            {canEdit ? (
              <SelectField
                value={local.priority}
                onChange={(e) => patchLocal({ priority: e.target.value as BoardTaskPriority })}
                className={fieldClass}
              >
                {BOARD_PRIORITY_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </SelectField>
            ) : (
              <span className="text-heading">
                {BOARD_PRIORITY_OPTIONS.find((p) => p.value === local.priority)?.label}
              </span>
            )}

            <span className="font-semibold text-text-muted">Due date</span>
            {canEdit ? (
              <input
                type="date"
                value={local.dueDate}
                onChange={(e) => patchLocal({ dueDate: e.target.value })}
                className={fieldClass}
              />
            ) : (
              <span className="text-heading">{local.dueDate || '—'}</span>
            )}

            <span className="font-semibold text-text-muted">Milestone</span>
            {canEdit ? (
              <SelectField
                value={local.milestoneId ?? ''}
                onChange={(e) => patchLocal({ milestoneId: e.target.value || null })}
                className={fieldClass}
              >
                <option value="">None</option>
                {milestones.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </SelectField>
            ) : (
              <span className="text-heading">{milestone?.name ?? '—'}</span>
            )}
          </div>

          <div className="mb-5">
            <p className="mb-1.5 text-[12.5px] font-bold uppercase tracking-wide text-text-muted">
              Description
            </p>
            {canEdit ? (
              <textarea
                value={local.description}
                onChange={(e) => patchLocal({ description: e.target.value })}
                rows={3}
                placeholder="Add a description…"
                className={cn(fieldClass, 'resize-y')}
              />
            ) : (
              <p className="text-[13px] leading-relaxed text-heading">
                {local.description || 'No description.'}
              </p>
            )}
          </div>

          <div className="mb-5">
            <p className="mb-2 text-[12.5px] font-bold uppercase tracking-wide text-text-muted">
              Subtasks
              {local.subtasks.length > 0 &&
                ` (${local.subtasks.filter((s) => s.done).length}/${local.subtasks.length})`}
            </p>
            {local.subtasks.map((s) => (
              <label
                key={s.id}
                className={cn(
                  'flex items-center gap-2 py-1.5 text-[13px]',
                  canEdit ? 'cursor-pointer' : 'cursor-default',
                )}
              >
                <input
                  type="checkbox"
                  checked={s.done}
                  disabled={!canEdit}
                  onChange={() => toggleSub(s.id)}
                  className="size-3.5 accent-primary"
                />
                <span
                  className={cn(
                    s.done ? 'text-placeholder-alt line-through' : 'text-heading',
                  )}
                >
                  {s.text}
                </span>
              </label>
            ))}
            {local.subtasks.length === 0 && (
              <p className="text-[12.5px] text-placeholder-alt">No subtasks.</p>
            )}
            {canEdit && (
              <div className="mt-2 flex gap-2">
                <input
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Add subtask…"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addSubtask()
                    }
                  }}
                  className={fieldClass}
                />
                <button
                  type="button"
                  onClick={addSubtask}
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white hover:opacity-95"
                  aria-label="Add subtask"
                >
                  <PlusIcon className="size-3.5" />
                </button>
              </div>
            )}
          </div>

          <TaskAttachmentsSection
            items={local.attachmentItems}
            canEdit={canEdit}
            isUploading={isUploadingAttachment}
            error={attachmentError}
            onUploadFiles={(files) => void onUploadAttachments(files)}
            onRemove={(id) => void onRemoveAttachment(id)}
          />

          <div className="mb-6 flex gap-3.5 border-t border-border-card pt-3.5 text-[12.5px] text-text-muted">
            <span className="inline-flex items-center gap-1">
              <MessageIcon /> {local.comments} comments
            </span>
            <span className="inline-flex items-center gap-1">
              <PaperclipIcon /> {local.attachments} files
            </span>
          </div>

          {canEdit && (
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => {
                setIsDeleting(true)
                void Promise.resolve(onDelete(local.id))
                  .catch(() => {
                    // Parent toasts; keep panel open.
                  })
                  .finally(() => setIsDeleting(false))
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#fecaca] px-3 py-2 text-[12.5px] font-semibold text-danger hover:bg-[#fef2f2] disabled:opacity-60"
            >
              <TrashIcon /> {isDeleting ? 'Deleting…' : 'Delete card'}
            </button>
          )}

          {saveError && <p className="mt-3 text-sm text-danger">{saveError}</p>}
        </div>
      </aside>
    </>
  )
}
