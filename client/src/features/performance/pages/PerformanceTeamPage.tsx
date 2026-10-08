import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/model/AuthContext'
import { PerformanceDashboardPage } from '@/features/performance/pages/PerformanceDashboardPage'

/** Manager team hub (also reachable by admin/hr as the main dashboard). */
export function PerformanceTeamPage() {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  if (user.role === 'employee') {
    return <Navigate to="/performance" replace />
  }

  if (user.role === 'manager') {
    return <PerformanceDashboardPage teamMode />
  }

  // Admin / HR already land on hub at /performance
  return <Navigate to="/performance" replace />
}
