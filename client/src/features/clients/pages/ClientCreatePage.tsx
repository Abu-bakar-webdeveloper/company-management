import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { clientsApi } from '@/features/clients/api/clientsApi'
import { ClientForm } from '@/features/clients/ui/ClientForm'

export function ClientCreatePage() {
  const navigate = useNavigate()

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto">
        <ClientForm
          title="Add Client"
          subtitle="Create a customer profile for your projects"
          submitLabel="Create Client"
          onCancel={() => navigate('/clients')}
          onSubmit={async (values) => {
            const created = await clientsApi.create(values)
            toast.success('Client created')
            navigate(`/clients/${created.id}`)
          }}
        />
      </div>
    </div>
  )
}
