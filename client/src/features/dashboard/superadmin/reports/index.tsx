import { SuperAdminReportDetailPage } from '@/features/dashboard/superadmin/reports/pages/SuperAdminReportDetailPage'
import { SuperAdminReportsPage } from '@/features/dashboard/superadmin/reports/pages/SuperAdminReportsPage'

export { SuperAdminReportDetailPage, SuperAdminReportsPage }

export function SuperAdminReportsRoute() {
  return <SuperAdminReportsPage />
}

export function SuperAdminReportDetailRoute() {
  return <SuperAdminReportDetailPage />
}
