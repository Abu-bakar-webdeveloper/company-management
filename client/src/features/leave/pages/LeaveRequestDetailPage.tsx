import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/model/AuthContext'
import { userHasPermission } from '@/features/auth/model/permissions'
import {
  useLeaveRequest,
  useUpdateLeaveRequestStatus,
} from '@/features/leave/hooks/useLeave'
import {
  formatAppliedDate,
  formatLeaveDateRange,
  isLeaveOverdue,
} from '@/features/leave/lib/leave-utils'
import {
  AvatarCircle,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  DocumentIcon,
  XIcon,
} from '@/features/leave/ui/icons'
import { LeaveRequestStatusBadge } from '@/features/leave/ui/LeaveRequestStatusBadge'
import { getErrorMessage } from '@/shared/api/errors'
import { Card } from '@/shared/ui/Card'
import { ArrowLeftIcon } from '@/shared/ui/icons'
import { SelectField } from '@/shared/ui/SelectField'

const sectionLabelClass =
  'mb-3 text-[10px] font-semibold uppercase tracking-wide text-text-muted'

export function LeaveRequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { data: request, isLoading } = useLeaveRequest(id)
  const updateStatus = useUpdateLeaveRequestStatus()
  const [adminComment, setAdminComment] = useState('')
  const [excessDisposition, setExcessDisposition] = useState<'waived' | 'unpaid_deduct'>(
    'unpaid_deduct',
  )

  useEffect(() => {
    setAdminComment(request?.adminComment ?? '')
  }, [request?.adminComment])

  const canApprove =
    !!user &&
    request?.status === 'pending' &&
    request.employeeId !== user.id &&
    (userHasPermission(user, 'leave:approve') || userHasPermission(user, 'leave:manage'))

  const hasExcess = (request?.excessDays ?? 0) > 0
  const excessLeaveMode = request?.excessLeaveMode
  const canChooseDisposition = hasExcess && excessLeaveMode === 'admin_can_waive'

  const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
    if (!request) return
    try {
      await updateStatus.mutateAsync({
        id: request.id,
        status,
        adminComment,
        ...(status === 'approved' && canChooseDisposition
          ? { excessDisposition }
          : {}),
      })
    } catch (err) {
      window.alert(getErrorMessage(err, 'Unable to update leave request. Please try again.'))
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <p className="text-sm text-text-muted">Loading…</p>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="p-8">
        <p className="font-semibold text-heading">Leave request not found</p>
        <Link to="/leave" className="mt-4 inline-block text-sm text-text-muted hover:text-heading">
          Back to Requests
        </Link>
      </div>
    )
  }

  const isPending = request.status === 'pending'
  const isApproved = request.status === 'approved'
  const overdue = isLeaveOverdue(request)
  const backLabel =
    user &&
    userHasPermission(user, 'leave:request') &&
    !userHasPermission(user, 'leave:manage')
      ? 'Back to My Leaves'
      : 'Back to Requests'

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link
        to="/leave"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-heading"
      >
        <ArrowLeftIcon className="text-text-muted" />
        {backLabel}
      </Link>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[26px] font-bold leading-9 text-heading sm:text-[30px]">
          Leave Request Details
        </h1>
        <LeaveRequestStatusBadge status={request.status} isOverdue={overdue} />
      </div>

      {overdue ? (
        <div
          className="mb-6 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#991b1b]"
          role="status"
        >
          Leave dates have passed. This request is overdue for review — approval will be
          retroactive.
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <Card className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <AvatarCircle
                name={request.employeeName}
                avatar={request.avatar}
                className="size-14"
              />
              <div>
                <h2 className="text-lg font-bold text-heading">{request.employeeName}</h2>
                <p className="text-sm text-text-muted">{request.department}</p>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-text-muted">
                  <ClockIcon className="size-3.5" />
                  Applied on {formatAppliedDate(request.appliedDate)}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 border-t border-border-card pt-6 sm:grid-cols-3">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs text-text-muted">
                  <DocumentIcon className="size-3.5" />
                  Leave Type
                </div>
                <p className="font-semibold text-heading">{request.leaveTypeName}</p>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs text-text-muted">
                  <CalendarIcon className="size-3.5" />
                  Dates
                </div>
                <p className="font-semibold text-heading">
                  {formatLeaveDateRange(request.startDate, request.endDate)}
                </p>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs text-text-muted">
                  <ClockIcon className="size-3.5" />
                  Duration
                </div>
                <p className="font-semibold text-heading">{request.durationDays} Days</p>
                {hasExcess && (
                  <p className="mt-1 text-xs text-[#ea580c]">
                    Excess {request.excessDays} day(s) beyond balance
                    {request.excessDisposition && request.excessDisposition !== 'none'
                      ? ` · ${request.excessDisposition === 'waived' ? 'waived' : 'salary deduct'}`
                      : ''}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 border-t border-border-card pt-6">
              <p className={sectionLabelClass}>Reason for Leave</p>
              <div className="rounded-lg bg-[#f8fafc] p-4 text-sm leading-relaxed text-heading">
                {request.reason}
              </div>
            </div>
          </Card>

          {isPending && canApprove && (
            <Card className="p-5 sm:p-6">
              <p className={sectionLabelClass}>Admin Comment (Optional)</p>
              <textarea
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Add a reason for approval or rejection..."
                className="min-h-[120px] w-full resize-y rounded-lg border border-[#e2e8f0] bg-surface px-4 py-3 text-sm text-heading placeholder:text-placeholder-alt outline-none focus:border-[#1877f2] focus:ring-2 focus:ring-[#1877f2]/15"
              />
            </Card>
          )}

          {request.adminComment && !isPending && (
            <Card className="p-5 sm:p-6">
              <p className={sectionLabelClass}>Admin Comment</p>
              <p className="text-sm leading-relaxed text-heading">{request.adminComment}</p>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-6">
          {isPending && canApprove ? (
            <Card className="p-5">
              <p className={sectionLabelClass}>Approval Actions</p>
              {hasExcess && (
                <div className="mb-3">
                  <p className="mb-2 text-xs text-[#ea580c]">
                    This request exceeds leave balance by {request.excessDays} day(s).
                    {excessLeaveMode === 'deduct_from_salary'
                      ? ' Excess days will be deducted from salary.'
                      : excessLeaveMode === 'admin_can_waive'
                        ? ' Choose whether to waive or deduct.'
                        : ''}
                  </p>
                  {canChooseDisposition && (
                    <label className="block text-xs text-text-muted">
                      Excess disposition
                      <SelectField
                        value={excessDisposition}
                        onChange={(e) =>
                          setExcessDisposition(e.target.value as 'waived' | 'unpaid_deduct')
                        }
                        className="mt-1 !h-10 w-full rounded-lg text-sm"
                      >
                        <option value="unpaid_deduct">Deduct from salary</option>
                        <option value="waived">Waive (no salary cut)</option>
                      </SelectField>
                    </label>
                  )}
                </div>
              )}
              {overdue ? (
                <p className="mb-3 text-xs text-[#991b1b]">
                  Approving will record this as retroactive leave for the past dates.
                </p>
              ) : null}
              <div className="space-y-3">
                <button
                  type="button"
                  disabled={updateStatus.isPending}
                  onClick={() => void handleStatusUpdate('approved')}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#00b67a] text-sm font-semibold text-white hover:opacity-95 disabled:opacity-70"
                >
                  <CheckIcon className="text-white" />
                  {overdue ? 'Approve Retroactively' : 'Approve Request'}
                </button>
                <button
                  type="button"
                  disabled={updateStatus.isPending}
                  onClick={() => void handleStatusUpdate('rejected')}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#dc2626] text-sm font-semibold text-white hover:opacity-95 disabled:opacity-70"
                >
                  <XIcon className="text-white" />
                  Reject Request
                </button>
              </div>
            </Card>
          ) : isPending ? (
            <Card className={overdue ? 'border-[#fecaca] bg-[#fef2f2] p-5' : 'border-[#fff7ed] bg-[#fff7ed] p-5'}>
              <p className={sectionLabelClass}>Request Status</p>
              <p className={overdue ? 'text-sm font-medium text-[#991b1b]' : 'text-sm font-medium text-[#ea580c]'}>
                {overdue
                  ? 'Leave dates have passed — waiting for a retroactive decision'
                  : 'Your request is pending approval'}
              </p>
            </Card>
          ) : isApproved ? (
            <Card className="border-[#bbf7d0] bg-[#ecfdf5] p-5">
              <p className={sectionLabelClass}>Request Status</p>
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-[#00b67a] text-white">
                  <CheckIcon className="size-4" />
                </div>
                <p className="text-sm font-medium text-[#047857]">This request was approved</p>
              </div>
            </Card>
          ) : (
            <Card className="border-[#fecaca] bg-[#fef2f2] p-5">
              <p className={sectionLabelClass}>Request Status</p>
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-danger text-white">
                  <XIcon className="size-4" />
                </div>
                <p className="text-sm font-medium text-danger">This request was rejected</p>
              </div>
            </Card>
          )}

          <Card className="p-5">
            <p className={sectionLabelClass}>Employee Info</p>
            <div className="flex items-center gap-3 border-b border-border-card pb-4">
              <AvatarCircle name={request.employeeName} avatar={request.avatar} />
              <div>
                <p className="font-semibold text-heading">{request.employeeName}</p>
                <p className="text-xs text-text-muted">{request.department}</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Total Leaves Taken</span>
                <span className="font-semibold text-heading">
                  {request.totalLeavesTaken ?? 0} Days
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Remaining Balance</span>
                <span className="font-semibold text-heading">
                  {request.remainingBalance ?? '—'} Days
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
