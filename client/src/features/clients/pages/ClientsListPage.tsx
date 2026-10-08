import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/model/AuthContext'
import { canViewContractValue } from '@/features/auth/model/permissions'
import { clientsApi } from '@/features/clients/api/clientsApi'
import type { Client, ClientListFilters } from '@/features/clients/model/types'
import { ClientStatsRow } from '@/features/clients/ui/ClientStatsRow'
import { ClientsTable } from '@/features/clients/ui/ClientsTable'
import { ClientToolbar } from '@/features/clients/ui/ClientToolbar'
import { PlusIcon } from '@/features/clients/ui/icons'
import { getErrorMessage } from '@/shared/api/errors'
import { queryKeys } from '@/shared/api/queryKeys'
import { TableSkeleton } from '@/shared/ui/DataSkeletons'

const PAGE_SIZE = 20

const defaultFilters: ClientListFilters = {
  search: '',
  status: 'all',
}

export function ClientsListPage() {
  const { can, user } = useAuth()
  const canWrite = can('clients:write')
  const showContractValue = canViewContractValue(user?.role)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ClientListFilters>(defaultFilters)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const statsQuery = useQuery({
    queryKey: queryKeys.clients.stats(),
    queryFn: () => clientsApi.getStats(),
  })

  useEffect(() => {
    setPage(1)
  }, [filters])

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (clients.length === 0) setLoading(true)
      try {
        const listResult = await clientsApi.listPaginated({
          page,
          limit: PAGE_SIZE,
          search: filters.search.trim() || undefined,
          status: filters.status === 'all' ? undefined : filters.status,
        })
        if (cancelled) return
        setClients(listResult.clients)
        setTotal(listResult.pagination.total)
        setTotalPages(listResult.pagination.totalPages)
      } catch (error) {
        if (!cancelled) {
          toast.error(getErrorMessage(error, 'Unable to load clients'))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only reload on page/filters; clients.length gates skeleton
  }, [page, filters])

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        'Delete this client? Clients with active projects cannot be deleted.',
      )
    ) {
      return
    }
    setDeletingId(id)
    try {
      await clientsApi.remove(id)
      setClients((prev) => prev.filter((c) => c.id !== id))
      setTotal((prev) => Math.max(0, prev - 1))
      toast.success('Client deleted')
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          'Unable to delete this client. It may have active projects — mark it inactive instead.',
        ),
      )
    } finally {
      setDeletingId(null)
    }
  }

  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(page * PAGE_SIZE, total)
  const showSkeleton = loading
  const isFiltered = filters.search.trim() !== '' || filters.status !== 'all'
  const showToolbar = !loading && (isFiltered || total > 0)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-8 text-heading sm:text-[30px] sm:leading-9">
            Clients
          </h1>
          <p className="mt-1 text-sm leading-6 text-text-muted sm:text-base">
            Manage customer organizations and their projects
          </p>
        </div>
        {canWrite && (
          <Link
            to="/clients/new"
            className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95 sm:w-auto"
          >
            <PlusIcon />
            Add Client
          </Link>
        )}
      </header>

      {statsQuery.data ? (
        <ClientStatsRow stats={statsQuery.data} showContractValue={showContractValue} />
      ) : null}

      {showToolbar ? <ClientToolbar filters={filters} onChange={setFilters} /> : null}

      {showSkeleton ? (
        <TableSkeleton columns={showContractValue ? 6 : 5} rows={8} />
      ) : (
        <ClientsTable
          clients={clients}
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
          showContractValue={showContractValue}
        />
      )}
    </div>
  )
}
