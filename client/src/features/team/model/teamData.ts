import type { TeamMember } from '@/features/team/model/types'

export const teamStatusLabels: Record<TeamMember['status'], string> = {
  active: 'Active',
  on_leave: 'On Leave',
  inactive: 'Inactive',
}
