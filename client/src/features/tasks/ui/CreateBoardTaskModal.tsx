import { useEffect, useState, type FormEvent } from 'react'
import type {
  BoardColumn,
  BoardMember,
  BoardMilestone,
  BoardSubtask,
  BoardTaskPriority,
} from '@/features/tasks/model/types'
import { BOARD_PRIORITY_OPTIONS } from '@/features/tasks/lib/board-utils'
import { PendingImageFilesField } from '@/features/tasks/ui/TaskAttachmentsSection'
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
import { PlusIcon } from '@/features/projects/ui/icons'
import { SelectField } from '@/shared/ui/SelectField'

export type CreateBoardTaskPayload = {
  title: string
  description: string
  assigneeId: string | null
  milestoneId: string | null
  priority: BoardTaskPriority
  dueDate: string
  columnId: string
  subtasks: BoardSubtask[]
  imageFiles: File[]
}

type CreateBoardTaskModalProps = {
  open: boolean
  columns: BoardColumn[]
  members: BoardMember[]
  milestones: BoardMilestone[]
  defaultColumnId: string
  defaultAssigneeId?: string | null
  isSubmitting?: boolean
  onClose: () => void
  onCreate: (payload: CreateBoardTaskPayload) => void | Promise<void>
}

const fieldClass =
  'mt-1.5 !h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-heading outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'

export function CreateBoardTaskModal({
  open,
  columns,
  members,
  milestones,
  defaultColumnId,
  defaultAssigneeId,
  isSubmitting,
  onClose,
  onCreate,
}: CreateBoardTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [milestoneId, setMilestoneId] = useState('')
  const [priority, setPriority] = useState<BoardTaskPriority>('medium')
  const [dueDate, setDueDate] = useState('')
  const [columnId, setColumnId] = useState(defaultColumnId)
  const [subtasks, setSubtasks] = useState<BoardSubtask[]>([])
  const [subDraft, setSubDraft] = useState('')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setColumnId(defaultColumnId)
      setAssigneeId(defaultAssigneeId ?? '')
      setSubmitError(null)
    }
  }, [open, defaultColumnId, defaultAssigneeId])

  const reset = () => {
    setTitle('')
    setDescription('')
    setAssigneeId(defaultAssigneeId ?? '')
    setMilestoneId('')
    setPriority('medium')
    setDueDate('')
    setColumnId(defaultColumnId)
    setSubtasks([])
    setSubDraft('')
    setImageFiles([])
    setSubmitError(null)
  }

  const handleClose = () => {
    if (isSubmitting) return
    reset()
    onClose()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || isSubmitting) return
    setSubmitError(null)
    try {
      await onCreate({
        title: title.trim(),
        description: description.trim(),
        assigneeId: assigneeId || null,
        milestoneId: milestoneId || null,
        priority,
        dueDate,
        columnId: columnId || defaultColumnId,
        subtasks,
        imageFiles,
      })
      reset()
      onClose()
    } catch {
      setSubmitError('Unable to create task. Please try again.')
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create task"
      subtitle="Add a full task card to this project board."
      className="sm:max-w-xl"
      footer={
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-board-task"
            size="md"
            shadow
            disabled={!title.trim() || isSubmitting}
          >
            {isSubmitting ? 'Creating…' : 'Create task'}
          </Button>
        </div>
      }
    >
      <form id="create-board-task" onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <label className="block text-sm font-medium text-label">
          Title
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={fieldClass}
            placeholder="Task title"
          />
        </label>

        <label className="block text-sm font-medium text-label">
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`${fieldClass} h-auto py-2`}
            placeholder="Optional description"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-label">
            Column
            <SelectField
              value={columnId}
              onChange={(e) => setColumnId(e.target.value)}
              className={fieldClass}
            >
              {columns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </SelectField>
          </label>

          <label className="block text-sm font-medium text-label">
            Assignee
            <SelectField
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className={fieldClass}
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </SelectField>
          </label>

          <label className="block text-sm font-medium text-label">
            Milestone
            <SelectField
              value={milestoneId}
              onChange={(e) => setMilestoneId(e.target.value)}
              className={fieldClass}
            >
              <option value="">None</option>
              {milestones.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </SelectField>
          </label>

          <label className="block text-sm font-medium text-label">
            Priority
            <SelectField
              value={priority}
              onChange={(e) => setPriority(e.target.value as BoardTaskPriority)}
              className={fieldClass}
            >
              {BOARD_PRIORITY_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </SelectField>
          </label>

          <label className="block text-sm font-medium text-label sm:col-span-2">
            Due date
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={fieldClass}
            />
          </label>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-label">Subtasks</p>
          <ul className="mb-2 space-y-1">
            {subtasks.map((s) => (
              <li key={s.id} className="text-sm text-heading">
                • {s.text}
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input
              value={subDraft}
              onChange={(e) => setSubDraft(e.target.value)}
              placeholder="Add a subtask"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (!subDraft.trim()) return
                  setSubtasks((prev) => [
                    ...prev,
                    { id: `local-${Date.now()}`, text: subDraft.trim(), done: false },
                  ])
                  setSubDraft('')
                }
              }}
              className={`${fieldClass} mt-0`}
            />
            <button
              type="button"
              onClick={() => {
                if (!subDraft.trim()) return
                setSubtasks((prev) => [
                  ...prev,
                  { id: `local-${Date.now()}`, text: subDraft.trim(), done: false },
                ])
                setSubDraft('')
              }}
              className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border text-primary hover:bg-primary-muted"
              aria-label="Add subtask"
            >
              <PlusIcon className="size-4" />
            </button>
          </div>
        </div>

        <PendingImageFilesField files={imageFiles} onChange={setImageFiles} />

        {submitError && <p className="text-sm text-danger">{submitError}</p>}
      </form>
    </Modal>
  )
}
