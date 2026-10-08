import type { AuthUser } from '@/features/auth/model/types'
import { mapAuthUserToEmployee } from '@/features/employees/lib/employee-mappers'
import type { Employee } from '@/features/employees/model/types'
import type { TeamMember, TeamMemberProfile } from '@/features/team/model/types'
import type { TeamMemberDetail } from '@/features/team/model/teamMemberDetailData'

function roleLabel(user: AuthUser): string {
  return user.customRoleName ?? (user.role === 'employee' ? 'Employee' : user.role)
}

function jobTitleOf(user: AuthUser): string {
  const title = user.jobTitle?.trim()
  if (title) return title
  return roleLabel(user)
}

export function mapAuthUserToTeamMember(user: AuthUser): TeamMember {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    jobTitle: jobTitleOf(user),
    status: user.status === 'pending' ? 'inactive' : 'active',
    activeProjects: 0,
    performanceScore: 0,
    avatar: user.avatar,
  }
}

export function mapAuthUserToTeamProfile(
  user: AuthUser,
  attendance?: number,
): TeamMemberProfile {
  return {
    id: user.id,
    fullName: user.fullName,
    jobTitle: jobTitleOf(user),
    department: user.department ?? '—',
    avatar: user.avatar,
    rating: 0,
    tasksCompleted: 0,
    taskGrowth: 0,
    attendance: attendance ?? 0,
    kpiScore: 0,
    progress: 0,
  }
}

export function mapAuthUserToTeamDetail(user: AuthUser): TeamMemberDetail {
  const member = mapAuthUserToTeamMember(user)
  const employee = mapAuthUserToEmployee(user)

  return {
    ...member,
    phone: user.phone ?? '—',
    department: employee.department,
    joinDate: user.joinDate ?? new Date().toISOString(),
    status: employee.status,
  }
}

export function mapAuthUserToEmployeeForTeam(user: AuthUser): Employee {
  return mapAuthUserToEmployee(user)
}

export function buildTeamStatCards(members: AuthUser[]) {
  const total = members.length
  const active = members.filter((m) => m.status === 'active').length
  const pending = members.filter((m) => m.status === 'pending').length

  return [
    {
      id: 'members',
      label: 'Team Members',
      value: String(total),
      icon: 'employees' as const,
    },
    {
      id: 'active',
      label: 'Active',
      value: String(active),
      icon: 'present' as const,
    },
    {
      id: 'pending',
      label: 'Pending',
      value: String(pending),
      icon: 'leave' as const,
    },
  ]
}
