import type { PlatformCharts } from '@/features/dashboard/superadmin/reports/api/platformReportsApi'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { Card } from '@/shared/ui/Card'
import { cn } from '@/shared/lib/cn'

export function SuperAdminReportCharts({ charts }: { charts: PlatformCharts }) {
  const maxRevenue = Math.max(...charts.revenueTrend.map((d) => d.value), 1)

  return (
    <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Card className="p-5 sm:p-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h3 className="text-base font-bold text-heading">Growth Trend</h3>
        </div>
        {charts.revenueTrend.length === 0 ? (
          <ComingSoonState
            title="No trend yet"
            description="Growth trends will show up here once platform data is available."
            minHeight="min-h-[208px]"
          />
        ) : (
          <div className="flex h-52 items-end justify-between gap-2 px-1 sm:gap-3">
            {charts.revenueTrend.map((item, index) => (
              <div key={`${item.month}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={cn(
                    'w-full max-w-11 rounded-t-md',
                    index === charts.revenueTrend.length - 1 ? 'bg-primary' : 'bg-[#E2E8F0]',
                  )}
                  style={{ height: `${(item.value / maxRevenue) * 100}%`, minHeight: '24px' }}
                />
                <span className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
                  {item.month}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5 sm:p-6">
        <h3 className="mb-6 text-base font-bold text-heading">Subscription Breakdown</h3>
        {charts.subscriptionBreakdown.length === 0 ? (
          <ComingSoonState
            title="No subscriptions yet"
            description="Subscription breakdown will show up here once companies subscribe."
            minHeight="min-h-[208px]"
          />
        ) : (
          <div className="space-y-5">
            {charts.subscriptionBreakdown.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="inline-flex items-center gap-2 font-medium text-heading">
                    <span className={cn('size-2.5 shrink-0 rounded-full', item.dot)} />
                    {item.label}
                  </span>
                  <span className="font-semibold text-heading">{item.percent}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#F1F5F9]">
                  <div
                    className={cn('h-full rounded-full', item.color)}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
