import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toSuperAdminStatCards } from '@/features/dashboard/superadmin/lib/superadminStatCards'
import { CompanyGrowthChart } from '@/features/dashboard/superadmin/ui/CompanyGrowthChart'
import { RecentCompaniesTable } from '@/features/dashboard/superadmin/ui/RecentCompaniesTable'
import { RevenueDonutChart } from '@/features/dashboard/superadmin/ui/RevenueDonutChart'
import { StatCardsRowSkeleton } from '@/features/dashboard/superadmin/ui/SuperAdminDashboardSkeletons'
import { DashboardPageHeader } from '@/features/dashboard/ui/DashboardPageHeader'
import { DashboardStatCard } from '@/features/dashboard/ui/DashboardStatCard'
import { PlatformActivityFeed } from '@/features/dashboard/ui/PlatformActivityFeed'
import { activitiesApi } from '@/features/notifications/api/activitiesApi'
import { toRecentActivityItems } from '@/features/notifications/lib/activity-mappers'
import { useCompanyStats } from '@/features/platform/hooks/useCompanies'
import { companyStatsToStatCards } from '@/features/platform/lib/company-utils'
import { queryKeys } from '@/shared/api/queryKeys'

export function SuperAdminDashboardPage() {
  const statsQuery = useCompanyStats()
  const activitiesQuery = useQuery({
    queryKey: queryKeys.activities.list({ scope: 'platform', limit: 8 }),
    queryFn: () => activitiesApi.list({ scope: 'platform', limit: 8 }),
  })
  const activityItems = useMemo(
    () => toRecentActivityItems(activitiesQuery.data?.activities ?? []),
    [activitiesQuery.data?.activities],
  )

  const statCards = useMemo(() => {
    if (!statsQuery.data) return []
    return toSuperAdminStatCards(companyStatsToStatCards(statsQuery.data))
  }, [statsQuery.data])

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <DashboardPageHeader
        title="Super Admin Dashboard"
        subtitle="Welcome back, Super Admin. Here's what's happening today."
      />

      <section
        className="mb-6 grid grid-cols-2 gap-2 md:gap-6 lg:grid-cols-4"
        aria-busy={statsQuery.isLoading}
        aria-label={statsQuery.isLoading ? 'Loading stats' : undefined}
      >
        {statsQuery.isLoading ? (
          <StatCardsRowSkeleton />
        ) : statsQuery.isError ? (
          <p className="col-span-full text-sm text-danger">Unable to load company stats.</p>
        ) : (
          statCards.map((card) => <DashboardStatCard key={card.id} data={card} />)
        )}
      </section>

      <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4 xl:grid-cols-5">
        <CompanyGrowthChart />
        <RevenueDonutChart />
      </section>

      <section className="mb-6">
        <RecentCompaniesTable />
      </section>

      <section>
        <PlatformActivityFeed items={activityItems} />
      </section>
    </div>
  )
}
