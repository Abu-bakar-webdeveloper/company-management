import type { RecordStatus, ReportStatus } from '@/features/reports/model/types'
import { cn } from '@/shared/lib/cn'

const reportStyles: Record<ReportStatus, { label: string; className: string }> = {
  ready: { label: 'READY', className: 'bg-[#ECFDF5] text-[#00B67A]' },
  processing: { label: 'Processing', className: 'bg-[#FFF7ED] text-[#EA580C]' },
  failed: { label: 'Failed', className: 'bg-[#FEF2F2] text-[#DC2626]' },
}

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  const { label, className } = reportStyles[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide',
        className,
      )}
    >
      {label}
    </span>
  )
}

const recordStyles: Record<RecordStatus, { label: string; className: string }> = {
  approved: { label: 'Approved', className: 'bg-[#ECFDF5] text-[#00B67A]' },
  pending: { label: 'Pending', className: 'bg-[#FFF7ED] text-[#EA580C]' },
  rejected: { label: 'Rejected', className: 'bg-[#FEF2F2] text-[#DC2626]' },
  active: { label: 'Active', className: 'bg-[#EFF6FF] text-[#1877F2]' },
  completed: { label: 'Completed', className: 'bg-[#ECFDF5] text-[#00B67A]' },
  inactive: { label: 'Inactive', className: 'bg-[#F1F5F9] text-[#64748B]' },
}

export function RecordStatusBadge({ status }: { status: RecordStatus }) {
  const style = recordStyles[status] ?? {
    label: status,
    className: 'bg-[#F1F5F9] text-[#64748B]',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide',
        style.className,
      )}
    >
      {style.label}
    </span>
  )
}
