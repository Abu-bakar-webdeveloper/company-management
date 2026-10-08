import { Link, useNavigate } from 'react-router-dom'
import { useCreateLeaveType } from '@/features/leave/hooks/useLeave'
import { LeaveTypeForm } from '@/features/leave/ui/LeaveTypeForm'
import { ArrowLeftIcon } from '@/shared/ui/icons'

export function AddLeaveTypePage() {
  const navigate = useNavigate()
  const createType = useCreateLeaveType()

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
        <h1 className="text-[26px] font-bold leading-9 text-heading sm:text-[30px]">Add Leave Type</h1>
        <p className="mt-1 text-sm leading-6 text-text-muted sm:text-base">
          Create a new leave category for employee benefit plans.
        </p>
      </header>

      <div className="mx-auto">
        <LeaveTypeForm
          submitLabel="Create Leave Type"
          onCancel={() => navigate('/leave?tab=types')}
          onSubmit={async (values) => {
            await createType.mutateAsync(values)
            navigate('/leave?tab=types')
          }}
        />
      </div>
    </div>
  )
}
