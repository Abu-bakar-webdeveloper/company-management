import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { performanceApi } from '@/features/performance/api/performanceApi'
import type { ReviewCycle } from '@/features/performance/model/contracts'
import { Card } from '@/shared/ui/Card'
import { ArrowLeftIcon } from '@/shared/ui/icons'
import { SelectField } from '@/shared/ui/SelectField'

export function PerformanceCyclesPage() {
  const [cycles, setCycles] = useState<ReviewCycle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [type, setType] = useState<ReviewCycle['type']>('quarterly')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setCycles(await performanceApi.listCycles())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cycles')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const create = async () => {
    if (!name || !periodStart || !periodEnd) return
    setError(null)
    try {
      await performanceApi.createCycle({
        name,
        type,
        periodStart,
        periodEnd,
        status: 'active',
      })
      setName('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create cycle')
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
        <h1 className="text-[28px] font-bold text-heading">Review Cycles</h1>
        <p className="mt-1 text-base text-text-muted">
          Named quarterly/annual cycles with completion tracking. Monthly reviews remain the default.
        </p>
      </header>

      {error && (
        <div className="mb-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#DC2626]">
          {error}
        </div>
      )}

      <Card className="mb-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <input
          className="h-10 rounded-lg border border-border px-3 text-sm"
          placeholder="Cycle name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <SelectField
          className="!h-10 rounded-lg text-sm"
          value={type}
          onChange={(e) => setType(e.target.value as ReviewCycle['type'])}
          aria-label="Cycle type"
        >
          <option value="quarterly">Quarterly</option>
          <option value="annual">Annual</option>
          <option value="custom">Custom</option>
        </SelectField>
        <input
          type="date"
          className="h-10 rounded-lg border border-border px-3 text-sm"
          value={periodStart}
          onChange={(e) => setPeriodStart(e.target.value)}
        />
        <input
          type="date"
          className="h-10 rounded-lg border border-border px-3 text-sm"
          value={periodEnd}
          onChange={(e) => setPeriodEnd(e.target.value)}
        />
        <button
          type="button"
          onClick={() => void create()}
          className="h-10 rounded-lg bg-primary text-sm font-semibold text-white"
        >
          Create cycle
        </button>
      </Card>

      {loading ? (
        <p className="text-sm text-text-muted">Loading…</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {cycles.map((cycle) => (
            <Card key={cycle.id} className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-heading">{cycle.name}</h2>
                  <p className="mt-1 text-xs uppercase text-text-muted">
                    {cycle.type} · {cycle.status}
                  </p>
                </div>
                <span className="text-sm font-bold text-primary">{cycle.completionPct}%</span>
              </div>
              <p className="mt-3 text-sm text-text-muted">
                {cycle.periodStart} → {cycle.periodEnd}
              </p>
              <p className="mt-1 text-sm text-heading">
                Due / unscored: {cycle.dueCount}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
