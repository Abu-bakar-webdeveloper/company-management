import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { Card } from '@/shared/ui/Card'
import { StarIcon } from '@/features/dashboard/ui/icons'
import { UserAvatar } from '@/shared/ui/UserAvatar'

type Performer = {
  id: string
  name: string
  score: number
  avatar: string
}

type TopPerformersCardProps = {
  title?: string
  performers?: Performer[]
  kpiScore?: string
}

export function TopPerformersCard({
  title = 'Top Team Performers',
  performers = [],
  kpiScore,
}: TopPerformersCardProps) {
  const hasPerformers = performers.length > 0

  return (
    <Card className="flex min-h-[334px] flex-col p-[25px]">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h3 className="text-[24px] font-semibold leading-6 text-heading">{title}</h3>
        {hasPerformers && kpiScore ? (
          <span className="shrink-0 rounded-full bg-[#eff6ff] px-3 py-1 text-sm font-semibold text-[#1877f2]">
            KPI Score: {kpiScore}
          </span>
        ) : null}
      </div>

      {!hasPerformers ? (
        <ComingSoonState
          className="flex-1"
          title="No performers yet"
          description="Top performers will show up here once reviews are available."
          minHeight="min-h-0"
        />
      ) : (
        <ul className="flex flex-col gap-5">
          {performers.map((person) => (
            <li
              key={person.id}
              className="flex items-center bg-border-card justify-between gap-4 p-2 rounded-2xl hover:bg-border-card/50 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <UserAvatar name={person.name} avatar={person.avatar || undefined} size="sm" />
                <span className="text-sm font-bold text-heading">{person.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-base font-semibold text-[#1877f2]">{person.score}</span>
                <StarIcon className="size-3.5 text-[#fbbf24]" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
