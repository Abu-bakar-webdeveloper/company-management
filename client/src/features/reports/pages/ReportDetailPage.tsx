import { useAuth } from '@/features/auth/model/AuthContext'
import {
  SuperAdminReportDetailRoute,
} from '@/features/dashboard/superadmin/reports'
import { OrgReportDetailPage } from '@/features/reports/pages/OrgReportDetailPage'

export function ReportDetailPage() {
  const { user } = useAuth()

  if (user?.role === 'superadmin') {
    return <SuperAdminReportDetailRoute />
  }

  return <OrgReportDetailPage />
}
