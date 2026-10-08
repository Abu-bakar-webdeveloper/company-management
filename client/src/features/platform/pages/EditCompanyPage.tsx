import { useParams } from 'react-router-dom'
import { useCompanyApi } from '@/features/platform/hooks/useCompanies'
import { mapApiCompanyToEditForm } from '@/features/platform/lib/company-utils'
import { EditCompanyForm } from '@/features/platform/ui/EditCompanyForm'
import { ApiError, getErrorMessage } from '@/shared/api/errors'

export function EditCompanyPage() {
  const { id } = useParams<{ id: string }>()
  const companyQuery = useCompanyApi(id)

  if (companyQuery.isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <p className="text-sm text-text-muted">Loading company…</p>
      </div>
    )
  }

  if (companyQuery.isError) {
    const isNotFound =
      companyQuery.error instanceof ApiError && companyQuery.error.status === 404

    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <p className="text-sm text-text-muted">
          {isNotFound
            ? 'Company not found.'
            : getErrorMessage(companyQuery.error, 'Failed to load company.')}
        </p>
      </div>
    )
  }

  const company = companyQuery.data
  if (!company) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <p className="text-sm text-text-muted">Company not found.</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <EditCompanyForm
        companyId={company.id}
        adminEmail={company.admin.email}
        defaultValues={mapApiCompanyToEditForm(company)}
      />
    </div>
  )
}
