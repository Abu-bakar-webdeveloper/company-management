import { useCallback, useEffect, useState } from 'react'
import { performanceApi } from '@/features/performance/api/performanceApi'
import type { PerformanceSummary } from '@/features/performance/model/contracts'

export function usePerformanceSummary(employeeId: string | undefined, enabled = true) {
  const [summary, setSummary] = useState<PerformanceSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!employeeId || !enabled) return
    setLoading(true)
    setError(null)
    try {
      const data = await performanceApi.getSummary(employeeId)
      setSummary(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load performance summary')
    } finally {
      setLoading(false)
    }
  }, [employeeId, enabled])

  useEffect(() => {
    void load()
  }, [load])

  return { summary, loading, error, reload: load }
}
