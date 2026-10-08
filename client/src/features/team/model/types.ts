export type TeamMemberStatus = 'active' | 'on_leave' | 'inactive'

export type TeamMember = {
  id: string
  fullName: string
  email: string
  jobTitle: string
  status: TeamMemberStatus
  activeProjects: number
  performanceScore: number
  avatar?: string
}

export type TeamMemberProfile = {
  id: string
  fullName: string
  jobTitle: string
  department: string
  avatar?: string
  rating: number
  tasksCompleted: number
  taskGrowth: number
  attendance: number
  kpiScore: number
  progress: number
}

export type TeamAvailabilityStatus = 'present' | 'pending' | 'on_leave'

export type TeamAvailabilityRow = {
  id: string
  fullName: string
  avatar?: string
  role: string
  status: TeamAvailabilityStatus
  activeTasks: number
}

export type TeamMemberDetailTab = 'overview' | 'projects' | 'leaves' | 'performance'
