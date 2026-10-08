import type { SubscriptionPlanTier } from '@/features/platform/model/types'
import { CheckIcon } from '@/features/platform/ui/icons'
import { cn } from '@/shared/lib/cn'

export function SubscriptionPlansGrid({ plans }: { plans: SubscriptionPlanTier[] }) {
  return (
    <section className="mb-6 rounded-2xl bg-surface-muted px-6 py-8 sm:px-8">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-heading">Subscription Plans</h2>
        <p className="mt-1 text-sm text-text-muted">Choose According to your need</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              'relative overflow-hidden rounded-xl bg-surface p-6 shadow-(--shadow-card)',
              'border-t-[5px]',
              plan.borderColor,
            )}
          >
            {plan.popular && (
              <span className="absolute right-4 top-4 rounded-full bg-[#1877F2] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                Most Popular
              </span>
            )}
            <h3 className={cn('text-lg font-bold text-heading', plan.popular && 'pr-24')}>
              {plan.name}
            </h3>
            <p className="mt-1 text-sm text-text-muted">{plan.subtitle}</p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="text-3xl font-bold leading-none text-heading">{plan.price}</span>
              {plan.pricePeriod && (
                <span className="text-sm font-normal text-text-muted">{plan.pricePeriod}</span>
              )}
            </div>
            <p className="mt-6 text-sm font-semibold text-heading">{plan.featureHeader}</p>
            <ul className="mt-4 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5 text-sm text-text-muted">
                  <CheckIcon className="size-4 shrink-0 text-[#1877F2]" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
