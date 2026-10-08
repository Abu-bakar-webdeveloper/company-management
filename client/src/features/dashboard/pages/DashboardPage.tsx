import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/model/AuthContext'
import { AdminDashboardPage } from '@/features/dashboard/admin/AdminDashboardPage'
import { EmployeeDashboardPage } from '@/features/dashboard/employee/EmployeeDashboardPage'
import { HrDashboardPage } from '@/features/dashboard/hr/HrDashboardPage'
import { ManagerDashboardPage } from '@/features/dashboard/manager/ManagerDashboardPage'
import { SuperAdminDashboardPage } from '@/features/dashboard/superadmin/SuperAdminDashboardPage'
import { getAdminDashboardView } from '@/features/settings/lib/preference-utils'
import { useSystemPreferences } from '@/features/settings/model/SystemPreferencesContext'

export function DashboardPage() {
  const { user } = useAuth()
  const { preferences } = useSystemPreferences()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.status === 'pending') {
    return <Navigate to="/pending-approval" replace />
  }

  switch (user.role) {
    case 'superadmin':
      return <SuperAdminDashboardPage />
    case 'admin': {
      const view = getAdminDashboardView(preferences.defaultDashboard)
      if (view === 'manager') return <ManagerDashboardPage />
      if (view === 'employee') return <EmployeeDashboardPage />
      return <AdminDashboardPage />
    }
    case 'hr':
      return <HrDashboardPage />
    case 'manager':
      return <ManagerDashboardPage />
    case 'employee':
    default:
      return <EmployeeDashboardPage />
  }
}
