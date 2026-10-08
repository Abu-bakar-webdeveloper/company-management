import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { useTeamWorkload } from '@/features/team/hooks/useTeam'
import { Card } from '@/shared/ui/Card'

const BAR_COLORS = ['#1877f2', '#ff5c00', '#00b67a', '#7c3aed', '#ea580c', '#0ea5e9']

function shortName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 10)
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

export function TeamWorkloadChart() {
  const workloadQuery = useTeamWorkload()

  const chartData = useMemo(() => {
    return (workloadQuery.data ?? []).slice(0, 8).map((member, index) => ({
      name: shortName(member.fullName),
      fullName: member.fullName,
      openTasks: member.openTasks,
      completedTasks: member.completedTasks,
      fill: BAR_COLORS[index % BAR_COLORS.length],
    }))
  }, [workloadQuery.data])

  return (
    <Card className="flex h-[358px] flex-col p-[25px]">
      <div className="flex flex-col gap-1">
        <h3 className="text-[24px] font-semibold leading-6 text-heading">Team Workload</h3>
        <p className="text-sm text-text-muted">Open tasks by team member</p>
      </div>

      <div className="mt-2 min-h-0 flex-1">
        {workloadQuery.isLoading ? (
          <ComingSoonState
            title="Loading workload…"
            description="Fetching open tasks for your team."
            compact
            minHeight="min-h-0 h-full"
          />
        ) : workloadQuery.isError ? (
          <ComingSoonState
            title="Unable to load"
            description="Team workload could not be loaded right now."
            minHeight="min-h-0 h-full"
          />
        ) : chartData.length === 0 ? (
          <ComingSoonState
            title="No workload yet"
            description="Team workload will show up here once tasks are assigned."
            minHeight="min-h-0 h-full"
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                interval={0}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                width={28}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: 12,
                }}
                labelFormatter={(_, payload) => {
                  const row = payload?.[0]?.payload as { fullName?: string } | undefined
                  return row?.fullName ?? ''
                }}
                formatter={(value) => [value, 'Open tasks']}
              />
              <Bar dataKey="openTasks" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {chartData.map((entry) => (
                  <Cell key={entry.fullName} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}
