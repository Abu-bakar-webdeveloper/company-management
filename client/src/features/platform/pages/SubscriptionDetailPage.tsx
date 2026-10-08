import { Link, useParams } from 'react-router-dom'
import { getSubscriptionDetail } from '@/features/platform/model/subscriptionsData'
import { SubscriptionDetailSection } from '@/features/platform/ui/DetailOverviewGrid'
import { EditPenIcon } from '@/features/platform/ui/icons'

export function SubscriptionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const subscription = getSubscriptionDetail(id ?? '1')

  if (!subscription) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <p className="text-sm text-text-muted">Subscription not found.</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold leading-9 text-heading sm:text-[30px]">
            Subscription Details
          </h1>
          <p className="mt-1 text-base leading-6 text-text-muted">
            View and manage employee information
          </p>
        </div>
        <Link
          to={`/subscriptions/${subscription.id}/edit`}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95"
        >
          <EditPenIcon className="size-4 text-white" />
          Edit Plan
        </Link>
      </header>

      <SubscriptionDetailSection data={subscription} />
    </div>
  )
}
