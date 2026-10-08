import { useEffect, useMemo, useState } from 'react'
import { WorkProgressChart } from '@/features/dashboard/employee/ui/WorkProgressChart'
import { TasksStatusDonut } from '@/features/dashboard/employee/ui/TasksStatusDonut'
import { useMyTasks, useTaskProgress, useTaskStats } from '@/features/tasks/hooks/useTasks'
import { getTaskStatCardsFromStats } from '@/features/tasks/lib/taskStatCards'
import type { TaskListFilters } from '@/features/tasks/model/types'
import { TaskStatCard } from '@/features/tasks/ui/TaskStatCard'
import { TasksTable } from '@/features/tasks/ui/TasksTable'
import { TasksToolbar } from '@/features/tasks/ui/TasksToolbar'
import { useSystemPreferences } from '@/features/settings/model/SystemPreferencesContext'
import { TableSkeleton } from '@/shared/ui/DataSkeletons'

const PAGE_SIZE = 10

const defaultFilters: TaskListFilters = {
  search: '',
  progress: 'all',
  status: 'all',
}

export function MyTasksPage() {
  const { preferences } = useSystemPreferences()
  const [draftFilters, setDraftFilters] = useState<TaskListFilters>(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState<TaskListFilters>(defaultFilters)
  const [page, setPage] = useState(1)

  const listParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: appliedFilters.search || undefined,
      progress: appliedFilters.progress,
      status: appliedFilters.status === 'all' ? undefined : appliedFilters.status,
    }),
    [page, appliedFilters],
  )

  const { data: listData, isLoading } = useMyTasks(listParams)
  const { data: stats } = useTaskStats('mine')
  const taskProgress = useTaskProgress('mine')

  const statCards = useMemo(() => getTaskStatCardsFromStats(stats), [stats])

  const progressTrend = useMemo(() => {
    const data = taskProgress.data ?? []
    if (data.length < 2) return undefined
    const prev = data[data.length - 2]?.completed ?? 0
    const curr = data[data.length - 1]?.completed ?? 0
    if (prev === 0) return curr > 0 ? '↑ New' : undefined
    const pct = Math.round(((curr - prev) / prev) * 100)
    return pct >= 0 ? `↑ ${pct}%` : `↓ ${Math.abs(pct)}%`
  }, [taskProgress.data])

  useEffect(() => {
    setPage(1)
  }, [appliedFilters])

  const tasks = listData?.tasks ?? []
  const pagination = listData?.pagination
  const total = pagination?.total ?? 0
  const totalPages = pagination?.totalPages ?? 0
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(page * PAGE_SIZE, total)
  const isFiltered =
    appliedFilters.search.trim() !== '' ||
    appliedFilters.progress !== 'all' ||
    appliedFilters.status !== 'all'
  const showToolbar = !isLoading && (isFiltered || total > 0)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-8 text-heading sm:text-[30px] sm:leading-9">
            My Tasks
          </h1>
          <p className="mt-1 text-sm leading-6 text-text-muted sm:text-base">
            View and manage all assigned tasks.
          </p>
        </div>
      </header>

      {preferences.showQuickStats && (
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <TaskStatCard key={card.id} data={card} />
          ))}
        </section>
      )}

      {preferences.enableCharts && (
        <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
          <WorkProgressChart
            data={taskProgress.data}
            isLoading={taskProgress.isLoading}
            trend={progressTrend}
          />
          <TasksStatusDonut useLiveTaskStats />
        </section>
      )}

      {showToolbar ? (
        <TasksToolbar
          filters={draftFilters}
          onChange={setDraftFilters}
          onReset={() => {
            setDraftFilters(defaultFilters)
            setAppliedFilters(defaultFilters)
          }}
          onApply={() => setAppliedFilters(draftFilters)}
        />
      ) : null}

      <section>
        {isLoading ? (
          <TableSkeleton columns={7} rows={8} />
        ) : (
          <TasksTable
            tasks={tasks}
            page={page}
            total={total}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            totalPages={Math.max(totalPages, 1)}
            onPageChange={setPage}
            isFiltered={isFiltered}
          />
        )}
      </section>
    </div>
  )
}
