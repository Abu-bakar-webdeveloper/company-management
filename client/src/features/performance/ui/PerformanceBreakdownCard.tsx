import type { PerformanceBreakdownItem } from '@/features/performance/model/contracts'
import { MoreIcon } from '@/features/performance/ui/icons'
import { Card } from '@/shared/ui/Card'

export function PerformanceBreakdownCard({ items }: { items: PerformanceBreakdownItem[] }) {
  return (
    <Card className="flex min-h-[300px] flex-col p-4 sm:min-h-[320px] sm:p-[25px]">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h3 className="text-base font-bold text-heading sm:text-lg">Performance Breakdown</h3>
        <button
          type="button"
          className="flex size-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface-muted"
          aria-label="Breakdown options"
        >
          <MoreIcon />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm text-text-muted">
          No breakdown data for this period
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-center gap-5">
          {items.map((item) => (
            <div key={item.key}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-heading">{item.label}</p>
                <p className="text-sm font-bold text-heading">{item.value}%</p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, Math.max(0, item.value))}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
