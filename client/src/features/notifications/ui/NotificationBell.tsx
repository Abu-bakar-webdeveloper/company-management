import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { BellIcon } from '@/app/shell/icons'
import { useAuth } from '@/features/auth/model/AuthContext'
import { notificationsApi } from '@/features/notifications/api/notificationsApi'
import {
  formatRelativeTime,
  notificationHref,
} from '@/features/notifications/lib/notification-utils'
import { queryKeys } from '@/shared/api/queryKeys'
import { cn } from '@/shared/lib/cn'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()

  const listQuery = useQuery({
    queryKey: queryKeys.notifications.list({ limit: 10 }),
    queryFn: () => notificationsApi.list({ page: 1, limit: 10 }),
    enabled: isAuthenticated && open,
  })

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
    },
  })

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
    },
  })

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  const notifications = listQuery.data?.notifications ?? []
  const unreadCount = notifications.filter((item) => !item.readAt).length

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        className="relative flex size-9 items-center justify-center rounded-lg hover:bg-surface-muted"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 size-2 rounded-full bg-danger" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,360px)] overflow-hidden rounded-xl border border-border-card bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-border-card px-4 py-3">
            <p className="text-sm font-semibold text-heading">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                className="text-xs font-semibold text-primary hover:opacity-90"
                onClick={() => markAllMutation.mutate()}
                disabled={markAllMutation.isPending}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {listQuery.isLoading ? (
              <p className="px-4 py-8 text-center text-sm text-text-muted">Loading…</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-text-muted">
                No notifications yet.
              </p>
            ) : (
              <ul>
                {notifications.map((item) => (
                  <li key={item.id} className="border-b border-border-card last:border-0">
                    <Link
                      to={notificationHref(item)}
                      className={cn(
                        'block px-4 py-3 transition-colors hover:bg-surface-muted',
                        !item.readAt && 'bg-[#F8FAFC]',
                      )}
                      onClick={() => {
                        if (!item.readAt) markReadMutation.mutate(item.id)
                        setOpen(false)
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-heading">{item.title}</p>
                          <p className="mt-0.5 text-xs text-text-muted">{item.body}</p>
                        </div>
                        {!item.readAt && (
                          <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="mt-1 text-[10px] text-text-muted">
                        {formatRelativeTime(item.createdAt)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
