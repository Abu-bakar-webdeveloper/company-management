import { useAuth } from '@/features/auth/model/AuthContext'
import { MetricStatCard } from '@/features/dashboard/ui/MetricStatCard'
import { useTeamMembers } from '@/features/team/hooks/useTeam'
import {
  buildTeamStatCards,
  mapAuthUserToTeamMember,
  mapAuthUserToTeamProfile,
} from '@/features/team/lib/team-mappers'
import {
  OnLeaveIcon,
  PresentTodayIcon,
  TeamMembersIcon,
} from '@/features/team/ui/icons'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { TeamMemberProfileCard } from '@/features/team/ui/TeamMemberProfileCard'
import { TeamTable } from '@/features/team/ui/TeamTable'
import { Card } from '@/shared/ui/Card'

const iconMap = {
  employees: TeamMembersIcon,
  present: PresentTodayIcon,
  leave: OnLeaveIcon,
} as const

const cardStyles = {
  employees: {
    badge: 'Direct reports',
    badgeTone: 'info' as const,
    iconBg: 'bg-[#EFF6FF]',
    iconColor: 'text-[#1877f2]',
    border: 'border-[#E4EDF6]',
  },
  present: {
    badge: 'Can sign in',
    badgeTone: 'success' as const,
    iconBg: 'bg-[#ECFDF5]',
    iconColor: 'text-[#10B981]',
    border: 'border-[#D1FAE5]',
  },
  leave: {
    badge: 'Invite pending',
    badgeTone: 'warning' as const,
    iconBg: 'bg-[#FFF7ED]',
    iconColor: 'text-[#F97316]',
    border: 'border-[#FED7AA]',
  },
}

export function TeamListPage() {
  const { user } = useAuth()
  const { data, isLoading, isError } = useTeamMembers()
  const members = data?.members ?? []
  const attendanceById = data?.attendanceById ?? {}
  const firstName = user?.fullName.split(' ')[0] ?? 'Manager'

  const roster = members.map(mapAuthUserToTeamMember)
  const profiles = members.map((m) =>
    mapAuthUserToTeamProfile(m, attendanceById[m.id]),
  )
  const stats = buildTeamStatCards(members)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold leading-8 text-heading sm:text-[30px] sm:leading-9">
          My Team
        </h1>
        <p className="mt-1 text-sm leading-6 text-text-muted sm:text-base">
          Welcome back, {firstName}. People who report to you appear here.
        </p>
      </header>

      {isLoading && (
        <p className="text-sm text-text-muted">Loading your team…</p>
      )}

      {isError && (
        <Card className="p-6">
          <p className="font-semibold text-heading">Unable to load your team</p>
          <p className="mt-1 text-sm text-text-muted">Please try again in a moment.</p>
        </Card>
      )}

      {!isLoading && !isError && members.length === 0 && (
        <Card className="p-4 sm:p-6">
          <ComingSoonState
            title="No one reports to you yet"
            description="Ask Admin or HR to set you as someone's manager when they create or edit that employee. Cross-project collaborators are added on Projects, not here."
            minHeight="min-h-[280px]"
          />
        </Card>
      )}

      {!isLoading && !isError && members.length > 0 && (
        <>
          <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => {
              const Icon = iconMap[stat.icon]
              const style = cardStyles[stat.icon]
              return (
                <MetricStatCard
                  key={stat.id}
                  data={{
                    id: stat.id,
                    label: stat.label,
                    value: stat.value,
                    badge: style.badge,
                    badgeTone: style.badgeTone,
                    icon: <Icon />,
                    iconBg: style.iconBg,
                    iconColor: style.iconColor,
                    border: style.border,
                  }}
                />
              )
            })}
          </section>

          <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {profiles.map((member) => (
              <TeamMemberProfileCard key={member.id} member={member} />
            ))}
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold text-heading">Roster</h2>
            <TeamTable members={roster} />
          </section>

          <p className="mt-6 text-sm text-text-muted">
            Need someone on your team permanently? Ask Admin/HR to assign you as their manager.
            For project work, add people on the project instead.
          </p>
        </>
      )}
    </div>
  )
}
