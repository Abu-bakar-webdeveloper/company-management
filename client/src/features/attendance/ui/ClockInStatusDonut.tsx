import type { ReactNode } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

type ClockInStatusDonutProps = {
  onTime: number
  late: number
  notArrived: number
  onTimePercent: number
  /** Caption under the title (e.g. "In range" or "Today") */
  periodLabel?: string
  /** Optional period control (e.g. month picker) rendered in the header */
  filter?: ReactNode
}

export function ClockInStatusDonut({
  onTime,
  late,
  notArrived,
  onTimePercent,
  periodLabel = 'Today',
  filter,
}: ClockInStatusDonutProps) {
  const parts = [
    { name: 'On time', value: onTime, color: '#00B67A' },
    { name: 'Late', value: late, color: '#EF4444' },
    { name: 'Not Arrived', value: notArrived, color: '#F59E0B' },
  ].filter((p) => p.value > 0)

  const data =
    parts.length > 0
      ? parts
      : [{ name: 'Empty', value: 1, color: '#E2E8F0' }]

  return (
    <div className="rounded-xl border border-border-card bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-heading">Clock in Status</h3>
          {!filter ? (
            <span className="mt-0.5 block text-xs text-text-muted">{periodLabel}</span>
          ) : null}
        </div>
        {filter ? (
          <div className="flex flex-wrap items-center gap-2">{filter}</div>
        ) : (
          <span className="text-xs text-text-muted">{periodLabel}</span>
        )}
      </div>
      <div className="relative mx-auto mt-2 h-[200px] w-full max-w-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={58}
              outerRadius={80}
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold text-heading">{onTimePercent}%</p>
          <p className="text-xs text-text-muted">Arrived on Time</p>
        </div>
      </div>
      <ul className="mt-2 space-y-2 text-sm">
        <li className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-text-muted">
            <span className="size-2.5 rounded-full bg-[#00B67A]" /> On time
          </span>
          <span className="font-semibold text-heading">{onTime}</span>
        </li>
        <li className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-text-muted">
            <span className="size-2.5 rounded-full bg-[#EF4444]" /> Late
          </span>
          <span className="font-semibold text-heading">{late}</span>
        </li>
        <li className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-text-muted">
            <span className="size-2.5 rounded-full bg-[#F59E0B]" /> Not Arrived
          </span>
          <span className="font-semibold text-heading">{notArrived}</span>
        </li>
      </ul>
    </div>
  )
}
