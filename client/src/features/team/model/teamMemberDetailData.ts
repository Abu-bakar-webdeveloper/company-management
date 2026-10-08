import type { EmployeeDepartment, EmployeeStatus } from '@/features/employees/model/types'
import type { TeamMember } from '@/features/team/model/types'

export type TeamMemberDetail = Omit<TeamMember, 'status'> & {
  phone: string
  department: EmployeeDepartment
  joinDate: string
  status: EmployeeStatus
}

export type TeamMemberProject = {
  id: string
  title: string
  description: string
  status: 'in_progress' | 'completed' | 'delayed'
}
