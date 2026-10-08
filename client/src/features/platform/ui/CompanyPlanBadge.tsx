import type { CompanyPlan } from '@/features/platform/model/types'
import { planDotColors, planLabels } from '@/features/platform/model/companiesData'
import { cn } from '@/shared/lib/cn'

export function CompanyPlanBadge({ plan }: { plan: CompanyPlan }) {
  return (
    <span className="inline-flex items-center gap-2 text-text-muted">
      <span className={cn('size-2 rounded-full', planDotColors[plan])} />
      {planLabels[plan]}
    </span>
  )
}
