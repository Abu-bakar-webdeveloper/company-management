import { Link } from 'react-router-dom'
import type { TeamMemberProfile } from '@/features/team/model/types'
import { BuildingIcon } from '@/features/performance/ui/icons'
import { Card } from '@/shared/ui/Card'

type TeamMemberProfileCardProps = {
  member: TeamMemberProfile
}

export function TeamMemberProfileCard({ member }: TeamMemberProfileCardProps) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-[var(--shadow-card)]">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <Link to={`/team/${member.id}`} className="shrink-0">
            <img
              src={member.avatar}
              alt=""
              className="size-[72px] rounded-xl object-cover"
            />
          </Link>
          <div className="min-w-0 flex-1">
            <Link to={`/team/${member.id}`} className="block">
              <h3 className="truncate text-base font-bold text-heading">{member.fullName}</h3>
              <p className="mt-0.5 truncate text-sm font-medium text-primary">{member.jobTitle}</p>
              <p className="mt-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                <BuildingIcon className="shrink-0 text-text-muted" />
                <span className="truncate">{member.department}</span>
              </p>
            </Link>
            <p className="mt-2 text-xs text-text-muted">
              Attendance{' '}
              <span className="font-semibold text-heading">{member.attendance}%</span>
              {' · '}
              <Link
                to={`/attendance/${member.id}`}
                className="font-semibold text-primary hover:underline"
              >
                View
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className="h-1 bg-primary" />
    </Card>
  )
}
