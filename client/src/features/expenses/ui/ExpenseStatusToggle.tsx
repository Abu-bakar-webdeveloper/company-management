import { statusLabels } from '@/features/expenses/model/expensesData'
import type { ExpenseStatus } from '@/features/expenses/model/types'
import { cn } from '@/shared/lib/cn'

const statuses: ExpenseStatus[] = ['pending', 'approved', 'rejected']

type ExpenseStatusToggleProps = {
  value: ExpenseStatus
  onChange: (status: ExpenseStatus) => void
}

export function ExpenseStatusToggle({ value, onChange }: ExpenseStatusToggleProps) {
  return (
    <div className="flex h-11 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-1">
      {statuses.map((status) => (
        <button
          key={status}
          type="button"
          onClick={() => onChange(status)}
          className={cn(
            'flex-1 rounded-md px-3 text-sm font-medium transition-colors',
            value === status
              ? 'bg-primary text-white shadow-sm'
              : 'text-heading hover:bg-surface',
          )}
        >
          {statusLabels[status]}
        </button>
      ))}
    </div>
  )
}
