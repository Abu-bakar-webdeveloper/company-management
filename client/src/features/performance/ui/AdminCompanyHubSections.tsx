import { Link } from 'react-router-dom'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import type { PerformanceRecord } from '@/features/performance/model/types'
import { primaryScoreLabel } from '@/features/performance/lib/performance-utils'
import { AvatarCircle, EyeIcon } from '@/features/performance/ui/icons'
import { PerformanceStatusBadge } from '@/features/performance/ui/PerformanceStatusBadge'
import { Card } from '@/shared/ui/Card'

type AdminCompanyHubSectionsProps = {
  topPerformers: PerformanceRecord[]
  atRisk: PerformanceRecord[]
}

export function AdminCompanyHubSections({
  topPerformers,
  atRisk,
}: AdminCompanyHubSectionsProps) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <PeopleDecisionCard
        title="Top performers"
        empty="No scored reviews yet"
        people={topPerformers}
        accent="good"
      />
      <PeopleDecisionCard
        title="Needs attention"
        empty="No at-risk people this period"
        people={atRisk}
        accent="risk"
      />
    </div>
  )
}

function PeopleDecisionCard({
  title,
  empty,
  people,
  accent,
}: {
  title: string
  empty: string
  people: PerformanceRecord[]
  accent: 'good' | 'risk'
}) {
  return (
    <Card className="flex min-h-[280px] flex-col p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-base font-bold text-heading sm:text-lg">{title}</h3>
        {people.length > 0 ? (
          <a href="#performance-list" className="text-xs font-semibold text-primary">
            View all
          </a>
        ) : null}
      </div>
      {people.length === 0 ? (
        <ComingSoonState
          className="flex-1"
          title={empty}
          description="People will show up here once performance reviews are available."
          minHeight="min-h-0"
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {people.map((person) => (
            <li key={person.employeeId} className="flex items-center gap-3">
              <AvatarCircle name={person.employeeName} avatar={person.employeeAvatar} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-heading">{person.employeeName}</p>
                <p className="truncate text-xs text-text-muted">
                  {person.department} · {person.role}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span
                  className={
                    accent === 'risk'
                      ? 'text-sm font-bold text-[#DC2626]'
                      : 'text-sm font-bold text-heading'
                  }
                >
                  {primaryScoreLabel({
                    finalAdjustedScore: person.finalAdjustedScore,
                    rating: person.rating,
                  })}
                </span>
                {person.status && <PerformanceStatusBadge status={person.status} />}
              </div>
              <Link
                to={`/performance/${person.employeeId}`}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-primary"
                aria-label={`View ${person.employeeName}`}
              >
                <EyeIcon />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
