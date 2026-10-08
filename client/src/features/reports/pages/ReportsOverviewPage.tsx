import { useAuth } from '@/features/auth/model/AuthContext'
import { SuperAdminReportsRoute } from '@/features/dashboard/superadmin/reports'
import { OrgReportsOverviewPage } from '@/features/reports/pages/OrgReportsOverviewPage'

export function ReportsOverviewPage() {
  const { user } = useAuth()

  if (user?.role === 'superadmin') {
    return <SuperAdminReportsRoute />
  }

  return <OrgReportsOverviewPage />
}
