export type ProjectStatus = 'in_progress' | 'completed' | 'delayed'

export type ProjectPriority = 'low' | 'medium' | 'high'

export type ProjectSource =
  | 'referral'
  | 'website'
  | 'rfp'
  | 'existing_client'
  | 'partner'
  | 'other'

export type ProjectDetailTab = 'overview' | 'team' | 'milestones' | 'files'

export type TaskStatus = 'pending' | 'in_progress' | 'completed'

export type ProjectTeamMember = {
  id: string
  name: string
  jobTitle: string
  avatar?: string
}

export type ProjectTask = {
  id: string
  title: string
  dueDate: string
  status: TaskStatus
}

export type ProjectActivity = {
  id: string
  actor: string
  action: string
  target?: string
  timestamp: string
}

export type Project = {
  id: string
  projectCode: string
  name: string
  description: string
  managerId: string
  managerName: string
  managerAvatar?: string
  team: ProjectTeamMember[]
  clientId?: string
  clientName?: string
  clientCode?: string
  source?: ProjectSource
  sourceNote?: string
  contractValue?: number
  startDate: string
  endDate: string
  status: ProjectStatus
  priority: ProjectPriority
  progress: number
  image?: string
}

export type ProjectPayload = Omit<Project, 'id' | 'projectCode' | 'progress' | 'team'> & {
  projectCode?: string
  teamMemberIds?: string[]
}

export type ProjectListFilters = {
  search: string
  status: ProjectStatus | 'all'
  clientId: string | 'all'
}

export type ProjectStats = {
  total: number
  completed: number
  inProgress: number
  delayed: number
}
