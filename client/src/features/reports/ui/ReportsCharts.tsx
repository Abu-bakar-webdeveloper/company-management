import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { useAuth } from '@/features/auth/model/AuthContext'
import { isCompanyHubEnabled } from '@/features/auth/model/companyHubs'
import type { ReportsOverviewCharts } from '@/features/reports/model/types'
import { Card } from '@/shared/ui/Card'

const BAR_COLORS = ['#DBEAFE', '#BFDBFE', '#DBEAFE', '#93C5FD', '#1877F2']

function EmployeeGrowthCard({
  data,
  change,
}: {
  data: ReportsOverviewCharts['employeeGrowth']
  change: number
}) {
  const changeLabel = `${change >= 0 ? '+' : ''}${change}%`
  const hasData = data.length > 0
  return (
    <Card className="flex min-h-[300px] flex-col p-4 sm:p-[25px]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-bold text-heading sm:text-lg">Employee Growth</h3>
        {hasData ? (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              change >= 0 ? 'bg-[#ECFDF5] text-[#00B67A]' : 'bg-[#FEF2F2] text-[#DC2626]'
            }`}
          >
            {changeLabel}
          </span>
        ) : null}
      </div>
      <div className="min-h-0 flex-1">
        {!hasData ? (
          <ComingSoonState
            title="No growth yet"
            description="Employee growth trends will show up here once data is available."
            minHeight="min-h-0 h-full"
          />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 12 }}
              />
              <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#1877F2"
                strokeWidth={2.5}
                fill="url(#growthGradient)"
              />
              <defs>
                <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1877F2" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#1877F2" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}

function ProjectTrendCard({ data }: { data: ReportsOverviewCharts['projectTrend'] }) {
  return (
    <Card className="flex min-h-[300px] flex-col p-4 sm:p-[25px]">
      <h3 className="mb-4 text-base font-bold text-heading sm:text-lg">Project Starts</h3>
      <div className="min-h-0 flex-1">
        {data.length === 0 ? (
          <ComingSoonState
            title="No projects yet"
            description="Project start trends will show up here once projects are created."
            minHeight="min-h-0 h-full"
          />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 12 }}
              />
              <YAxis hide />
              <Tooltip cursor={{ fill: 'rgba(24,119,242,0.04)' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {data.map((entry, index) => (
                  <Cell key={entry.month} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}

function LeavesOverviewCard({ data }: { data: ReportsOverviewCharts['leavesBreakdown'] }) {
  const hasData = !data.every((item) => item.count === 0)
  return (
    <Card className="flex min-h-[300px] flex-col p-4 sm:p-[25px]">
      <h3 className="mb-6 text-base font-bold text-heading sm:text-lg">Leaves Overview</h3>
      {!hasData ? (
        <ComingSoonState
          className="flex-1"
          title="No leave requests yet"
          description="Leave breakdown will show up here once requests are submitted."
          minHeight="min-h-0"
        />
      ) : (
        <ul className="flex flex-col gap-5">
          {data.map((item) => (
            <li key={item.label}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-heading">
                  {item.label} ({item.count})
                </span>
                <span className="font-semibold text-heading">{item.percent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

function PerformanceDonutCard({
  data,
  avgRating,
}: {
  data: ReportsOverviewCharts['performanceDistribution']
  avgRating: number
}) {
  const hasData = data.some((item) => item.value > 0)
  return (
    <Card className="flex min-h-[300px] flex-col p-4 sm:p-[25px]">
      {!hasData ? (
        <>
          <h3 className="mb-4 text-base font-bold text-heading sm:text-lg">Performance</h3>
          <ComingSoonState
            className="flex-1"
            title="No performance yet"
            description="Performance distribution will show up here once reviews are available."
            minHeight="min-h-0"
          />
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 sm:flex-row sm:justify-evenly">
          <div className="relative h-[160px] w-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={72}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-heading">{avgRating || '—'}</span>
              <span className="text-[10px] uppercase tracking-wide text-text-muted">Avg Rating</span>
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-base font-bold text-heading sm:text-lg">Performance</h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              {data.map((item) => (
                <li key={item.name} className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-heading">{item.name}</span>
                  <span className="font-semibold text-text-muted">({item.value}%)</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  )
}

export function ReportsCharts({
  charts,
  module = 'All Modules',
}: {
  charts: ReportsOverviewCharts
  module?: string
}) {
  const { user } = useAuth()
  const peopleHub = isCompanyHubEnabled(user?.enabledHubs, 'people')
  const workHub = isCompanyHubEnabled(user?.enabledHubs, 'work')
  const showAll = module === 'All Modules'

  const cards = [
    peopleHub && (showAll || module === 'Employees') ? (
      <EmployeeGrowthCard
        key="employees"
        data={charts.employeeGrowth}
        change={charts.employeeGrowthChange}
      />
    ) : null,
    workHub && (showAll || module === 'Projects') ? (
      <ProjectTrendCard key="projects" data={charts.projectTrend} />
    ) : null,
    peopleHub && (showAll || module === 'Leaves') ? (
      <LeavesOverviewCard key="leaves" data={charts.leavesBreakdown} />
    ) : null,
    peopleHub && (showAll || module === 'Performance') ? (
      <PerformanceDonutCard
        key="performance"
        data={charts.performanceDistribution}
        avgRating={charts.performanceAvgRating}
      />
    ) : null,
  ].filter(Boolean)

  if (cards.length === 0) return null

  return (
    <div className={`mb-6 grid grid-cols-1 gap-4 ${cards.length > 1 ? 'lg:grid-cols-2' : ''}`}>
      {cards}
    </div>
  )
}
