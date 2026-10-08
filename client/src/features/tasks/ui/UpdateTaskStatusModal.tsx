import { useEffect, useState } from 'react'
import type { TaskStatus } from '@/features/tasks/model/types'
import { TaskStatusBadge } from '@/features/tasks/ui/TaskStatusBadge'
import { ChevronSelect } from '@/shared/ui/ChevronSelect'
import { Modal } from '@/shared/ui/Modal'

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'hold', label: 'On Hold' },
  { value: 'overdue', label: 'Overdue' },
]

type UpdateTaskStatusModalProps = {
  open: boolean
  onClose: () => void
  taskName: string
  currentStatus: TaskStatus
  onSave: (status: TaskStatus) => void
}

export function UpdateTaskStatusModal({
  open,
  onClose,
  taskName,
  currentStatus,
  onSave,
}: UpdateTaskStatusModalProps) {
  const [newStatus, setNewStatus] = useState<TaskStatus>(currentStatus)

  useEffect(() => {
    if (open) setNewStatus(currentStatus)
  }, [open, currentStatus])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Update Task Status"
      subtitle={taskName}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-surface px-5 text-sm font-semibold text-heading hover:bg-surface-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(newStatus)}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95"
          >
            Save Update
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-heading">Task</p>
          <p className="mt-2 text-sm text-text-muted">{taskName}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-heading">Current Status</p>
          <div className="mt-2">
            <TaskStatusBadge status={currentStatus} />
          </div>
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="new-status" className="text-sm font-semibold text-heading">
          New Status
        </label>
        <ChevronSelect
          id="new-status"
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value as TaskStatus)}
          className="mt-2"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </ChevronSelect>
      </div>
    </Modal>
  )
}
