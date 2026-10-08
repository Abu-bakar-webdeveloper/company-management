import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/model/AuthContext'
import { userHasPermission } from '@/features/auth/model/permissions'
import { salariesApi } from '@/features/salaries/api/salariesApi'
import { formatCurrency } from '@/features/salaries/lib/salary-utils'
import type {
  EmployeeCompensation,
  EmployeeLoan,
  PayrollAssignment,
  Salary,
} from '@/features/salaries/model/types'
import { SalaryStatusBadge } from '@/features/salaries/ui/SalaryStatusBadge'
import { EyeIcon } from '@/features/salaries/ui/icons'
import { getErrorMessage } from '@/shared/api/errors'
import { paginate } from '@/shared/lib/pagination'
import { SelectField } from '@/shared/ui/SelectField'

const PAGE_SIZE = 4
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

type EmployeeSalaryTabProps = {
  employeeId: string
}

export function EmployeeSalaryTab({ employeeId }: EmployeeSalaryTabProps) {
  const { user } = useAuth()
  const isSelf = user?.id === employeeId
  const canCompanyRead = Boolean(user && userHasPermission(user, 'salaries:read'))
  const canWrite = Boolean(user && userHasPermission(user, 'salaries:write'))
  const canSelf = Boolean(user && userHasPermission(user, 'salaries:self'))
  const allowed = canCompanyRead || (isSelf && canSelf)

  const [salaries, setSalaries] = useState<Salary[]>([])
  const [pfBalance, setPfBalance] = useState(0)
  const [compensation, setCompensation] = useState<EmployeeCompensation | null>(null)
  const [assignments, setAssignments] = useState<PayrollAssignment[]>([])
  const [loans, setLoans] = useState<EmployeeLoan[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const [showPackage, setShowPackage] = useState(false)
  const [showAssignment, setShowAssignment] = useState(false)
  const [showLoan, setShowLoan] = useState(false)

  const [pkgForm, setPkgForm] = useState({
    basic: 0,
    hra: 0,
    utility: 0,
    conveyance: 0,
    effectiveFrom: new Date().toISOString().slice(0, 10),
    type: 'increment' as 'increment' | 'confirmation' | 'correction' | 'structure_change',
    reason: '',
    setPermanent: false,
    regeneratePending: true,
  })

  const [assignForm, setAssignForm] = useState({
    componentCode: 'PROJECT_ALLOWANCE',
    kind: 'earning' as 'earning' | 'deduction',
    amount: 0,
    startMonth: new Date().getMonth() + 1,
    startYear: new Date().getFullYear(),
    endMonth: '' as string | number,
    endYear: '' as string | number,
    note: '',
  })

  const [loanForm, setLoanForm] = useState({
    principal: 0,
    installmentAmount: 0,
    startMonth: new Date().getMonth() + 1,
    startYear: new Date().getFullYear(),
    issueInPayroll: false,
    note: '',
  })

  const load = useCallback(async () => {
    if (!allowed) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const listPromise =
        isSelf && !canCompanyRead
          ? salariesApi.listMine()
          : salariesApi.list({ employeeId, limit: 100 })
      const pfPromise =
        isSelf && !canCompanyRead
          ? salariesApi.getMyPf()
          : salariesApi.getPf(employeeId)

      const [list, pf] = await Promise.all([listPromise, pfPromise])
      setSalaries(list)
      setPfBalance(pf.balance)

      if (canCompanyRead || canWrite) {
        const [comp, assigns, loanList] = await Promise.all([
          salariesApi.getCompensation(employeeId),
          salariesApi.listAssignments(employeeId),
          salariesApi.listLoans(employeeId),
        ])
        setCompensation(comp)
        setAssignments(assigns)
        setLoans(loanList)
        setPkgForm((f) => ({
          ...f,
          basic: comp.currentPackage.basic,
          hra: comp.currentPackage.allowances.HRA ?? 0,
          utility: comp.currentPackage.allowances.UTILITY ?? 0,
          conveyance: comp.currentPackage.allowances.CONVEYANCE ?? 0,
        }))
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to load salary data'))
    } finally {
      setLoading(false)
    }
  }, [allowed, canCompanyRead, canWrite, employeeId, isSelf])

  useEffect(() => {
    void load()
  }, [load])

  const pagination = useMemo(() => paginate(salaries, page, PAGE_SIZE), [salaries, page])

  const submitPackage = async () => {
    try {
      const result = await salariesApi.createCompensationEvent(employeeId, {
        effectiveFrom: pkgForm.effectiveFrom,
        type: pkgForm.type,
        basic: pkgForm.basic,
        allowances: {
          HRA: pkgForm.hra,
          UTILITY: pkgForm.utility,
          CONVEYANCE: pkgForm.conveyance,
        },
        reason: pkgForm.reason || undefined,
        setPermanent: pkgForm.setPermanent || pkgForm.type === 'confirmation',
        regeneratePending: pkgForm.regeneratePending,
      })
      toast.success(
        result.regenerated > 0
          ? `Package updated; ${result.regenerated} pending slip(s) regenerated`
          : 'Package updated',
      )
      setShowPackage(false)
      await load()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to update package'))
    }
  }

  const submitAssignment = async () => {
    try {
      await salariesApi.createAssignment(employeeId, {
        componentCode: assignForm.componentCode,
        kind: assignForm.kind,
        amount: assignForm.amount,
        startMonth: Number(assignForm.startMonth),
        startYear: Number(assignForm.startYear),
        endMonth: assignForm.endMonth === '' ? null : Number(assignForm.endMonth),
        endYear: assignForm.endYear === '' ? null : Number(assignForm.endYear),
        note: assignForm.note || undefined,
      })
      toast.success('Assignment created')
      setShowAssignment(false)
      await load()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to create assignment'))
    }
  }

  const submitLoan = async () => {
    try {
      await salariesApi.createLoan(employeeId, {
        principal: loanForm.principal,
        installmentAmount: loanForm.installmentAmount,
        startMonth: Number(loanForm.startMonth),
        startYear: Number(loanForm.startYear),
        issueInPayroll: loanForm.issueInPayroll,
        note: loanForm.note || undefined,
      })
      toast.success('Loan created')
      setShowLoan(false)
      await load()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to create loan'))
    }
  }

  if (!allowed) {
    return (
      <div className="flex min-h-[240px] items-center justify-center p-6">
        <p className="text-sm text-text-muted">You do not have access to salary information.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center p-6">
        <p className="text-sm text-text-muted">Loading salary history…</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <div className="rounded-xl border border-border-card bg-surface p-4 shadow-[var(--shadow-stat)]">
          <p className="text-xs text-text-muted">Payroll records</p>
          <p className="mt-1 text-xl font-bold text-heading">{salaries.length}</p>
        </div>
        <div className="rounded-xl border border-border-card bg-surface p-4 shadow-[var(--shadow-stat)]">
          <p className="text-xs text-text-muted">PF balance</p>
          <p className="mt-1 text-xl font-bold text-heading">{formatCurrency(pfBalance)}</p>
        </div>
        <div className="rounded-xl border border-border-card bg-surface p-4 shadow-[var(--shadow-stat)]">
          <p className="text-xs text-text-muted">Current basic</p>
          <p className="mt-1 text-xl font-bold text-heading">
            {formatCurrency(compensation?.currentPackage.basic ?? 0)}
          </p>
        </div>
        <div className="rounded-xl border border-border-card bg-surface p-4 shadow-[var(--shadow-stat)]">
          <p className="text-xs text-text-muted">Employment stage</p>
          <p className="mt-1 text-xl font-bold capitalize text-heading">
            {compensation?.employmentStage ?? '—'}
          </p>
        </div>
      </div>

      {compensation && (
        <div
          className={`rounded-xl border p-4 ${
            compensation.eligibility.due
              ? 'border-[#fdba74] bg-[#fff7ed]'
              : 'border-border-card bg-surface'
          }`}
        >
          <p className="text-sm font-semibold text-heading">
            {compensation.eligibility.due ? 'Increment due' : 'Next increment'}
          </p>
          <p className="mt-1 text-sm text-text-muted">{compensation.eligibility.message}</p>
        </div>
      )}

      {canWrite && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowPackage(true)}
            className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-white"
          >
            Change package
          </button>
          <button
            type="button"
            onClick={() => setShowAssignment(true)}
            className="h-10 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-heading"
          >
            Add assignment
          </button>
          <button
            type="button"
            onClick={() => setShowLoan(true)}
            className="h-10 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-heading"
          >
            New loan
          </button>
        </div>
      )}

      {assignments.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-heading">Time-bound assignments</h3>
          <ul className="space-y-2 text-sm">
            {assignments.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-lg border border-border-card px-3 py-2"
              >
                <span>
                  <span className="font-medium text-heading">{a.componentCode}</span>
                  {' · '}
                  {formatCurrency(a.amount)} ({a.kind}) · {MONTHS[a.startMonth - 1]} {a.startYear}
                  {a.endMonth && a.endYear
                    ? ` → ${MONTHS[a.endMonth - 1]} ${a.endYear}`
                    : ' → open'}
                  {!a.active ? ' (inactive)' : ''}
                </span>
                {canWrite && (
                  <button
                    type="button"
                    className="text-xs text-danger"
                    onClick={() => {
                      void salariesApi
                        .deleteAssignment(employeeId, a.id)
                        .then(() => {
                          toast.success('Assignment removed')
                          return load()
                        })
                        .catch((err) =>
                          toast.error(getErrorMessage(err, 'Unable to delete')),
                        )
                    }}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {loans.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-heading">Loans</h3>
          <ul className="space-y-2 text-sm">
            {loans.map((loan) => (
              <li
                key={loan.id}
                className="rounded-lg border border-border-card px-3 py-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-heading">
                    {formatCurrency(loan.principal)} · EMI {formatCurrency(loan.installmentAmount)}
                  </span>
                  <span className="capitalize text-text-muted">{loan.status}</span>
                </div>
                <p className="mt-1 text-text-muted">
                  Remaining {formatCurrency(loan.remainingBalance)} · {MONTHS[loan.startMonth - 1]}{' '}
                  {loan.startYear} → {MONTHS[loan.endMonth - 1]} {loan.endYear}
                </p>
                {canWrite && loan.status === 'active' && (
                  <button
                    type="button"
                    className="mt-2 text-xs text-danger"
                    onClick={() => {
                      void salariesApi
                        .cancelLoan(employeeId, loan.id)
                        .then(() => {
                          toast.success('Loan cancelled')
                          return load()
                        })
                        .catch((err) =>
                          toast.error(getErrorMessage(err, 'Unable to cancel loan')),
                        )
                    }}
                  >
                    Cancel loan
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {compensation && compensation.history.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-heading">Package history</h3>
          <ul className="space-y-1 text-sm text-text-muted">
            {compensation.history.slice(0, 8).map((h) => (
              <li key={h.id}>
                {h.effectiveFrom} · {h.type} · basic {formatCurrency(h.basic)}
                {h.reason ? ` — ${h.reason}` : ''}
              </li>
            ))}
          </ul>
        </section>
      )}

      {isSelf && (
        <div>
          <Link
            to="/my-salary"
            className="text-sm font-semibold text-primary hover:opacity-90"
          >
            Open My Salary →
          </Link>
        </div>
      )}

      {salaries.length === 0 ? (
        <p className="text-sm text-text-muted">No salary records for this employee yet.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border-card">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-border-card bg-[#f8fafc] text-text-muted">
                  <th className="px-4 py-3 font-medium">Period</th>
                  <th className="px-4 py-3 font-medium">Net</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">View</th>
                </tr>
              </thead>
              <tbody>
                {pagination.items.map((salary) => (
                  <tr key={salary.id} className="border-b border-border-card/70">
                    <td className="px-4 py-3 font-medium text-heading">
                      {salary.payPeriodLabel}
                    </td>
                    <td className="px-4 py-3 text-heading">{formatCurrency(salary.net)}</td>
                    <td className="px-4 py-3">
                      <SalaryStatusBadge status={salary.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/salaries/${salary.id}`}
                        className="inline-flex size-9 items-center justify-center rounded-lg bg-[#eff6ff] text-[#1877f2]"
                        aria-label={`View ${salary.payPeriodLabel}`}
                      >
                        <EyeIcon />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-text-muted">
              <span>
                {pagination.start}–{pagination.end} of {pagination.total}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-border px-3 py-1 disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  type="button"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  className="rounded-lg border border-border px-3 py-1 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showPackage && (
        <Modal title="Change compensation package" onClose={() => setShowPackage(false)}>
          <div className="space-y-3 text-sm">
            <label className="block">
              Type
              <SelectField
                className="mt-1 !h-10 w-full rounded-lg"
                value={pkgForm.type}
                onChange={(e) =>
                  setPkgForm({
                    ...pkgForm,
                    type: e.target.value as typeof pkgForm.type,
                  })
                }
              >
                <option value="increment">Increment</option>
                <option value="confirmation">Confirmation</option>
                <option value="correction">Correction</option>
                <option value="structure_change">Structure change</option>
              </SelectField>
            </label>
            <label className="block">
              Effective from
              <input
                type="date"
                className="mt-1 h-10 w-full rounded-lg border border-border px-3"
                value={pkgForm.effectiveFrom}
                onChange={(e) => setPkgForm({ ...pkgForm, effectiveFrom: e.target.value })}
              />
            </label>
            <label className="block">
              Basic
              <input
                type="number"
                min={0}
                className="mt-1 h-10 w-full rounded-lg border border-border px-3"
                value={pkgForm.basic}
                onChange={(e) => setPkgForm({ ...pkgForm, basic: Number(e.target.value) })}
              />
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label className="block">
                HRA
                <input
                  type="number"
                  min={0}
                  className="mt-1 h-10 w-full rounded-lg border border-border px-3"
                  value={pkgForm.hra}
                  onChange={(e) => setPkgForm({ ...pkgForm, hra: Number(e.target.value) })}
                />
              </label>
              <label className="block">
                Utility
                <input
                  type="number"
                  min={0}
                  className="mt-1 h-10 w-full rounded-lg border border-border px-3"
                  value={pkgForm.utility}
                  onChange={(e) =>
                    setPkgForm({ ...pkgForm, utility: Number(e.target.value) })
                  }
                />
              </label>
              <label className="block">
                Conveyance
                <input
                  type="number"
                  min={0}
                  className="mt-1 h-10 w-full rounded-lg border border-border px-3"
                  value={pkgForm.conveyance}
                  onChange={(e) =>
                    setPkgForm({ ...pkgForm, conveyance: Number(e.target.value) })
                  }
                />
              </label>
            </div>
            <label className="block">
              Reason
              <input
                className="mt-1 h-10 w-full rounded-lg border border-border px-3"
                value={pkgForm.reason}
                onChange={(e) => setPkgForm({ ...pkgForm, reason: e.target.value })}
              />
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={pkgForm.setPermanent}
                onChange={(e) =>
                  setPkgForm({ ...pkgForm, setPermanent: e.target.checked })
                }
              />
              Mark employee permanent
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={pkgForm.regeneratePending}
                onChange={(e) =>
                  setPkgForm({ ...pkgForm, regeneratePending: e.target.checked })
                }
              />
              Regenerate pending slips from effective month
            </label>
            <button
              type="button"
              onClick={() => void submitPackage()}
              className="h-10 w-full rounded-lg bg-primary text-sm font-semibold text-white"
            >
              Save package
            </button>
          </div>
        </Modal>
      )}

      {showAssignment && (
        <Modal title="Add payroll assignment" onClose={() => setShowAssignment(false)}>
          <div className="space-y-3 text-sm">
            <label className="block">
              Component code
              <input
                className="mt-1 h-10 w-full rounded-lg border border-border px-3"
                value={assignForm.componentCode}
                onChange={(e) =>
                  setAssignForm({ ...assignForm, componentCode: e.target.value })
                }
              />
            </label>
            <label className="block">
              Kind
              <SelectField
                className="mt-1 !h-10 w-full rounded-lg"
                value={assignForm.kind}
                onChange={(e) =>
                  setAssignForm({
                    ...assignForm,
                    kind: e.target.value as 'earning' | 'deduction',
                  })
                }
              >
                <option value="earning">Earning</option>
                <option value="deduction">Deduction</option>
              </SelectField>
            </label>
            <label className="block">
              Amount
              <input
                type="number"
                min={0}
                className="mt-1 h-10 w-full rounded-lg border border-border px-3"
                value={assignForm.amount}
                onChange={(e) =>
                  setAssignForm({ ...assignForm, amount: Number(e.target.value) })
                }
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                Start month
                <input
                  type="number"
                  min={1}
                  max={12}
                  className="mt-1 h-10 w-full rounded-lg border border-border px-3"
                  value={assignForm.startMonth}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, startMonth: Number(e.target.value) })
                  }
                />
              </label>
              <label className="block">
                Start year
                <input
                  type="number"
                  className="mt-1 h-10 w-full rounded-lg border border-border px-3"
                  value={assignForm.startYear}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, startYear: Number(e.target.value) })
                  }
                />
              </label>
              <label className="block">
                End month (optional)
                <input
                  type="number"
                  min={1}
                  max={12}
                  className="mt-1 h-10 w-full rounded-lg border border-border px-3"
                  value={assignForm.endMonth}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, endMonth: e.target.value })
                  }
                />
              </label>
              <label className="block">
                End year (optional)
                <input
                  type="number"
                  className="mt-1 h-10 w-full rounded-lg border border-border px-3"
                  value={assignForm.endYear}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, endYear: e.target.value })
                  }
                />
              </label>
            </div>
            <button
              type="button"
              onClick={() => void submitAssignment()}
              className="h-10 w-full rounded-lg bg-primary text-sm font-semibold text-white"
            >
              Create assignment
            </button>
          </div>
        </Modal>
      )}

      {showLoan && (
        <Modal title="New employee loan" onClose={() => setShowLoan(false)}>
          <div className="space-y-3 text-sm">
            <label className="block">
              Principal
              <input
                type="number"
                min={0}
                className="mt-1 h-10 w-full rounded-lg border border-border px-3"
                value={loanForm.principal}
                onChange={(e) =>
                  setLoanForm({ ...loanForm, principal: Number(e.target.value) })
                }
              />
            </label>
            <label className="block">
              Installment (EMI)
              <input
                type="number"
                min={0}
                className="mt-1 h-10 w-full rounded-lg border border-border px-3"
                value={loanForm.installmentAmount}
                onChange={(e) =>
                  setLoanForm({
                    ...loanForm,
                    installmentAmount: Number(e.target.value),
                  })
                }
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                Start month
                <input
                  type="number"
                  min={1}
                  max={12}
                  className="mt-1 h-10 w-full rounded-lg border border-border px-3"
                  value={loanForm.startMonth}
                  onChange={(e) =>
                    setLoanForm({ ...loanForm, startMonth: Number(e.target.value) })
                  }
                />
              </label>
              <label className="block">
                Start year
                <input
                  type="number"
                  className="mt-1 h-10 w-full rounded-lg border border-border px-3"
                  value={loanForm.startYear}
                  onChange={(e) =>
                    setLoanForm({ ...loanForm, startYear: Number(e.target.value) })
                  }
                />
              </label>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={loanForm.issueInPayroll}
                onChange={(e) =>
                  setLoanForm({ ...loanForm, issueInPayroll: e.target.checked })
                }
              />
              Add principal as Loan Issued earning in start month
            </label>
            <button
              type="button"
              onClick={() => void submitLoan()}
              className="h-10 w-full rounded-lg bg-primary text-sm font-semibold text-white"
            >
              Create loan
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-surface p-5 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-heading">{title}</h3>
          <button type="button" onClick={onClose} className="text-sm text-text-muted">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
