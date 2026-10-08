import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLeaveType, useUpdateLeaveType } from '@/features/leave/hooks/useLeave'
import { LeaveTypeForm } from '@/features/leave/ui/LeaveTypeForm'
import { ArrowLeftIcon } from '@/shared/ui/icons'

export function EditLeaveTypePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: leaveType, isLoading } = useLeaveType(id)
  const updateType = useUpdateLeaveType()

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <p className="text-sm text-text-muted">Loading…</p>
      </div>
    )
  }

  if (!leaveType) {
    return (
      <div className="p-8">
        <p className="font-semibold text-heading">Leave type not found</p>
        <Link to="/leave?tab=types" className="mt-4 inline-block text-sm text-[#1877f2]">
          Back to Leave Types
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link
        to="/leave?tab=types"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:opacity-90"
      >
        <ArrowLeftIcon />
        Back to Requests
      </Link>

      <header className="mb-6">
        <h1 className="text-[26px] font-bold leading-9 text-heading sm:text-[30px]">Edit Leave Type</h1>
        <p className="mt-1 text-base leading-6 text-text-muted">
          Modify the existing leave category details
        </p>
      </header>

      <div className="mx-auto max-w-3xl">
        <LeaveTypeForm
          leaveType={leaveType}
          submitLabel="Update Leave Type"
          onCancel={() => navigate('/leave?tab=types')}
          onSubmit={async (values) => {
            await updateType.mutateAsync({ id: leaveType.id, values })
            navigate('/leave?tab=types')
          }}
        />
      </div>
    </div>
  )
}
