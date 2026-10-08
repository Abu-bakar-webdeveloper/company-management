import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { expensesApi } from '@/features/expenses/api/expensesApi'
import {
  categoryLabel,
  expenseTypeLabel,
  formatActivityTimestamp,
  formatCurrency,
  formatExpenseLongDate,
} from '@/features/expenses/lib/expense-utils'
import type { Expense, ExpenseActivityType, ExpenseReceipt } from '@/features/expenses/model/types'
import { ExpenseStatusBadge } from '@/features/expenses/ui/ExpenseStatusBadge'
import {
  AvatarCircle,
  CheckCircleIcon,
  DownloadIcon,
  EyeIcon,
  FileIcon,
  LaptopIcon,
  XCircleIcon,
} from '@/features/expenses/ui/icons'
import { getErrorMessage } from '@/shared/api/errors'
import { Card } from '@/shared/ui/Card'
import { ArrowLeftIcon } from '@/shared/ui/icons'
import { cn } from '@/shared/lib/cn'

function ActivityIcon({ type }: { type: ExpenseActivityType }) {
  if (type === 'approved') {
    return (
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-white">
        <CheckCircleIcon className="size-4" />
      </div>
    )
  }
  if (type === 'rejected') {
    return (
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#dc2626] text-white">
        <XCircleIcon className="size-4" />
      </div>
    )
  }
  if (type === 'reviewed' || type === 'updated') {
    return (
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-text-muted">
        <EyeIcon className="size-4" />
      </div>
    )
  }
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f1f5f9] text-text-muted">
      <span className="text-sm font-bold">+</span>
    </div>
  )
}

function activityLabel(type: ExpenseActivityType, actor: string): string {
  switch (type) {
    case 'approved':
      return `Approved by ${actor}`
    case 'rejected':
      return `Rejected by ${actor}`
    case 'reviewed':
      return `Reviewed by ${actor}`
    case 'updated':
      return `Updated by ${actor}`
    case 'created':
      return `Created by ${actor}`
  }
}

