import { formatBoardDueDate } from '@/features/tasks/lib/board-utils'
import { CalendarIcon } from '@/features/tasks/ui/taskDetailIcons'
import { cn } from '@/shared/lib/cn'

export function BoardDueDate({ date }: { date: string }) {
  if (!date) return null
  const { label, overdue } = formatBoardDueDate(date)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[11px] font-semibold',
        overdue ? 'text-danger' : 'text-text-muted',
      )}
    >
      <CalendarIcon className="size-3" />
      {label}
    </span>
  )
}
