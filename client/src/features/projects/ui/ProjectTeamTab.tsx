import type { ProjectTeamMember } from '@/features/projects/model/types'
import { AvatarCircle } from '@/features/projects/ui/icons'
import { Card } from '@/shared/ui/Card'

export function ProjectTeamTab({ team }: { team: ProjectTeamMember[] }) {
  return (
    <div className="grid gap-4 p-6 sm:grid-cols-2">
      {team.map((member) => (
        <Card key={member.id} className="flex items-center gap-4 px-5 py-2">
          <AvatarCircle name={member.name} avatar={member.avatar} className="size-12" />
          <div>
            <p className="font-bold text-heading">{member.name}</p>
            <p className="text-xs font-medium text-text-muted">{member.jobTitle}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}
