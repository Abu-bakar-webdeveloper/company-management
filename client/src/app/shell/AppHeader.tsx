import { Link } from 'react-router-dom'
import { MenuIcon, SearchIcon } from '@/app/shell/icons'
import { useAuth } from '@/features/auth/model/AuthContext'
import { NotificationBell } from '@/features/notifications/ui/NotificationBell'
import { useSystemPreferences } from '@/features/settings/model/SystemPreferencesContext'
import { roleLabel } from '@/shared/lib/user-utils'
import { UserAvatar } from '@/shared/ui/UserAvatar'

type AppHeaderProps = {
  onMenuClick?: () => void
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { user } = useAuth()
  const { preferences } = useSystemPreferences()

  return (
    <header className="z-20 flex h-14 shrink-0 items-center justify-between border-b border-border-card bg-surface px-4 lg:h-[72px] lg:px-8">
      <div className="flex items-center gap-3 lg:gap-[95px]">
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-lg hover:bg-surface-muted lg:hidden"
          aria-label="Open menu"
          onClick={onMenuClick}
        >
          <MenuIcon />
        </button>

        <Link to="/dashboard" className="flex h-8 items-center lg:h-10" aria-label="BizFlow home">
          <img
            src="/logo.svg"
            alt="BizFlow"
            width={168}
            height={40}
            className="h-8 w-auto lg:h-10 dark:brightness-110"
          />
        </Link>

        <div className="relative hidden w-[502px] lg:block">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-[18px] shrink-0 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            placeholder="Search tasks, employees, or files..."
            className="h-10 w-full rounded-[24px] border border-border bg-[#EAEEF5] pl-11 pr-4 text-sm text-heading placeholder:text-placeholder-alt outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        {preferences.enableNotifications && <NotificationBell />}

        <div className="flex items-center gap-3 border-l-0 pl-0 lg:gap-4 lg:border-l lg:border-border lg:pl-6">
          <div className="hidden text-right lg:block">
            <p className="text-sm font-medium leading-5 text-heading">{user?.fullName ?? 'Guest'}</p>
            <p className="text-xs leading-4 text-text-muted">
              {user ? roleLabel(user.role) : ''}
            </p>
          </div>
          <UserAvatar
            name={user?.fullName ?? '?'}
            avatar={user?.avatar}
            size="lg"
            className="size-9 lg:size-10"
          />
        </div>
      </div>
    </header>
  )
}
