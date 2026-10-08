import { useNavigate } from 'react-router-dom'
import { useCreateCompany } from '@/features/platform/hooks/useCompanies'
import { AddCompanyForm } from '@/features/platform/ui/AddCompanyForm'

export function AddCompanyPage() {
  const navigate = useNavigate()
  const createCompany = useCreateCompany()

  return (
    <div className="p-8">
      <AddCompanyForm
        onCancel={() => navigate('/companies')}
        onSubmit={async (values) => {
          const result = await createCompany.mutateAsync(values)
          navigate(`/companies/${result.company.id}`)
        }}
      />
    </div>
  )
}
