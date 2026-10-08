import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/model/AuthContext'
import { isCompanyHubEnabled } from '@/features/auth/model/companyHubs'
import { EmployeeLeavesTab } from '@/features/employees/ui/EmployeeLeavesTab'
import { EmployeeOverviewTab } from '@/features/employees/ui/EmployeeOverviewTab'
import { EmployeePerformanceTab } from '@/features/employees/ui/EmployeePerformanceTab'
import type { EmployeeDetailTab } from '@/features/employees/model/types'
import { usePerformanceSummary } from '@/features/performance/hooks/usePerformanceSummary'
import { useMemberProjects } from '@/features/projects/hooks/useProjects'
import { mapProjectToMemberProject } from '@/features/projects/lib/project-mappers'
import { useTeamMember } from '@/features/team/hooks/useTeam'
import {
  mapAuthUserToEmployeeForTeam,
  mapAuthUserToTeamDetail,
} from '@/features/team/lib/team-mappers'
import {
  getVisibleTeamMemberDetailTabs,
  TeamMemberDetailTabs,
} from '@/features/team/ui/TeamMemberDetailTabs'
import { TeamMemberProfileHeader } from '@/features/team/ui/TeamMemberProfileHeader'
import { TeamMemberProjectsTab } from '@/features/team/ui/TeamMemberProjectsTab'

export function TeamMemberDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { data: member, isLoading, isError } = useTeamMember(id)
  const canProjects = isCompanyHubEnabled(user?.enabledHubs, 'work')
  const { data: memberProjects = [], isLoading: projectsLoading } = useMemberProjects(
    canProjects ? member?.id : undefined,
  )
  const [activeTab, setActiveTab] = useState<EmployeeDetailTab>('overview')

  const { summary, loading: perfLoading, error: perfError } = usePerformanceSummary(
    member?.id,
    activeTab === 'performance' && !!member?.id,
  )

  useEffect(() => {
    setActiveTab('overview')
  }, [id])

  useEffect(() => {
    const visible = getVisibleTeamMemberDetailTabs(user?.enabledHubs)
    if (!visible.includes(activeTab)) setActiveTab('overview')
  }, [activeTab, user?.enabledHubs])

  if (isLoading) {
    return (
      <div className="p-8">
        <p className="text-sm text-text-muted">Loading team member…</p>
      </div>
    )
  }

  if (isError || !member) {
    return (
      <div className="p-8">
        <p className="font-semibold text-heading">Team member not found</p>
        <p className="mt-2 text-sm text-text-muted">
          This person may not report to you, or the link is invalid.
        </p>
        <Link to="/team" className="mt-4 inline-block text-sm text-primary">
          Back to Team
        </Link>
      </div>
    )
  }

  const detail = mapAuthUserToTeamDetail(member)
  const employee = mapAuthUserToEmployeeForTeam(member)
  const projects = memberProjects.map(mapProjectToMemberProject)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-[30px] font-bold leading-9 text-heading">Team Member</h1>
        <p className="mt-1 text-base leading-6 text-text-muted">
          View details for people who report to you
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#e4edf6] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06)]">
        <TeamMemberProfileHeader detail={detail} />
        <TeamMemberDetailTabs active={activeTab} onChange={setActiveTab} />
        {activeTab === 'overview' && <EmployeeOverviewTab employee={employee} />}
        {activeTab === 'projects' &&
          (projectsLoading ? (
            <div className="flex min-h-[240px] items-center justify-center p-12">
              <p className="text-sm text-text-muted">Loading projects…</p>
            </div>
          ) : (
            <TeamMemberProjectsTab projects={projects} />
          ))}
        {activeTab === 'leaves' && <EmployeeLeavesTab employeeId={member.id} />}
        {activeTab === 'performance' && (
          <EmployeePerformanceTab summary={summary} loading={perfLoading} error={perfError} />
        )}
      </div>
    </div>
  )
}
