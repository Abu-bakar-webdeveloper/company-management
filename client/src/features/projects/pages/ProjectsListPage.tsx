import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/model/AuthContext'
import { projectsApi } from '@/features/projects/api/projectsApi'
import type { Project, ProjectListFilters, ProjectStats } from '@/features/projects/model/types'
import { PlusIcon } from '@/features/projects/ui/icons'
import { ProjectStatsRow } from '@/features/projects/ui/ProjectStatsRow'
import { ProjectToolbar } from '@/features/projects/ui/ProjectToolbar'
import { ProjectsTable } from '@/features/projects/ui/ProjectsTable'
import { getErrorMessage } from '@/shared/api/errors'
import { TableSkeleton } from '@/shared/ui/DataSkeletons'
import { Skeleton } from '@/shared/ui/Skeleton'

const PAGE_SIZE = 20

const defaultFilters: ProjectListFilters = {
  search: '',
  status: 'all',
  clientId: 'all',
}

const emptyStats: ProjectStats = { total: 0, completed: 0, inProgress: 0, delayed: 0 }

export function ProjectsListPage() {
  const { can } = useAuth()
  const canWrite = can('projects:write')
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<ProjectStats>(emptyStats)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ProjectListFilters>(defaultFilters)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [statsLoaded, setStatsLoaded] = useState(false)

  useEffect(() => {
    setPage(1)
  }, [filters])

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (projects.length === 0) setLoading(true)
      try {
        const [listResult, statsData] = await Promise.all([
          projectsApi.listPaginated({
            page,
            limit: PAGE_SIZE,
            search: filters.search.trim() || undefined,
            status: filters.status === 'all' ? undefined : filters.status,
            clientId: filters.clientId === 'all' ? undefined : filters.clientId,
          }),
          projectsApi.getStats(),
        ])
        if (cancelled) return
        setProjects(listResult.projects)
        setTotal(listResult.pagination.total)
        setTotalPages(listResult.pagination.totalPages)
        setStats(statsData)
        setStatsLoaded(true)
      } catch (error) {
        if (!cancelled) {
          toast.error(getErrorMessage(error, 'Unable to load projects'))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- skeleton gated by projects.length
  }, [page, filters])

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        'This permanently removes this project, its board columns, tasks, and milestones. This cannot be undone. Delete this project?',
      )
    ) {
      return
    }
    setDeletingId(id)
    try {
      await projectsApi.remove(id)
      setProjects((prev) => prev.filter((p) => p.id !== id))
      setTotal((prev) => Math.max(0, prev - 1))
      toast.success('Project deleted')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to delete project'))
    } finally {
      setDeletingId(null)
    }
  }

  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(page * PAGE_SIZE, total)
  const showSkeleton = loading
  const isFiltered =
    filters.search.trim() !== '' ||
    filters.status !== 'all' ||
    filters.clientId !== 'all'
  const showToolbar = !loading && (isFiltered || total > 0)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-8 text-heading sm:text-[30px] sm:leading-9">
            {canWrite ? 'Projects' : 'My Projects'}
          </h1>
          <p className="mt-1 text-sm leading-6 text-text-muted sm:text-base">
            {canWrite
              ? "Manage and track your team's projects"
              : 'Projects you manage or are assigned to'}
          </p>
        </div>
        {canWrite && (
          <Link
            to="/projects/new"
            className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95 sm:w-auto"
          >
            <PlusIcon />
            Create Project
          </Link>
        )}
      </header>

      {!statsLoaded ? (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border-card bg-surface p-5 shadow-[var(--shadow-stat)]"
            >
              <Skeleton className="mb-2 h-3 w-20" rounded="sm" />
              <Skeleton className="h-7 w-12" rounded="md" />
            </div>
          ))}
        </div>
      ) : (
        <ProjectStatsRow stats={stats} />
      )}

      {showToolbar ? <ProjectToolbar filters={filters} onChange={setFilters} /> : null}

      {showSkeleton ? (
        <TableSkeleton columns={7} rows={8} />
      ) : (
        <ProjectsTable
          projects={projects}
          page={page}
          total={total}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          totalPages={totalPages}
          onPageChange={setPage}
          onDelete={canWrite ? handleDelete : undefined}
          canWrite={canWrite}
          deletingId={deletingId}
          isFiltered={isFiltered}
        />
      )}
    </div>
  )
}
