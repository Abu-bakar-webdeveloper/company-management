import { useMemo } from 'react'
import { RecentCompaniesTableSkeleton } from '@/features/dashboard/superadmin/ui/SuperAdminDashboardSkeletons'
import { useCompaniesList } from '@/features/platform/hooks/useCompanies'
import { mapCompanyRow } from '@/features/platform/lib/company-utils'
import { CompaniesTable } from '@/features/platform/ui/CompaniesTable'

export function RecentCompaniesTable() {
  const companiesQuery = useCompaniesList({ page: 1, limit: 3 })

  const companies = useMemo(
    () => (companiesQuery.data?.companies ?? []).map(mapCompanyRow),
    [companiesQuery.data?.companies],
  )

  if (companiesQuery.isLoading) {
    return <RecentCompaniesTableSkeleton />
  }

  if (companiesQuery.isError) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-xl border border-border-card bg-surface p-6">
        <p className="text-sm text-danger">Unable to load companies.</p>
      </div>
    )
  }

  return (
    <CompaniesTable
      companies={companies}
      page={1}
      total={companies.length}
      rangeStart={companies.length === 0 ? 0 : 1}
      rangeEnd={companies.length}
      totalPages={1}
      onPageChange={() => undefined}
      showPagination={false}
      showViewAll
      viewAllTo="/companies"
    />
  )
}
