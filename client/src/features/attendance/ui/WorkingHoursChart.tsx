import type { ReactNode } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export type WorkingHoursDay = {
  date: string
  label: string
  hours: number
  expectedHours: number
}

export function WorkingHoursChart({
  totalHours,
  expectedTotal,
  days,
  title = 'Working Hours',
  subtitle,
  periodLabel = 'This Week',
  variant = 'bar',
  showExpectedBars = true,
  filter,
}: {
  totalHours: number
  expectedTotal?: number
  days: WorkingHoursDay[]
  title?: string
  subtitle?: string
  periodLabel?: string
  /** `bar` for week comparison; `area` for month trend. */
  variant?: 'bar' | 'area'
  /** Side-by-side expected bars (bar variant only). */
  showExpectedBars?: boolean
  /** Optional period control (week/month picker) rendered in the header */
  filter?: ReactNode
}) {
  const data = days.map((d) => ({
    label: d.label,
    hours: d.hours,
    expected: d.expectedHours,
  }))

  const expectedHint =
    expectedTotal != null && expectedTotal > 0
      ? ` · ${expectedTotal}h expected`
      : ''

  const tooltipFormatter = (
    value: number | string | ReadonlyArray<number | string> | undefined,
    name: number | string | undefined,
  ): [string, string] => [
    `${Array.isArray(value) ? value[0] ?? 0 : (value ?? 0)}h`,
    name === 'expected' ? 'Expected' : 'Worked',
  ]

  return (
    <div className="rounded-xl border border-border-card bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-heading">{title}</h3>
          <p className="mt-1 text-sm text-text-muted">
            <span className="font-semibold text-heading">{totalHours}h</span>{' '}
            {subtitle ?? 'Work time this week'}
            {expectedHint ? (
              <span className="text-text-muted">{expectedHint}</span>
            ) : null}
          </p>
        </div>
        {filter ? (
          <div className="flex flex-wrap items-center gap-2">{filter}</div>
        ) : (
          <span className="text-xs text-text-muted">{periodLabel}</span>
        )}
      </div>
      <div className="mt-4 h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {variant === 'area' ? (
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="workingHoursFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#136DEC" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#136DEC" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                fontSize={10}
                interval="preserveStartEnd"
                minTickGap={12}
              />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip formatter={tooltipFormatter} />
              <Area
                type="monotone"
                dataKey="expected"
                stroke="#94A3B8"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="none"
                name="expected"
                dot={false}
                activeDot={false}
              />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="#136DEC"
                strokeWidth={2}
                fill="url(#workingHoursFill)"
                name="hours"
                dot={false}
                activeDot={{ r: 4, fill: '#136DEC' }}
              />
            </AreaChart>
          ) : (
            <BarChart data={data} barGap={4} barCategoryGap="20%">
              <CartesianGrid vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} interval={0} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip formatter={tooltipFormatter} />
              {showExpectedBars ? (
                <Bar dataKey="expected" fill="#E2E8F0" radius={[6, 6, 0, 0]} name="expected" />
              ) : null}
              <Bar dataKey="hours" fill="#136DEC" radius={[6, 6, 0, 0]} name="hours" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
      {variant === 'area' ? (
        <div className="mt-3 flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 rounded-full bg-[#136DEC]" />
            Worked
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-px w-3 border-t border-dashed border-[#94A3B8]" />
            Expected
          </span>
        </div>
      ) : null}
    </div>
  )
}
