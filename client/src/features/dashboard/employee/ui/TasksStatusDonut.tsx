import { useMemo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { useTaskStats } from '@/features/tasks/hooks/useTasks'
import { tasksStatusData } from '@/features/dashboard/employee/model/employeeDashboardData'

type DonutSegment = { name: string; value: number; color: string }

type TasksStatusDonutProps = {
  title?: string
  data?: DonutSegment[]
  completedSegmentName?: string
  centerSubLabel?: string
  /** When true, ignore `data` prop and load from task stats API (employee dashboard). */
  useLiveTaskStats?: boolean
}

function toPercentSegments(
  parts: Array<{ name: string; count: number; color: string }>,
): DonutSegment[] {
  const total = parts.reduce((sum, part) => sum + part.count, 0)
  if (total === 0) return []

  const segments = parts
    .filter((part) => part.count > 0)
    .map((part) => ({
      name: part.name,
      value: Math.round((part.count / total) * 100),
      color: part.color,
    }))

  const valueSum = segments.reduce((sum, s) => sum + s.value, 0)
  if (segments.length > 0 && valueSum !== 100) {
    segments[0].value += 100 - valueSum
  }
  return segments
}

export function TasksStatusDonut({
  title = 'Tasks Status',
  data: dataProp,
  completedSegmentName = 'Done',
  centerSubLabel = 'Completed',
  useLiveTaskStats = false,
}: TasksStatusDonutProps) {
  const taskStats = useTaskStats('mine')

  const data = useMemo(() => {
    if (dataProp) return dataProp
    if (!useLiveTaskStats) return tasksStatusData
    if (!taskStats.data || taskStats.data.total === 0) return []

    const other = Math.max(
      0,
      taskStats.data.total - taskStats.data.completed - taskStats.data.inProgress,
    )

    return toPercentSegments([
      { name: 'Done', count: taskStats.data.completed, color: '#4CAF50' },
      { name: 'Active', count: taskStats.data.inProgress, color: '#1877F2' },
      { name: 'Other', count: other, color: '#CBD5E1' },
    ])
  }, [dataProp, useLiveTaskStats, taskStats.data])

  const completedPercent = data.find((item) => item.name === completedSegmentName)?.value ?? 0
  const isLoading = useLiveTaskStats && !dataProp && taskStats.isLoading
  const isError = useLiveTaskStats && !dataProp && taskStats.isError

  return (
    <div className="flex min-h-[320px] flex-col rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:min-h-[358px] sm:p-6">
      <h3 className="text-xl font-semibold leading-6 text-[#1E293B] sm:text-2xl">{title}</h3>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-text-muted">Loading task status…</p>
        </div>
      ) : isError ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-danger">Unable to load task stats.</p>
        </div>
      ) : data.length === 0 ? (
        <ComingSoonState
          className="mt-4 flex-1"
          title="No tasks yet"
          description="Task status will show up here once tasks are created."
          minHeight="min-h-0"
        />
      ) : (
        <div className="mt-6 flex flex-1 flex-col items-center justify-center gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative h-[180px] w-[180px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={82}
                  dataKey="value"
                  stroke="none"
                  paddingAngle={2}
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[28px] font-bold leading-8 text-[#1E293B]">{completedPercent}%</span>
              <span className="text-xs font-medium text-[#64748B]">{centerSubLabel}</span>
            </div>
          </div>

          <ul className="flex w-full flex-col gap-4 sm:max-w-[200px]">
            {data.map((item) => (
              <li key={item.name} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-medium text-[#1E293B]">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-[#64748B]">{item.value}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
