import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/model/AuthContext'
import { projectsApi } from '@/features/projects/api/projectsApi'
import type { Project, ProjectDetailTab } from '@/features/projects/model/types'
import { EditIcon } from '@/features/projects/ui/icons'
import { LayoutGridIcon } from '@/features/tasks/ui/boardIcons'
import { ProjectActivityFeed } from '@/features/projects/ui/ProjectActivityFeed'
import { ProjectFilesTab } from '@/features/projects/ui/ProjectFilesTab'
import { ProjectMilestonesTab } from '@/features/projects/ui/ProjectMilestonesTab'
import { ProjectOverviewTab } from '@/features/projects/ui/ProjectOverviewTab'
import { ProjectProfileHeader } from '@/features/projects/ui/ProjectProfileHeader'
import { ProjectTeamTab } from '@/features/projects/ui/ProjectTeamTab'
import { ProjectTimelineCard } from '@/features/projects/ui/ProjectTimelineCard'
import { Card } from '@/shared/ui/Card'
import { DetailCardSkeleton } from '@/shared/ui/DataSkeletons'

const DETAIL_TABS: ProjectDetailTab[] = ['overview', 'team', 'milestones', 'files']

function resolveTab(value: string | null): ProjectDetailTab {
  if (value && DETAIL_TABS.includes(value as ProjectDetailTab)) {
    return value as ProjectDetailTab
  }
  return 'overview'
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const { can } = useAuth()
  const canWrite = can('projects:write')
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ProjectDetailTab>(() =>
    resolveTab(searchParams.get('tab')),
  )

  useEffect(() => {
    setActiveTab(resolveTab(searchParams.get('tab')))
  }, [searchParams])

  useEffect(() => {
    if (!id) return
    void projectsApi
      .getById(id)
      .then((data) => {
        setProject(data)
      })
      .catch(() => {
        setProject(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id])

  const handleTabChange = (tab: ProjectDetailTab) => {
    setActiveTab(tab)
    const next = new URLSearchParams(searchParams)
    if (tab === 'overview') next.delete('tab')
    else next.set('tab', tab)
    setSearchParams(next, { replace: true })
  }

  if (loading) {
    return <DetailCardSkeleton />
  }

  if (!project) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="font-semibold text-heading">Project not found</p>
        <Link to="/projects" className="mt-4 inline-block text-sm text-primary">
          Back to Projects
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-end">
        <Link
          to={`/projects/${project.id}/board`}
          className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-surface px-5 text-sm font-semibold text-heading shadow-[var(--shadow-stat)] hover:bg-surface-muted"
        >
          <LayoutGridIcon className="size-4 text-primary" />
          Task Board
        </Link>
        {canWrite && (
          <Link
            to={`/projects/${project.id}/edit`}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95"
          >
            <EditIcon className="h-4 w-4 text-white" />
            Edit Project
          </Link>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="overflow-hidden">
          <ProjectProfileHeader
            project={project}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
          {activeTab === 'overview' && <ProjectOverviewTab project={project} />}
          {activeTab === 'team' && <ProjectTeamTab team={project.team} />}
          {activeTab === 'milestones' && (
            <ProjectMilestonesTab
              projectId={project.id}
              onProgressChange={(progress) =>
                setProject((prev) => (prev ? { ...prev, progress } : prev))
              }
            />
          )}
          {activeTab === 'files' && <ProjectFilesTab projectId={project.id} />}
        </Card>

        <div className="flex flex-col gap-6">
          <ProjectTimelineCard project={project} />
          <ProjectActivityFeed activities={[]} />
        </div>
      </div>
    </div>
  )
}
