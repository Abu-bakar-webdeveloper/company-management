import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { projectsApi } from '@/features/projects/api/projectsApi'
import type { Project } from '@/features/projects/model/types'
import { EditProjectForm } from '@/features/projects/ui/EditProjectForm'
import { FormCardSkeleton } from '@/shared/ui/DataSkeletons'

export function ProjectEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return <FormCardSkeleton />
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
      <div className="mx-auto">
        <EditProjectForm
          project={project}
          onCancel={() => navigate(`/projects/${project.id}`)}
          onSubmit={async (values) => {
            await projectsApi.update(project.id, values)
            toast.success('Project updated')
            navigate(`/projects/${project.id}`)
          }}
        />
      </div>
    </div>
  )
}
