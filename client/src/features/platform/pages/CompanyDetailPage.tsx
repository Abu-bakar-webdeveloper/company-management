import { Link, useParams } from 'react-router-dom'
import { useCompany } from '@/features/platform/hooks/useCompanies'
import { CompanyAdminInviteCard } from '@/features/platform/ui/CompanyAdminInviteCard'
import {
  CompanyProfileCard,
  DetailOverviewGrid,
} from '@/features/platform/ui/DetailOverviewGrid'
import { EditPenIcon } from '@/features/platform/ui/icons'
import { ApiError, getErrorMessage } from '@/shared/api/errors'
import { Card } from '@/shared/ui/Card'

export function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const companyQuery = useCompany(id)

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
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold leading-9 text-heading sm:text-[30px]">Company Details</h1>
          <p className="mt-1 text-base leading-6 text-text-muted">
            View and manage company information
          </p>
        </div>
        <Link
          to={`/companies/${company.id}/edit`}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95"
        >
          <EditPenIcon className="size-4 text-white" />
          Edit Company
        </Link>
      </header>

      <CompanyAdminInviteCard company={company} />

      <Card className="overflow-hidden">
        <CompanyProfileCard data={company} embedded withTabs />

        <div className="p-4 sm:p-6">
          <DetailOverviewGrid data={company} />
        </div>
      </Card>
    </div>
  )
}
