import type { ReactNode } from 'react'
import { EmployeeLeaveTypeBadge } from '@/features/dashboard/employee/ui/EmployeeLeaveTypeBadge'
import type { EmployeeLeaveSummary, LeaveTypeBalance } from '@/features/employees/model/types'
import { cn } from '@/shared/lib/cn'

function formatDays(value: number | null | undefined, fallback = '—'): string {
  if (value === null || value === undefined) return fallback
  return `${value} day${value === 1 ? '' : 's'}`
}

function usagePercent(balance: LeaveTypeBalance): number | null {
  if (balance.entitlement === null || balance.entitlement <= 0) return null
  return Math.min(100, Math.round((balance.used / balance.entitlement) * 100))
}

function SummaryStat({
  label,
  value,
  hint,
  iconBg,
  iconColor,
  border,
  icon,
}: {
  label: string
  value: string
  hint?: string
  iconBg: string
  iconColor: string
  border: string
  icon: ReactNode
}) {
  return (
    <div className={cn('rounded-xl border bg-surface p-5', border)}>
      <div className={cn('flex size-10 items-center justify-center rounded-lg', iconBg, iconColor)}>
        {icon}
      </div>
      <p className="mt-4 text-sm text-text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-heading">{value}</p>
      {hint ? <p className="mt-1 text-xs text-text-muted">{hint}</p> : null}
    </div>
  )
}

function LeaveTypeBalanceCard({ balance }: { balance: LeaveTypeBalance }) {
  const percent = usagePercent(balance)
  const remainingLabel =
    balance.remaining === null ? 'Unlimited' : formatDays(balance.remaining)
  const entitlementLabel =
    balance.entitlement === null
      ? 'Unlimited'
      : balance.carryIn > 0
        ? `${balance.entitlement} (${balance.maxDays} + ${balance.carryIn} carried)`
        : formatDays(balance.entitlement)

  return (
    <div className="rounded-xl border border-border-card bg-surface p-4 shadow-(--shadow-stat)">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <EmployeeLeaveTypeBadge icon={balance.icon} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-heading">{balance.name}</p>
            <p className="mt-0.5 text-xs text-text-muted">
              {!balance.paidLeave
                ? 'Unpaid'
                : balance.carryForward
                  ? 'Paid · Carry forward'
                  : 'Paid · Encashable'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-heading">{remainingLabel}</p>
          <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
            Remaining
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-[#f8fafc] px-2 py-2">
          <p className="text-sm font-semibold text-heading">{entitlementLabel}</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-wide text-text-muted">Entitled</p>
        </div>
        <div className="rounded-lg bg-[#f8fafc] px-2 py-2">
          <p className="text-sm font-semibold text-heading">{formatDays(balance.used)}</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-wide text-text-muted">Used</p>
        </div>
        <div className="rounded-lg bg-[#f8fafc] px-2 py-2">
          <p className="text-sm font-semibold text-heading">{formatDays(balance.pending)}</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-wide text-text-muted">Pending</p>
        </div>
      </div>

      {percent !== null ? (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-[11px] text-text-muted">
            <span>Usage this year</span>
            <span>{percent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#e2e8f0]">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                percent >= 90 ? 'bg-[#dc2626]' : percent >= 70 ? 'bg-[#f97316]' : 'bg-primary',
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
          {balance.available !== null && balance.pending > 0 ? (
            <p className="mt-1.5 text-[11px] text-text-muted">
              {formatDays(balance.available)} available after pending requests
            </p>
          ) : null}
        </div>
      ) : (
        <p className="mt-3 text-[11px] text-text-muted">No annual cap for this leave type</p>
      )}
    </div>
  )
}

type MyLeaveBalancesProps = {
  summary: EmployeeLeaveSummary
  className?: string
}

export function MyLeaveBalances({ summary, className }: MyLeaveBalancesProps) {
  const paidBalances = summary.balances.filter((b) => b.paidLeave)
  const unpaidBalances = summary.balances.filter((b) => !b.paidLeave)

  return (
    <section className={cn('mb-6 space-y-4', className)}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-heading">Leave Balance</h2>
          <p className="text-sm text-text-muted">
            Your entitlements and remaining days for {summary.year}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryStat
          label="Days Remaining"
          value={formatDays(summary.remainingBalance)}
          hint="Across paid leave types with a yearly cap"
          border="border-[#136DEC33]"
          iconBg="bg-[#EFF6FF]"
          iconColor="text-[#136DEC]"
          icon={
            <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path d="M3 6h14v10H3V6Zm2 2v6h10V8H5Z" />
            </svg>
          }
        />
        <SummaryStat
          label="Used This Year"
          value={formatDays(summary.yearlyTaken)}
          hint="Approved leave days in the current year"
          border="border-[#9333EA33]"
          iconBg="bg-[#F5F3FF]"
          iconColor="text-[#9333EA]"
          icon={
            <svg
              className="size-5"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              <rect x="3" y="4" width="14" height="13" rx="2" />
              <path d="M7 2v3M13 2v3M3 9h14" />
            </svg>
          }
        />
        <SummaryStat
          label="Pending Requests"
          value={`${summary.pendingRequests}`}
          hint="Awaiting approval"
          border="border-[#F9731633]"
          iconBg="bg-[#FFF7ED]"
          iconColor="text-[#F97316]"
          icon={
            <svg
              className="size-5"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              <rect x="4" y="3" width="12" height="14" rx="1.5" />
              <path d="M8 8h4M8 11h4" strokeLinecap="round" />
            </svg>
          }
        />
        <SummaryStat
          label="All-time Taken"
          value={formatDays(summary.totalTaken)}
          hint="Approved days across all years"
          border="border-[#00B67A33]"
          iconBg="bg-[#ECFDF5]"
          iconColor="text-[#00B67A]"
          icon={
            <svg
              className="size-5"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              <path d="M5 3h10v14H5z" />
              <path d="M8 7h4M8 10h4M8 13h2" strokeLinecap="round" />
            </svg>
          }
        />
      </div>

      {summary.balances.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-heading">By leave type</h3>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {paidBalances.map((balance) => (
              <LeaveTypeBalanceCard key={balance.leaveTypeId} balance={balance} />
            ))}
            {unpaidBalances.map((balance) => (
              <LeaveTypeBalanceCard key={balance.leaveTypeId} balance={balance} />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border-card bg-surface px-4 py-8 text-center text-sm text-text-muted">
          No active leave types are configured for your company yet.
        </div>
      )}
    </section>
  )
}
