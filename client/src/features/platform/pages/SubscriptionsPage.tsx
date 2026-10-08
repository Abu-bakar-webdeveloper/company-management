import { useEffect, useMemo, useState } from 'react'
import { toSuperAdminStatCards } from '@/features/dashboard/superadmin/lib/superadminStatCards'
import { DashboardPageHeader } from '@/features/dashboard/ui/DashboardPageHeader'
import { DashboardStatCard } from '@/features/dashboard/ui/DashboardStatCard'
import { PlatformActivityFeed } from '@/features/dashboard/ui/PlatformActivityFeed'
import { filterSubscriptions } from '@/features/platform/lib/subscription-utils'
import type { SubscriptionListFilters } from '@/features/platform/model/types'
import {
  mockSubscriptions,
  subscriptionPlans,
  subscriptionsPageStatCards,
  subscriptionsPlatformActivities,
} from '@/features/platform/model/subscriptionsData'
import { SubscriptionPlansGrid } from '@/features/platform/ui/SubscriptionPlansGrid'
import { SubscriptionsTable } from '@/features/platform/ui/SubscriptionsTable'
import { SubscriptionsToolbar } from '@/features/platform/ui/SubscriptionsToolbar'
import { paginate } from '@/shared/lib/pagination'

const PAGE_SIZE = 4

const defaultFilters: SubscriptionListFilters = {
  search: '',
  rating: 'all',
  status: 'all',
}

export function SubscriptionsPage() {
  const [draftFilters, setDraftFilters] = useState<SubscriptionListFilters>(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState<SubscriptionListFilters>(defaultFilters)
  const [page, setPage] = useState(1)

  const statCards = useMemo(() => toSuperAdminStatCards(subscriptionsPageStatCards), [])

  useEffect(() => {
    setPage(1)
  }, [appliedFilters])

  const filtered = useMemo(
    () => filterSubscriptions(mockSubscriptions, appliedFilters),
    [appliedFilters],
  )

  const pagination = useMemo(() => paginate(filtered, page, PAGE_SIZE), [filtered, page])

  const isFiltered =
    appliedFilters.search.trim() !== '' ||
    appliedFilters.rating !== 'all' ||
    appliedFilters.status !== 'all'
  const showToolbar = isFiltered || pagination.total > 0

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <DashboardPageHeader
        title="Subscriptions"
        subtitle="Manage organizations, subscriptions, and assigned administrators."
      />

      <section className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <DashboardStatCard key={card.id} data={card} />
        ))}
      </section>

      <SubscriptionPlansGrid plans={subscriptionPlans} />

      {showToolbar ? (
        <SubscriptionsToolbar
          filters={draftFilters}
          onChange={setDraftFilters}
          onReset={() => {
            setDraftFilters(defaultFilters)
            setAppliedFilters(defaultFilters)
          }}
          onApply={() => setAppliedFilters(draftFilters)}
        />
      ) : null}

      <section className="mb-6">
        <SubscriptionsTable
          subscriptions={pagination.items}
          page={pagination.currentPage}
          total={pagination.total}
          rangeStart={pagination.start}
          rangeEnd={pagination.end}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
          isFiltered={isFiltered}
        />
      </section>

      <section>
        <PlatformActivityFeed items={subscriptionsPlatformActivities} title="Platform Activity" />
      </section>
    </div>
  )
}
