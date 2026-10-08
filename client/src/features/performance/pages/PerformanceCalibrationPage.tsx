import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { performanceApi } from '@/features/performance/api/performanceApi'
import type { Calibration } from '@/features/performance/model/contracts'
import { statusLabel } from '@/features/performance/lib/performance-utils'
import { Card } from '@/shared/ui/Card'
import { ArrowLeftIcon } from '@/shared/ui/icons'

export function PerformanceCalibrationPage() {
  const [data, setData] = useState<Calibration | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setData(await performanceApi.getCalibration())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load calibration')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

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
        <h1 className="text-[28px] font-bold text-heading">Calibration</h1>
        <p className="mt-1 text-base text-text-muted">
          Distribution of KPI levels by department and manager. Warnings are soft — nothing is blocked.
        </p>
      </header>

      {error && (
        <div className="mb-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#DC2626]">
          {error}
        </div>
      )}

      {loading || !data ? (
        <p className="text-sm text-text-muted">Loading…</p>
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <Card className="p-4">
              <p className="text-xs text-text-muted">Reviews</p>
              <p className="mt-1 text-2xl font-bold text-heading">{data.totalReviews}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-text-muted">Avg KPI Score</p>
              <p className="mt-1 text-2xl font-bold text-heading">{data.avgScore}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-text-muted">Warnings</p>
              <p className="mt-1 text-2xl font-bold text-heading">{data.warnings.length}</p>
            </Card>
          </div>

          {data.warnings.length > 0 && (
            <Card className="mb-6 space-y-2 border border-[#FDE68A] bg-[#FFFBEB] p-4">
              {data.warnings.map((warning) => (
                <p key={warning} className="text-sm text-[#92400E]">
                  {warning}
                </p>
              ))}
            </Card>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="mb-3 font-bold text-heading">Level distribution</h2>
              <ul className="space-y-2">
                {data.distribution.map((bucket) => (
                  <li key={bucket.level} className="flex justify-between text-sm">
                    <span>{statusLabel(bucket.level)}</span>
                    <span className="font-semibold">
                      {bucket.count} ({bucket.pct}%)
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-5">
              <h2 className="mb-3 font-bold text-heading">By department</h2>
              <ul className="space-y-2">
                {data.byDepartment.map((row) => (
                  <li key={row.department} className="flex justify-between text-sm">
                    <span>{row.department}</span>
                    <span className="font-semibold">
                      avg {row.avgScore} · {row.excellentPct}% excellent
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-5 lg:col-span-2">
              <h2 className="mb-3 font-bold text-heading">By manager</h2>
              <ul className="space-y-2">
                {data.byManager.map((row) => (
                  <li key={row.managerId} className="flex justify-between text-sm">
                    <span>{row.managerName}</span>
                    <span className="font-semibold">
                      avg {row.avgScore} · {row.excellentPct}% excellent · n={row.count}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
