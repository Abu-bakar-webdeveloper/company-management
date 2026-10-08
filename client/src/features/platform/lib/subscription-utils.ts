import type { Subscription, SubscriptionListFilters } from '@/features/platform/model/types'

export function filterSubscriptions(
  subscriptions: Subscription[],
  filters: SubscriptionListFilters,
): Subscription[] {
  const search = filters.search.trim().toLowerCase()

  return subscriptions.filter((sub) => {
    if (search) {
      const haystack = `${sub.companyName} ${sub.plan}`.toLowerCase()
      if (!haystack.includes(search)) return false
    }
    if (filters.rating !== 'all') {
      const minRating = Number(filters.rating)
      if (sub.rating < minRating) return false
    }
    if (filters.status !== 'all' && sub.status !== filters.status) return false
    return true
  })
}
