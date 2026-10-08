import { Link } from 'react-router-dom'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { Card } from '@/shared/ui/Card'

export type HubBreakdownItem = {
  id: string
  label: string
  value: string | number
  percent: number
  color: string
}

type HubBreakdownCardProps = {
  title: string
  items: HubBreakdownItem[]
  empty?: string
  emptyDescription?: string
  actionTo?: string
  actionLabel?: string
  variant?: 'bars' | 'donut'
  centerLabel?: string
  centerSubLabel?: string
}

export function HubBreakdownCard({
  title,
  items,
  empty = 'No data yet',
  emptyDescription = 'This breakdown will show up here once data is available.',
  actionTo,
  actionLabel = 'View all',
  variant = 'bars',
  centerLabel,
  centerSubLabel,
}: HubBreakdownCardProps) {
  const pieData =
    items.length > 0
      ? items.map((item) => ({
          name: item.label,
          value: Math.max(Number(item.percent) || 0, 0.01),
          color: item.color,
        }))
      : [{ name: 'Empty', value: 1, color: '#E2E8F0' }]

  return (
    <Card className="flex min-h-[260px] flex-col p-4 sm:min-h-[300px] sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-bold text-heading sm:text-lg">{title}</h3>
        {actionTo ? (
          <Link to={actionTo} className="text-xs font-semibold text-primary hover:opacity-90">
            {actionLabel}
          </Link>
        ) : null}
      </div>
      {items.length === 0 ? (
        <ComingSoonState
          className="flex-1"
          title={empty}
          description={emptyDescription}
          minHeight="min-h-0"
          compact
        />
      ) : variant === 'donut' ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 sm:flex-row sm:items-center">
          <div className="relative h-[180px] w-full max-w-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                  stroke="none"
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {(centerLabel || centerSubLabel) && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                {centerLabel ? (
                  <p className="text-xl font-bold text-heading">{centerLabel}</p>
                ) : null}
                {centerSubLabel ? (
                  <p className="text-xs text-text-muted">{centerSubLabel}</p>
                ) : null}
              </div>
            )}
          </div>
          <ul className="flex w-full max-w-xs flex-col gap-2">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 text-heading">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.label}
                </span>
                <span className="font-semibold text-heading">{item.value}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((item) => (
            <li key={item.id}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-heading">{item.label}</span>
                <span className="font-semibold text-heading">{item.value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(0, item.percent))}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
