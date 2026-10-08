import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/model/AuthContext'
import { useClient } from '@/features/clients/hooks/useClients'
import { ClientForm } from '@/features/clients/ui/ClientForm'
import { FormCardSkeleton } from '@/shared/ui/DataSkeletons'

export function ClientEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { can } = useAuth()
  const { data: client, isLoading } = useClient(id)
  const canWrite = can('clients:write')

  if (isLoading) {
    return <FormCardSkeleton />
  }

  if (!client || !id) {
    return (
      <div className="p-8 text-center">
        <p className="text-heading">Client not found</p>
        <Link to="/clients" className="mt-2 inline-block text-sm text-primary">
          Back to clients
        </Link>
      </div>
    )
  }

  if (!canWrite) {
    navigate(`/clients/${id}`, { replace: true })
    return null
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto">
        <ClientForm
          title="Edit Client"
          subtitle={`Update profile for ${client.name}`}
          submitLabel="Save Changes"
          defaultValues={{
            name: client.name,
            email: client.email ?? '',
            phone: client.phone ?? '',
            website: client.website ?? '',
            industry: client.industry ?? '',
            address: {
              country: client.address?.country ?? '',
              city: client.address?.city ?? '',
              addressLine: client.address?.addressLine ?? '',
              postalCode: client.address?.postalCode ?? '',
            },
            primaryContact: {
              name: client.primaryContact?.name ?? '',
              email: client.primaryContact?.email ?? '',
              phone: client.primaryContact?.phone ?? '',
            },
            status: client.status,
            notes: client.notes ?? '',
          }}
          onCancel={() => navigate(`/clients/${id}`)}
          onSubmit={async (values) => {
            const { clientsApi } = await import('@/features/clients/api/clientsApi')
            await clientsApi.update(id, values)
            toast.success('Client updated')
            navigate(`/clients/${id}`)
          }}
        />
      </div>
    </div>
  )
}
