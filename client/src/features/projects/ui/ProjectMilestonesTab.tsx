import { useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/model/AuthContext'
import type { ProjectMilestone } from '@/features/projects/api/projectsApi'
import {
  useCreateMilestone,
  useDeleteMilestone,
  useProjectMilestones,
  useUpdateMilestone,
} from '@/features/projects/hooks/useProjects'
import { formatProjectDate } from '@/features/projects/lib/project-utils'
import { CalendarIcon, PlusCircleIcon } from '@/features/projects/ui/icons'
import { getErrorMessage } from '@/shared/api/errors'
import { Card } from '@/shared/ui/Card'
import { Modal } from '@/shared/ui/Modal'
import { Skeleton } from '@/shared/ui/Skeleton'
import { cn } from '@/shared/lib/cn'

type ProjectMilestonesTabProps = {
  projectId: string
  onProgressChange?: (progress: number) => void
}

export function ProjectMilestonesTab({ projectId, onProgressChange }: ProjectMilestonesTabProps) {
  const { can } = useAuth()
  const canWrite = can('projects:write')
  const { data, isLoading, isError } = useProjectMilestones(projectId)
  const createMilestone = useCreateMilestone(projectId)
  const updateMilestone = useUpdateMilestone(projectId)
  const deleteMilestone = useDeleteMilestone(projectId)

  const [createOpen, setCreateOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const milestones = data?.milestones ?? []
  const weightHint =
    milestones.length > 0
      ? `Each milestone is worth ~${Math.round(100 / milestones.length)}% of project progress`
      : 'No milestones yet — progress stays at 100%. Add milestones to track progress evenly.'

  async function handleCreate() {
    setFormError(null)
    if (!title.trim()) {
      setFormError('Title is required')
      return
    }
    try {
      const result = await createMilestone.mutateAsync({
        title: title.trim(),
        ...(dueDate ? { dueDate } : {}),
      })
      onProgressChange?.(result.progress)
      setTitle('')
      setDueDate('')
      setCreateOpen(false)
      toast.success('Milestone created')
    } catch (err) {
      const message = getErrorMessage(err, 'Unable to create milestone')
      setFormError(message)
      toast.error(message)
    }
  }

  async function toggleComplete(milestone: ProjectMilestone) {
    try {
      const next = milestone.status === 'completed' ? 'pending' : 'completed'
      const result = await updateMilestone.mutateAsync({
        milestoneId: milestone.id,
        payload: { status: next },
      })
      onProgressChange?.(result.progress)
      toast.success(next === 'completed' ? 'Milestone completed' : 'Milestone reopened')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to update milestone'))
    }
  }

  async function handleDelete(milestoneId: string) {
    if (!window.confirm('Delete this milestone?')) return
    try {
      const result = await deleteMilestone.mutateAsync(milestoneId)
      onProgressChange?.(result.progress)
      toast.success('Milestone deleted')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to delete milestone'))
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3 p-6" aria-busy aria-label="Loading milestones">
        {Array.from({ length: 3 }, (_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="mb-2 h-4 w-48" rounded="sm" />
            <Skeleton className="h-3 w-28" rounded="sm" />
          </Card>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[200px] items-center justify-center p-6">
        <p className="text-sm text-danger">Unable to load milestones</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-heading">Milestones</h3>
          <p className="mt-1 text-sm text-text-muted">{weightHint}</p>
        </div>
        {canWrite && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:opacity-95"
          >
            <PlusCircleIcon className="size-4" />
            Create Milestone
          </button>
        )}
      </div>

      {milestones.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-border-card bg-[#f8fafc] p-8 text-center">
          <p className="text-lg font-semibold text-heading">No milestones yet</p>
          <p className="mt-2 max-w-sm text-sm text-text-muted">
            Create milestones to divide project progress equally. Completing them updates the
            project progress bar.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {milestones.map((milestone) => (
            <Card key={milestone.id} className="flex items-start justify-between gap-4 px-5 py-5">
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-heading">{milestone.title}</h4>
                <p className="mt-1 text-xs font-medium text-text-muted">
                  ~{milestone.weightPercent}% of progress
                </p>
                {milestone.dueDate && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-text-muted">
                    <CalendarIcon className="size-3.5" />
                    Due: {formatProjectDate(milestone.dueDate)}
                  </div>
                )}
                {canWrite && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => void toggleComplete(milestone)}
                      disabled={updateMilestone.isPending}
                      className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                    >
                      {milestone.status === 'completed' ? 'Mark pending' : 'Mark complete'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(milestone.id)}
                      disabled={deleteMilestone.isPending}
                      className="text-xs font-semibold text-danger hover:underline disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <span
                className={cn(
                  'inline-block shrink-0 rounded-full px-3 py-1 text-[10px] font-semibold tracking-wide',
                  milestone.status === 'completed'
                    ? 'bg-[#ecfdf5] text-[#00b67a]'
                    : 'bg-[#fff7ed] text-[#ea580c]',
                )}
              >
                {milestone.status === 'completed' ? 'COMPLETED' : 'PENDING'}
              </span>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Milestone"
        subtitle="Progress is split evenly across all milestones on this project."
        footer={
          <>
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-border bg-surface px-5 text-sm font-semibold text-heading sm:flex-none"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={createMilestone.isPending}
              onClick={() => void handleCreate()}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white disabled:opacity-70 sm:flex-none"
            >
              {createMilestone.isPending ? 'Creating…' : 'Create'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="mb-1.5 text-sm font-semibold text-heading">Title</p>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design review complete"
              className="h-11 w-full rounded-lg border border-[#e2e8f0] px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div>
            <p className="mb-1.5 text-sm font-semibold text-heading">Due date (optional)</p>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="h-11 w-full rounded-lg border border-[#e2e8f0] px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          {formError && <p className="text-sm text-danger">{formError}</p>}
        </div>
      </Modal>
    </div>
  )
}
