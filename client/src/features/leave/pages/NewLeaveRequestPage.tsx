import { Link, useNavigate } from 'react-router-dom'
import { useCreateLeaveRequest, useLeaveTypes } from '@/features/leave/hooks/useLeave'
import { CreateLeaveRequestForm } from '@/features/leave/ui/CreateLeaveRequestForm'
import { ArrowLeftIcon } from '@/shared/ui/icons'

export function NewLeaveRequestPage() {
  const navigate = useNavigate()
  const { data: leaveTypes = [], isLoading } = useLeaveTypes()
  const createRequest = useCreateLeaveRequest()

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link
        to="/leave"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:opacity-90"
      >
        <ArrowLeftIcon />
        Back to My Leaves
      </Link>

      <header className="mb-6">
        <h1 className="text-[26px] font-bold leading-9 text-heading sm:text-[30px]">New Leave Request</h1>
        <p className="mt-1 text-sm leading-6 text-text-muted sm:text-base">
          Submit a new leave request for approval
        </p>
      </header>

      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <p className="text-sm text-text-muted">Loading leave types…</p>
        </div>
      ) : (
        <div className="mx-auto max-w-2xl">
          <CreateLeaveRequestForm
            leaveTypes={leaveTypes}
            onCancel={() => navigate('/leave')}
            onSubmit={async (values) => {
              const request = await createRequest.mutateAsync(values)
              navigate(`/leave/requests/${request.id}`)
            }}
          />
        </div>
      )}
    </div>
  )
}
