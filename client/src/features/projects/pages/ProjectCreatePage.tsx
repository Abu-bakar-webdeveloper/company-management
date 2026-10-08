import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { projectsApi } from '@/features/projects/api/projectsApi'
import { CreateProjectForm } from '@/features/projects/ui/CreateProjectForm'

export function ProjectCreatePage() {
  const navigate = useNavigate()

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto ">
        <CreateProjectForm
          onCancel={() => navigate('/projects')}
          onSubmit={async (values) => {
            const created = await projectsApi.create(values)
            toast.success('Project created')
            navigate(`/projects/${created.id}`)
          }}
        />
      </div>
    </div>
  )
}
