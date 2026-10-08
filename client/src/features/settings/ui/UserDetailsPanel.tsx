import { useEffect, useState } from 'react'
import { settingsApi } from '@/features/settings/api/settingsApi'
import type { ManagedUser, UserActivity } from '@/features/settings/model/types'
import { SidePanel } from '@/shared/ui/SidePanel'
import { UserAvatar } from '@/shared/ui/UserAvatar'
import { cn } from '@/shared/lib/cn'

type UserDetailsPanelProps = {
  user: ManagedUser | null
  onClose: () => void
}

export function UserDetailsPanel({ user, onClose }: UserDetailsPanelProps) {
  const [activities, setActivities] = useState<UserActivity[]>([])

  useEffect(() => {
    if (user) {
      void settingsApi.getUserActivities(user.id).then(setActivities)
    }
  }, [user])

  return (
    <SidePanel
      open={!!user}
      onClose={onClose}
      title="User Details"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-bold uppercase tracking-wide text-white hover:opacity-95"
        >
          Close Panel
        </button>
      }
    >
      {user && (
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <UserAvatar
                name={user.name}
                avatar={user.avatar}
                size="2xl"
                className="border-4 border-primary"
              />
              <span className="absolute bottom-1 right-1 size-3 rounded-full border-2 border-surface bg-[#00B67A]" />
            </div>
            <span className="mt-3 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#00B67A]">
              {user.status}
            </span>
            <h3 className="mt-2 text-xl font-bold text-heading">{user.name}</h3>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {user.jobTitle ?? user.role}
            </p>
          </div>

          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-wide text-text-muted">
              Contact Information
            </p>
            <ul className="space-y-3">
              {[
                { label: 'Email Address', value: user.email },
                { label: 'Phone Number', value: user.phone ?? '—' },
                { label: 'Location', value: user.location ?? '—' },
              ].map(({ label, value }) => (
                <li key={label} className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-primary text-xs">@</span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-text-muted">{label}</p>
                    <p className="text-sm text-heading">{value}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-wide text-text-muted">System Info</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-surface-muted p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-text-muted">Join Date</p>
                <p className="mt-1 text-sm font-semibold text-heading">{user.joinDate ?? '—'}</p>
              </div>
              <div className="rounded-xl bg-surface-muted p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-text-muted">Last Active</p>
                <p className="mt-1 text-sm font-semibold text-heading">{user.lastActive ?? '—'}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-wide text-text-muted">Recent Activity</p>
            <ul className="space-y-4 border-l-2 border-[#E2E8F0] pl-4">
              {activities.map((act, i) => (
                <li key={act.id} className="relative">
                  <span className={cn('absolute -left-[21px] top-1 size-2.5 rounded-full bg-primary', i === 0 && 'ring-4 ring-primary/20')} />
                  <p className="text-sm font-semibold text-heading">{act.title}</p>
                  <p className="text-xs text-text-muted">{act.description}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-text-muted">{act.timestamp}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </SidePanel>
  )
}
