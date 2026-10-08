import { useEffect, useMemo, useState } from 'react'
import { toSuperAdminStatCards } from '@/features/dashboard/superadmin/lib/superadminStatCards'
import { DashboardPageHeader } from '@/features/dashboard/ui/DashboardPageHeader'
import { DashboardStatCard } from '@/features/dashboard/ui/DashboardStatCard'
import {useCompaniesList, useCompanyStats, useUpdateCompanyStatus } from '@/features/platform/hooks/useCompanies'
import {companyStatsToStatCards, mapCompanyRow, toListCompaniesParams} from '@/features/platform/lib/company-utils'
import type { Company, CompanyListFilters } from '@/features/platform/model/types'
import { CompaniesTable } from '@/features/platform/ui/CompaniesTable'
import { CompaniesTableSkeleton } from '@/features/platform/ui/CompaniesTableSkeleton'
import { CompaniesToolbar } from '@/features/platform/ui/CompaniesToolbar'
import { DashboardStatCardSkeleton } from '@/features/dashboard/ui/DashboardStatCardSkeleton'
import { getErrorMessage } from '@/shared/api/errors'

const PAGE_SIZE = 4

const defaultFilters: CompanyListFilters = {
  search: '',
  rating: 'all',
  status: 'all',
}

export function CompaniesPage() {
  const [draftFilters, setDraftFilters] = useState<CompanyListFilters>(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState<CompanyListFilters>(defaultFilters)
  const [page, setPage] = useState(1)

  const listParams = useMemo(
    () => toListCompaniesParams(appliedFilters, page, PAGE_SIZE),
    [appliedFilters, page],
  )

  const companiesQuery = useCompaniesList(listParams)
  const statsQuery = useCompanyStats()
  const updateStatus = useUpdateCompanyStatus()
  const [statusActionId, setStatusActionId] = useState<string | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)

  const statCards = useMemo(() => {
    if (!statsQuery.data) return []
    return toSuperAdminStatCards(companyStatsToStatCards(statsQuery.data))
  }, [statsQuery.data])

  const companies = useMemo(
    () => (companiesQuery.data?.companies ?? []).map(mapCompanyRow),
    [companiesQuery.data?.companies],
  )

  const pagination = companiesQuery.data?.pagination

  useEffect(() => {
    setPage(1)
  }, [appliedFilters])

  const listError = companiesQuery.isError
    ? getErrorMessage(companiesQuery.error, 'Failed to load companies.')
    : null

  const isFiltered =
    appliedFilters.search.trim() !== '' ||
    appliedFilters.rating !== 'all' ||
    appliedFilters.status !== 'all'
  const showToolbar =
    !companiesQuery.isLoading && (isFiltered || (pagination?.total ?? 0) > 0)

  const handleStatusChange = async (company: Company, status: 'active' | 'inactive') => {
    const label = status === 'inactive' ? 'suspend' : 'reactivate'
    if (
      !window.confirm(
        status === 'inactive'
          ? `Suspend ${company.name}? Users will lose access until reactivated.`
          : `Reactivate ${company.name}?`,
      )
    ) {
      return
    }

    setStatusError(null)
    setStatusActionId(company.id)
    try {
      await updateStatus.mutateAsync({ id: company.id, status })
    } catch (error) {
      setStatusError(getErrorMessage(error, `Unable to ${label} company.`))
    } finally {
      setStatusActionId(null)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <DashboardPageHeader
        title="Companies"
        subtitle="Manage organizations, subscriptions, and assigned administrators."
      />

      <section className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {statsQuery.isLoading
          ? Array.from({ length: 4 }, (_, i) => <DashboardStatCardSkeleton key={i} />)
          : statCards.map((card) => <DashboardStatCard key={card.id} data={card} />)}
      </section>

      {showToolbar ? (
        <CompaniesToolbar
          filters={draftFilters}
          onChange={setDraftFilters}
          onReset={() => {
            setDraftFilters(defaultFilters)
            setAppliedFilters(defaultFilters)
          }}
          onApply={() => setAppliedFilters(draftFilters)}
        />
      ) : null}

      <section className="mb-6">
        {listError && (
          <p className="mb-4 rounded-lg bg-[#fef2f2] px-4 py-3 text-sm text-danger">{listError}</p>
        )}
        {statusError && (
          <p className="mb-4 rounded-lg bg-[#fef2f2] px-4 py-3 text-sm text-danger">{statusError}</p>
        )}
        {companiesQuery.isLoading ? (
          <CompaniesTableSkeleton rows={PAGE_SIZE} />
        ) : (
          <CompaniesTable
            companies={companies}
            title="All Companies"
            page={pagination?.page ?? 1}
            total={pagination?.total ?? 0}
            rangeStart={
              pagination && pagination.total > 0
                ? (pagination.page - 1) * pagination.limit + 1
                : 0
            }
            rangeEnd={
              pagination && pagination.total > 0
                ? Math.min(pagination.page * pagination.limit, pagination.total)
                : 0
            }
            totalPages={pagination?.totalPages ?? 1}
            onPageChange={setPage}
            onSuspend={(company) => void handleStatusChange(company, 'inactive')}
            onReactivate={(company) => void handleStatusChange(company, 'active')}
            statusActionPendingId={statusActionId}
            isFiltered={isFiltered}
          />
        )}
      </section>
    </div>
  )
}
