import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { activitiesApi } from '@/features/notifications/api/activitiesApi'
import { SettingsCategoryGrid } from '@/features/settings/ui/SettingsCategoryGrid'
import { RecentActivityTable } from '@/features/settings/ui/RecentActivityTable'
import { queryKeys } from '@/shared/api/queryKeys'

const PAGE_SIZE = 10

export function SettingsPage() {
  const [page, setPage] = useState(1)

  const activitiesQuery = useQuery({
    queryKey: queryKeys.activities.list({ scope: 'company', page, limit: PAGE_SIZE }),
    queryFn: () => activitiesApi.list({ scope: 'company', page, limit: PAGE_SIZE }),
  })

  const pagination = activitiesQuery.data?.pagination
  const activities = activitiesQuery.data?.activities ?? []
  const total = pagination?.total ?? 0
  const totalPages = pagination?.totalPages ?? 1
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(page * PAGE_SIZE, total)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-[28px] font-bold leading-9 text-heading sm:text-[30px]">Settings</h1>
        <p className="mt-1 text-base leading-6 text-text-muted">
          Manage system configuration &amp; preferences.
        </p>
      </header>

      <SettingsCategoryGrid />

      {activitiesQuery.isLoading ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-border-card bg-surface">
          <p className="text-sm text-text-muted">Loading activity…</p>
        </div>
      ) : (
        <RecentActivityTable
          activities={activities}
          page={page}
          total={total}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
