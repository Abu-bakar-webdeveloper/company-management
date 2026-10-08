import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/model/AuthContext'
import { MyPerformancePage } from '@/features/performance/pages/MyPerformancePage'
import { PerformanceDashboardPage } from '@/features/performance/pages/PerformanceDashboardPage'

/**
 * Role-aware performance home:
 * - employee → personal My Performance
 * - manager → personal My Performance (team hub is in the sidebar)
 * - admin / hr → org performance hub (no personal ratings)
 */
export function PerformanceHomePage() {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  if (user.role === 'employee') {
    return <MyPerformancePage />
  }

  if (user.role === 'manager') {
    return <MyPerformancePage />
  }

  if (user.role === 'admin' || user.role === 'hr') {
    return <PerformanceDashboardPage />
  }

  return <Navigate to="/dashboard" replace />
}
