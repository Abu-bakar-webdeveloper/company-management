import { useMemo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { useProjectStats } from '@/features/projects/hooks/useProjects'
import { Card } from '@/shared/ui/Card'

const STATUS_META = [
  { key: 'inProgress' as const, name: 'Active', color: '#1877f2' },
  { key: 'completed' as const, name: 'Completed', color: '#00b67a' },
  { key: 'delayed' as const, name: 'Delayed', color: '#ff5c00' },
]

export function ProjectStatusDonut() {
  const projectStats = useProjectStats()

  const { segments, total } = useMemo(() => {
    const stats = projectStats.data
    if (!stats || stats.total === 0) {
      return { segments: [] as Array<{ name: string; value: number; count: number; color: string }>, total: 0 }
    }

    const segments = STATUS_META.map((meta) => {
      const count = stats[meta.key]
      return {
        name: meta.name,
        count,
        value: Math.round((count / stats.total) * 100),
        color: meta.color,
      }
    }).filter((segment) => segment.count > 0)

    // Fix rounding so percentages sum to 100 when possible
    const valueSum = segments.reduce((sum, s) => sum + s.value, 0)
    if (segments.length > 0 && valueSum !== 100) {
      segments[0].value += 100 - valueSum
    }

    return { segments, total: stats.total }
  }, [projectStats.data])

  return (
    <Card className="flex min-h-[358px] flex-col p-[25px]">
      <h3 className="text-[24px] font-semibold leading-6 text-heading">Project Status</h3>

      {projectStats.isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-text-muted">Loading projects…</p>
        </div>
      ) : projectStats.isError ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-danger">Unable to load project stats.</p>
        </div>
      ) : total === 0 ? (
        <ComingSoonState
          className="mt-4 flex-1"
          title="No projects yet"
          description="Add projects to see a status breakdown here."
          minHeight="min-h-0"
        />
      ) : (
        <div className="mt-6 flex flex-1 flex-col items-center justify-center gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative h-[180px] w-[180px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={segments}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={82}
                  dataKey="value"
                  stroke="none"
                  paddingAngle={2}
                >
                  {segments.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[28px] font-bold leading-8 text-heading">{total}</span>
              <span className="text-xs font-medium text-text-muted">Projects</span>
            </div>
          </div>

          <ul className="flex w-full flex-col gap-4 sm:max-w-[200px]">
            {segments.map((item) => (
              <li key={item.name} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-medium text-heading">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-text-muted">
                  {item.count} ({item.value}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}
