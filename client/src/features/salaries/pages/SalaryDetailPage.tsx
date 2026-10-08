import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/model/AuthContext'
import { userHasPermission } from '@/features/auth/model/permissions'
import { salariesApi } from '@/features/salaries/api/salariesApi'
import {
  formatActivityTimestamp,
  formatCurrency,
  formatSalaryLongDate,
} from '@/features/salaries/lib/salary-utils'
import { statusLabels } from '@/features/salaries/model/salariesData'
import type { Salary, SalaryActivityType, SalaryStatus } from '@/features/salaries/model/types'
import {
  AvatarCircle,
  CheckCircleIcon,
  DownloadIcon,
  EyeIcon,
  FileIcon,
} from '@/features/salaries/ui/icons'
import { getErrorMessage } from '@/shared/api/errors'
import { Card } from '@/shared/ui/Card'
import { ChevronSelect } from '@/shared/ui/ChevronSelect'
import { ArrowLeftIcon } from '@/shared/ui/icons'

function ActivityIcon({ type }: { type: SalaryActivityType }) {
  if (type === 'approved') {
    return (
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-white">
        <CheckCircleIcon className="size-4" />
      </div>
    )
  }
  if (type === 'reviewed') {
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

function activityLabel(type: SalaryActivityType, actor: string): string {
  switch (type) {
    case 'approved':
      return `Approved by ${actor}`
    case 'reviewed':
      return `Reviewed by ${actor}`
    case 'created':
      return `Created by ${actor}`
    case 'updated':
      return `Updated by ${actor}`
    case 'status_changed':
      return `Status changed by ${actor}`
  }
}

function ReceiptCard({
  salary,
  onDownload,
  downloading,
}: {
  salary: Salary
  onDownload: () => void
  downloading: boolean
}) {
  return (
    <Card className="p-5">
      <h3 className="text-lg font-bold text-heading">Salary Slip</h3>
      <div className="my-4 border-b border-border-card" />
      <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-[#f8fafc] px-4 py-6">
        <div className="flex size-12 items-center justify-center rounded-full bg-[#ffedd5]">
          <FileIcon className="size-6 text-trend-down" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-heading">
            SalarySlip_{salary.employeeCode}_{salary.payPeriodLabel}.pdf
          </p>
          <p className="mt-0.5 text-xs text-text-muted">Generated PDF slip</p>
        </div>
        <button
          type="button"
          onClick={onDownload}
          disabled={downloading}
          className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-white hover:opacity-95 disabled:opacity-70"
        >
          <DownloadIcon className="text-white" />
          {downloading ? 'Downloading…' : 'Download'}
        </button>
      </div>
    </Card>
  )
}

function StatusSidebar({
  salary,
  canWrite,
  onStatusChange,
}: {
  salary: Salary
  canWrite: boolean
  onStatusChange: (status: SalaryStatus) => void
}) {
  return (
    <Card
      className={
        salary.status === 'paid'
          ? 'border-[#D1FAE5] p-5'
          : salary.status === 'pending'
            ? 'border-[#fed7aa] bg-[#fff7ed] p-5'
            : 'border-[#fecaca] bg-[#fef2f2] p-5'
      }
    >
      {salary.status === 'paid' && (
        <>
          <div className="mb-3 flex items-center gap-2 rounded-full bg-success-muted p-2">
            <CheckCircleIcon className="size-5 text-success" />
            <p className="font-semibold text-success">Paid</p>
          </div>
          <p className="text-sm text-heading">
            This salary has been verified and marked as paid.
          </p>
          {salary.approvedBy && salary.approvedAt && (
            <p className="mt-3 text-sm font-medium text-success">
              Approved by {salary.approvedBy}, {formatSalaryLongDate(salary.approvedAt)}
            </p>
          )}
        </>
      )}
      {salary.status === 'pending' && (
        <>
          <p className="mb-2 font-semibold text-[#ea580c]">Pending Review</p>
          <p className="text-sm text-heading">
            This salary record is awaiting approval or payment.
          </p>
        </>
      )}
      {salary.status === 'on_hold' && (
        <>
          <p className="mb-2 font-semibold text-danger">On Hold</p>
          <p className="text-sm text-heading">
            This salary payment has been placed on hold pending further review.
          </p>
        </>
      )}

      {canWrite && (
        <div className="mt-4">
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-text-muted">
            Change status
          </label>
          <ChevronSelect
            value={salary.status}
            onChange={(e) => onStatusChange(e.target.value as SalaryStatus)}
            className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm"
          >
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </ChevronSelect>
        </div>
      )}
    </Card>
  )
}

const fieldLabelClass = 'text-[10px] font-semibold uppercase tracking-wide text-text-muted'

export function SalaryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canWrite = Boolean(user && userHasPermission(user, 'salaries:write'))

  const [salary, setSalary] = useState<Salary | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!id) return
    void salariesApi
      .getById(id)
      .then(setSalary)
      .catch(() => setSalary(null))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!salary) return
    try {
      await salariesApi.remove(salary.id)
      toast.success('Salary record deleted')
      navigate('/salaries')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to delete salary record'))
    }
  }

  const handleDownload = async () => {
    if (!salary) return
    setDownloading(true)
    try {
      await salariesApi.downloadSlip(salary.id)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to download salary slip'))
    } finally {
      setDownloading(false)
    }
  }

  const handleStatusChange = async (status: SalaryStatus) => {
    if (!salary) return
    try {
      const updated = await salariesApi.updateStatus(salary.id, status)
      setSalary(updated)
      toast.success('Status updated')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to update status'))
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <p className="text-sm text-text-muted">Loading…</p>
      </div>
    )
  }

  if (!salary) {
    return (
      <div className="p-8">
        <p className="font-semibold text-heading">Salary record not found</p>
        <Link to="/salaries" className="mt-4 inline-block text-sm text-[#1877f2]">
          Back to Salaries
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8">
      <Link
        to="/salaries"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-heading"
      >
        <ArrowLeftIcon className="text-text-muted" />
        Back to Salaries
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[30px] font-bold leading-9 text-heading">Salary Details</h1>
          <p className="mt-1 text-base leading-6 text-text-muted">
            {salary.payPeriodLabel} · {salary.employeeCode}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {canWrite && (
            <>
              <Link
                to={`/salaries/${salary.id}/edit`}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-surface px-5 text-sm font-semibold text-heading hover:bg-surface-muted"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={() => void handleDelete()}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-[#fecaca] bg-[#fef2f2] px-5 text-sm font-semibold text-[#dc2626] hover:opacity-90"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-5 text-lg font-bold text-heading">Information</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className={fieldLabelClass}>Pay Period</p>
                <p className="mt-1 font-semibold text-heading">{salary.payPeriodLabel}</p>
              </div>
              <div>
                <p className={fieldLabelClass}>Employee ID</p>
                <p className="mt-1 font-semibold text-heading">{salary.employeeCode}</p>
              </div>
              <div>
                <p className={fieldLabelClass}>Employee</p>
                <div className="mt-1 flex items-center gap-2">
                  <AvatarCircle name={salary.employeeName} avatar={salary.employeeAvatar} />
                  <span className="font-semibold text-heading">{salary.employeeName}</span>
                </div>
              </div>
              <div>
                <p className={fieldLabelClass}>Department</p>
                <p className="mt-1 font-semibold text-heading">{salary.department}</p>
              </div>
              <div>
                <p className={fieldLabelClass}>Basic Salary</p>
                <p className="mt-1 font-semibold text-heading">{formatCurrency(salary.basic)}</p>
              </div>
              <div>
                <p className={fieldLabelClass}>Employee PF</p>
                <p className="mt-1 font-semibold text-heading">
                  {formatCurrency(salary.providentFund)}
                </p>
              </div>
              {(salary.employerProvidentFund ?? 0) > 0 && (
                <div>
                  <p className={fieldLabelClass}>Employer PF (company)</p>
                  <p className="mt-1 font-semibold text-heading">
                    {formatCurrency(salary.employerProvidentFund ?? 0)}
                  </p>
                </div>
              )}
              <div>
                <p className={fieldLabelClass}>Deduction</p>
                <p className="mt-1 font-semibold text-heading">
                  {formatCurrency(salary.deductions)}
                </p>
              </div>
              <div>
                <p className={fieldLabelClass}>Allowance</p>
                <p className="mt-1 font-semibold text-heading">
                  {formatCurrency(salary.allowances)}
                </p>
              </div>
              <div>
                <p className={fieldLabelClass}>Net Salary</p>
                <p className="mt-1 font-semibold text-heading">{formatCurrency(salary.net)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 text-lg font-bold text-heading">Description</h3>
            <p className="text-sm leading-6 text-heading">{salary.description || '—'}</p>
          </Card>

          <Card className="p-6">
            <h3 className="mb-5 text-lg font-bold text-heading">Activity</h3>
            <div className="space-y-5">
              {salary.activities.map((activity, index) => (
                <div key={activity.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <ActivityIcon type={activity.type} />
                    {index < salary.activities.length - 1 && (
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
          <StatusSidebar
            salary={salary}
            canWrite={canWrite}
            onStatusChange={(status) => void handleStatusChange(status)}
          />
          <ReceiptCard
            salary={salary}
            downloading={downloading}
            onDownload={() => void handleDownload()}
          />
        </div>
      </div>
    </div>
  )
}
