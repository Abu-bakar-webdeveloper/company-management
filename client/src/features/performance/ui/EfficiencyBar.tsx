import { cn } from '@/shared/lib/cn'

export function EfficiencyBar({
  value,
  color = 'bg-primary',
  className,
}: {
  value: number
  color?: string
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="h-1.5 min-w-[60px] flex-1 overflow-hidden rounded-full bg-[#E2E8F0]">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <span className="shrink-0 text-sm font-semibold text-heading">{value}%</span>
    </div>
  )
}
