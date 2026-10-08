import { useParams } from 'react-router-dom'
import { getSubscriptionDetail } from '@/features/platform/model/subscriptionsData'
import { EditSubscriptionForm } from '@/features/platform/ui/EditSubscriptionForm'

export function EditSubscriptionPage() {
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
      <EditSubscriptionForm data={subscription} />
    </div>
  )
}
