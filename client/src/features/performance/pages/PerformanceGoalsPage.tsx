import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/model/AuthContext'
import { performanceApi } from '@/features/performance/api/performanceApi'
import type { Goal } from '@/features/performance/model/contracts'
import { Card } from '@/shared/ui/Card'
import { ArrowLeftIcon } from '@/shared/ui/icons'

export function PerformanceGoalsPage() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setGoals(await performanceApi.listGoals())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load goals')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const create = async () => {
    if (!user?.id || !title.trim()) return
    try {
      await performanceApi.createGoal({
        employeeId: user.id,
        title: title.trim(),
        keyResults: [
          { id: crypto.randomUUID(), title: 'Progress', target: 100, current: 0, unit: '%' },
        ],
      })
      setTitle('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create goal')
    }
  }

  const bumpProgress = async (goal: Goal, delta: number) => {
    const keyResults = goal.keyResults.map((kr, index) =>
      index === 0
        ? { ...kr, current: Math.max(0, Math.min(kr.target, kr.current + delta)) }
        : kr,
    )
    try {
      await performanceApi.updateGoal(goal.id, { keyResults, status: 'in_progress' })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update goal')
    }
  }

  const confirm = async (goal: Goal) => {
    try {
      await performanceApi.updateGoal(goal.id, { managerConfirmed: true, status: 'completed' })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm goal')
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link
        to="/performance"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-heading"
      >
        <ArrowLeftIcon className="text-text-muted" />
        Back to Performance
      </Link>
      <header className="mb-6">
        <h1 className="text-[28px] font-bold text-heading">Goals / OKRs</h1>
        <p className="mt-1 text-base text-text-muted">
          Track objectives alongside the KPI scorecard. Progress does not auto-overwrite marks.
        </p>
      </header>

      {error && (
        <div className="mb-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#DC2626]">
          {error}
        </div>
      )}

      <Card className="mb-6 flex flex-col gap-3 p-4 sm:flex-row">
        <input
          className="h-10 flex-1 rounded-lg border border-border px-3 text-sm"
          placeholder="New goal title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button
          type="button"
          onClick={() => void create()}
          className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-white"
        >
          Add goal
        </button>
      </Card>

      {loading ? (
        <p className="text-sm text-text-muted">Loading…</p>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => (
            <Card key={goal.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-bold text-heading">{goal.title}</h2>
                  <p className="mt-1 text-xs uppercase text-text-muted">
                    {goal.status} · {goal.progressPct}%
                    {goal.managerConfirmed ? ' · Confirmed' : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void bumpProgress(goal, 10)}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold"
                  >
                    +10%
                  </button>
                  {(user?.role === 'manager' || user?.role === 'admin' || user?.role === 'hr') &&
                    !goal.managerConfirmed && (
                      <button
                        type="button"
                        onClick={() => void confirm(goal)}
                        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Confirm
                      </button>
                    )}
                </div>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E2E8F0]">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${goal.progressPct}%` }}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
