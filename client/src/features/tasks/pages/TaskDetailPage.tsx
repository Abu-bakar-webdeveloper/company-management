import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getTaskDetail } from '@/features/tasks/model/taskDetailData'
import type { TaskStatus } from '@/features/tasks/model/types'
import { ArrowLeftIcon, EditIcon } from '@/features/tasks/ui/taskDetailIcons'
import { TaskActivityFeed } from '@/features/tasks/ui/TaskActivityFeed'
import { TaskDetailHeader } from '@/features/tasks/ui/TaskDetailHeader'
import { TaskSubtasksTab } from '@/features/tasks/ui/TaskSubtasksTab'
import { TaskTimelineCard } from '@/features/tasks/ui/TaskTimelineCard'
import { UpdateTaskStatusModal } from '@/features/tasks/ui/UpdateTaskStatusModal'
import { Card } from '@/shared/ui/Card'

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const baseTask = useMemo(() => (id ? getTaskDetail(id) : null), [id])
  const [status, setStatus] = useState<TaskStatus | null>(baseTask?.status ?? null)
  const [modalOpen, setModalOpen] = useState(false)

  if (!baseTask) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="font-semibold text-heading">Task not found</p>
        <Link to="/tasks" className="mt-4 inline-block text-sm text-primary">
          Back to My Tasks
        </Link>
      </div>
    )
  }

  const task = { ...baseTask, status: status ?? baseTask.status }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link
        to="/tasks"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-heading"
      >
        <ArrowLeftIcon />
        Back to My Tasks
      </Link>

      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[26px] font-bold leading-9 text-heading sm:text-[30px]">View Task</h1>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95"
        >
          <EditIcon className="text-white" />
          Update Status
        </button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="overflow-hidden">
          <TaskDetailHeader task={task} />
          <TaskSubtasksTab task={task} />
        </Card>

        <div className="flex flex-col gap-6">
          <TaskTimelineCard task={task} />
          <TaskActivityFeed activities={task.activities} />
        </div>
      </div>

      <UpdateTaskStatusModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        taskName={task.name}
        currentStatus={task.status}
        onSave={(next) => {
          setStatus(next)
          setModalOpen(false)
        }}
      />
    </div>
  )
}
