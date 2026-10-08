import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { performanceApi } from '@/features/performance/api/performanceApi'
import type { KpiTemplate } from '@/features/performance/model/contracts'
import { Card } from '@/shared/ui/Card'
import { ArrowLeftIcon } from '@/shared/ui/icons'

export function KpiTemplatesPage() {
  const [templates, setTemplates] = useState<KpiTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setTemplates(await performanceApi.listKpiTemplates())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const activate = async (id: string) => {
    setSavingId(id)
    try {
      await performanceApi.activateKpiTemplate(id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate template')
    } finally {
      setSavingId(null)
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
        <h1 className="text-[28px] font-bold text-heading">KPI Template Setup</h1>
        <p className="mt-1 text-base text-text-muted">
          Manage category weights and sub-KPIs per role. Activating a template deactivates the previous one.
        </p>
      </header>

      {error && (
        <div className="mb-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#DC2626]">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-text-muted">Loading templates…</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {templates.map((tpl) => (
            <Card key={tpl.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-heading">{tpl.name}</h2>
                  <p className="mt-1 text-xs font-semibold uppercase text-text-muted">
                    {tpl.role} · v{tpl.version} · {tpl.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                {!tpl.isActive && (
                  <button
                    type="button"
                    disabled={savingId === tpl.id}
                    onClick={() => void activate(tpl.id)}
                    className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    Activate
                  </button>
                )}
              </div>
              <ul className="mt-4 space-y-2">
                {tpl.categories.map((cat) => (
                  <li key={cat.name} className="rounded-lg bg-[#F8FAFC] p-3 text-sm">
                    <div className="flex justify-between font-semibold text-heading">
                      <span>{cat.name}</span>
                      <span>
                        {cat.maxMarks} pts ({cat.weightPct}%)
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-text-muted">
                      {cat.subKpis.map((s) => s.label).join(' · ')}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
