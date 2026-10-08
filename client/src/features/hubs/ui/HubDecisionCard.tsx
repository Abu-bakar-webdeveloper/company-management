import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { Card } from '@/shared/ui/Card'
import { UserAvatar } from '@/shared/ui/UserAvatar'

export type HubDecisionItem = {
  id: string
  title: string
  subtitle?: string
  meta?: string
  metaClass?: string
  badge?: ReactNode
  href?: string
  avatarName?: string
  avatarUrl?: string
}

type HubDecisionCardProps = {
  title: string
  empty: string
  emptyDescription?: string
  items: HubDecisionItem[]
  actionTo?: string
  actionLabel?: string
}

function EyeIcon() {
  return (
    <svg className="size-4" viewBox="0 0 20 14" fill="currentColor" aria-hidden>
      <path d="M10 0C5.5 0 1.73 2.79 0 7c1.73 4.21 5.5 7 10 7s8.27-2.79 10-7c-1.73-4.21-5.5-7-10-7Zm0 11.5A4.5 4.5 0 1 1 10 2.5a4.5 4.5 0 0 1 0 9ZM10 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
    </svg>
  )
}

export function HubDecisionCard({
  title,
  empty,
  emptyDescription = 'Items that need attention will show up here.',
  items,
  actionTo,
  actionLabel = 'View all',
}: HubDecisionCardProps) {
  return (
    <Card className="flex min-h-[260px] flex-col p-4 sm:min-h-[300px] sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-bold text-heading sm:text-lg">{title}</h3>
        {actionTo ? (
          <Link to={actionTo} className="text-xs font-semibold text-primary hover:opacity-90">
            {actionLabel}
          </Link>
        ) : null}
      </div>
      {items.length === 0 ? (
        <ComingSoonState
          className="flex-1"
          title={empty}
          description={emptyDescription}
          minHeight="min-h-0"
          compact
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:flex-nowrap"
            >
              {item.avatarName != null ? (
                <UserAvatar name={item.avatarName} avatar={item.avatarUrl} size="sm" />
              ) : null}
              <div className="min-w-0 flex-1 basis-[min(100%,12rem)]">
                <p className="truncate text-sm font-semibold text-heading">{item.title}</p>
                {item.subtitle ? (
                  <p className="truncate text-xs text-text-muted">{item.subtitle}</p>
                ) : null}
              </div>
              <div className="ml-auto flex shrink-0 items-center gap-2 sm:ml-0 sm:flex-col sm:items-end sm:gap-1">
                {item.meta ? (
                  <span className={item.metaClass ?? 'text-sm font-bold text-heading'}>
                    {item.meta}
                  </span>
                ) : null}
                {item.badge}
              </div>
              {item.href ? (
                <Link
                  to={item.href}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-primary"
                  aria-label={`View ${item.title}`}
                >
                  <EyeIcon />
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