function ReceiptCard({ receipt }: { receipt?: ExpenseReceipt }) {
  return (
    <Card className="p-5">
      <h3 className="text-lg font-bold text-heading">Receipt</h3>
      <div className="my-4 border-b border-border-card" />
      {receipt ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-[#f8fafc] px-4 py-6">
          <div className="flex size-12 items-center justify-center rounded-full bg-[#ffedd5]">
            <FileIcon className="size-6 text-trend-down" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-heading">{receipt.filename}</p>
            <p className="mt-0.5 text-xs text-text-muted">
              {receipt.size} • {receipt.type}
            </p>
          </div>
          {receipt.url ? (
            <a
              href={receipt.url}
              target="_blank"
              rel="noreferrer"
              className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-white hover:opacity-95"
            >
              <DownloadIcon className="text-white" />
              Download
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-white opacity-70"
            >
              <DownloadIcon className="text-white" />
              Download
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-[#f8fafc] px-4 py-8">
          <div className="flex size-12 items-center justify-center rounded-full bg-surface-muted">
            <FileIcon className="size-6 text-text-muted" />
          </div>
          <p className="mt-3 text-sm text-text-muted">No receipt uploaded</p>
        </div>
      )}
    </Card>
  )
}

function ActionsCard({
  adminComment,
  onCommentChange,
  onApprove,
  onReject,
  submitting,
}: {
  adminComment: string
  onCommentChange: (value: string) => void
  onApprove: () => void
  onReject: () => void
  submitting: boolean
}) {
  return (
    <Card className="p-5">
      <h3 className="text-lg font-bold text-heading">Actions</h3>
      <div className="my-4 border-b border-border-card" />
      <div className="flex gap-3">
        <button
          type="button"
          disabled={submitting}
          onClick={onApprove}
          className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-success text-sm font-semibold text-white hover:opacity-95 disabled:opacity-70"
        >
          <CheckCircleIcon className="size-4" />
          Approve
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={onReject}
          className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-[#dc2626] text-sm font-semibold text-white hover:opacity-95 disabled:opacity-70"
        >
          <XCircleIcon className="size-4" />
          Reject
        </button>
      </div>
      <p className="mb-2 mt-4 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
        Admin Comment (Optional)
      </p>
      <textarea
        value={adminComment}
        onChange={(e) => onCommentChange(e.target.value)}
        placeholder="Enter feedback for the employee..."
        className="min-h-[80px] w-full resize-y rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-heading placeholder:text-placeholder-alt outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
      />
    </Card>
  )
}

function StatusSidebar({ expense }: { expense: Expense }) {
  if (expense.status === 'approved') {
    return (
      <Card className="border-[#D1FAE5] p-5">
        <div className="mb-3 flex items-center bg-success-muted rounded-full p-2 gap-2">
          <CheckCircleIcon className="size-5 text-success" />
          <p className="font-semibold text-success">Approved</p>
        </div>
        <p className="text-sm text-heading">
          This expense has been verified and approved for payment.
        </p>
        {expense.approvedBy && expense.approvedAt && (
          <p className="mt-3 text-sm font-medium text-success">
            Approved by {expense.approvedBy}, {formatExpenseLongDate(expense.approvedAt)}
          </p>
        )}
      </Card>
    )
  }

  if (expense.status === 'pending') {
    return (
      <Card className="border-[#fed7aa] bg-[#fff7ed] p-5">
        <p className="mb-2 font-semibold text-danger">Pending Review</p>
        <p className="text-sm text-heading">
          This expense is awaiting manager or admin approval.
        </p>
      </Card>
    )
  }

  return (
    <Card className="border-[#fecaca] bg-[#fef2f2] p-5">
      <p className="mb-2 font-semibold text-danger">Rejected</p>
      <p className="text-sm text-heading">
        {expense.rejectionReason || 'This expense request was not approved.'}
      </p>
    </Card>
  )
}

export function ExpenseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [expense, setExpense] = useState<Expense | null>(null)
  const [loading, setLoading] = useState(true)
  const [adminComment, setAdminComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    void expensesApi
      .getById(id)
      .then((data) => setExpense(data))
      .catch(() => setExpense(null))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!expense) return
    try {
      await expensesApi.remove(expense.id)
      navigate('/expenses')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to delete expense'))
    }
  }

  const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
    if (!expense) return
    setSubmitting(true)
    try {
      const updated = await expensesApi.updateStatus(
        expense.id,
        status,
        adminComment.trim() || undefined,
      )
      setExpense(updated)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update expense status'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <p className="text-sm text-text-muted">Loading…</p>
      </div>
    )
  }

  if (!expense) {
    return (
      <div className="p-8">
        <p className="font-semibold text-heading">Expense not found</p>
        <Link to="/expenses" className="mt-4 inline-block text-sm text-[#1877f2]">
          Back to Expenses
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8">
      <Link
        to="/expenses"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-heading"
      >
        <ArrowLeftIcon className="text-text-muted" />
        Back to Expenses
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[30px] font-bold leading-9 text-heading">Expense Details</h1>
          <p className="mt-1 text-base leading-6 text-text-muted">
            View complete expense information.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            to={`/expenses/${expense.id}/edit`}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-surface px-5 text-sm font-semibold text-heading hover:bg-surface-muted"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={() => void handleDelete()}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#fef2f2] px-5 text-sm font-semibold text-[#dc2626] hover:opacity-90"
          >
            Delete
          </button>
        </div>
      </div>

      <Card className="mb-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-muted text-primary">
              <LaptopIcon />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-bold text-heading">{expense.title}</h2>
              </div>
              <p className="mt-1 flex items-center gap-2 text-sm text-text-muted">
                <ExpenseStatusBadge status={expense.status} />
                {formatExpenseLongDate(expense.date)}
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
              Amount
            </p>
            <p className="text-3xl font-bold text-primary">{formatCurrency(expense.amount)}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-5 text-lg font-bold text-heading">Information</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                  Expense Type
                </p>
                <p className="mt-1 font-semibold text-heading">
                  {expenseTypeLabel(expense.expenseType ?? 'employee')}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                  Category
                </p>
                <p className="mt-1 font-semibold text-heading">
                  {categoryLabel(expense.category)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                  Date
                </p>
                <p className="mt-1 font-semibold text-heading">
                  {formatExpenseLongDate(expense.date)}
                </p>
              </div>
              {expense.expenseType === 'monthly' && expense.billingPeriodMonth && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                    Billing Period
                  </p>
                  <p className="mt-1 font-semibold text-heading">
                    {expense.billingPeriodMonth}/{expense.billingPeriodYear}
                  </p>
                </div>
              )}
              {expense.expenseType === 'event' && expense.eventName && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                    Event
                  </p>
                  <p className="mt-1 font-semibold text-heading">
                    {expense.eventName}
                    {expense.eventDate ? ` · ${formatExpenseLongDate(expense.eventDate)}` : ''}
                  </p>
                </div>
              )}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                  Employee
                </p>
                {expense.employeeName ? (
                  <div className="mt-1 flex items-center gap-2">
                    <AvatarCircle name={expense.employeeName} avatar={expense.employeeAvatar} />
                    <span className="font-semibold text-heading">{expense.employeeName}</span>
                  </div>
                ) : (
                  <p className="mt-1 font-semibold text-text-muted">—</p>
                )}
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                  Project
                </p>
                <p className="mt-1 font-semibold text-heading">{expense.projectName ?? '—'}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 text-lg font-bold text-heading">Description</h3>
            <p className="text-sm leading-6 text-heading">{expense.description}</p>
          </Card>

          <Card className="p-6">
            <h3 className="mb-5 text-lg font-bold text-heading">Activity</h3>
            <div className="space-y-5">
              {expense.activities.map((activity, index) => (
                <div key={activity.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <ActivityIcon type={activity.type} />
                    {index < expense.activities.length - 1 && (
                      <div className="mt-2 w-px flex-1 bg-border-card" />
                    )}
                  </div>
                  <div className="pb-2">
                    <p className="font-medium text-heading">
                      {activityLabel(activity.type, activity.actor)}
                    </p>
                    <p className="mt-0.5 text-sm text-text-muted">
                      {formatActivityTimestamp(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          {expense.status === 'pending' ? (
            <ActionsCard
              adminComment={adminComment}
              onCommentChange={setAdminComment}
              onApprove={() => void handleStatusUpdate('approved')}
              onReject={() => void handleStatusUpdate('rejected')}
              submitting={submitting}
            />
          ) : (
            <StatusSidebar expense={expense} />
          )}

          <ReceiptCard receipt={expense.receipt} />

          <Card className="p-5">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
              Project Context
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Project Name</span>
                <span className="font-semibold text-heading">{expense.projectName ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Approved spend</span>
                <span className="font-semibold text-[#ea580c]">
                  {formatCurrency(expense.projectBudgetSpent)}
                </span>
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#f1f5f9]">
              <div
                className={cn('h-full rounded-full bg-[#ea580c]')}
                style={{
                  width: `${Math.min(100, expense.projectBudgetSpent > 0 ? 100 : 0)}%`,
                }}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
