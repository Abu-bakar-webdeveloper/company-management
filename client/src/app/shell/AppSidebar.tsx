import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  isNavGroup,
  navTreeForUser,
  type NavEntry,
  type NavGroup,
  type NavItem,
} from '@/app/shell/navigation'
import { ChevronDownIcon, LogoutIcon, NavIcon } from '@/app/shell/icons'
import { useAuth } from '@/features/auth/model/AuthContext'
import { normalizeSidebarStyle } from '@/features/settings/lib/preference-utils'
import { useSystemPreferences } from '@/features/settings/model/SystemPreferencesContext'
import { roleLabel } from '@/shared/lib/user-utils'
import { cn } from '@/shared/lib/cn'
import { UserAvatar } from '@/shared/ui/UserAvatar'

type AppSidebarProps = {
  isOpen?: boolean
  onClose?: () => void
}

const EXPAND_STORAGE_KEY = 'bizflow.nav.expanded'

function readExpandedIds(): Record<string, boolean> {
  try {
    const raw = sessionStorage.getItem(EXPAND_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (parsed && typeof parsed === 'object') return parsed as Record<string, boolean>
  } catch {
    /* ignore */
  }
  return {}
}

function writeExpandedIds(value: Record<string, boolean>) {
  try {
    sessionStorage.setItem(EXPAND_STORAGE_KEY, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}

function pathMatches(pathname: string, target: string) {
  if (target === '/dashboard') return pathname === '/dashboard'
  return pathname === target || pathname.startsWith(`${target}/`)
}

function isGroupActive(group: NavGroup, pathname: string) {
  if (pathMatches(pathname, group.path)) return true
  return group.children.some((child) => pathMatches(pathname, child.path))
}

function isGroupExactHub(group: NavGroup, pathname: string) {
  return pathname === group.path
}

function SidebarUser({ variant = 'desktop' }: { variant?: 'mobile' | 'desktop' }) {
  const { user, logout } = useAuth()

  if (!user) return null

  if (variant === 'mobile') {
    return (
      <div className="flex items-center gap-3 px-6 pt-6 pb-4">
        <UserAvatar
          name={user.fullName}
          avatar={user.avatar}
          size="lg"
          className="size-11 bg-primary text-sm text-white"
        />
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-heading">{user.fullName}</p>
          <p className="text-sm text-text-muted">{roleLabel(user.role)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-4 flex items-center gap-3 rounded-2xl bg-primary-muted px-4 py-3">
      <UserAvatar
        name={user.fullName}
        avatar={user.avatar}
        size="lg"
        className="bg-primary text-sm text-white"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-heading">{user.fullName}</p>
        <p className="text-xs text-text-muted">{roleLabel(user.role)}</p>
      </div>
      <button
        type="button"
        className="shrink-0 p-1 hover:text-heading"
        aria-label="Log out"
        onClick={logout}
      >
        <LogoutIcon />
      </button>
    </div>
  )
}

function SidebarLink({
  item,
  collapsed,
  onClose,
  nested = false,
}: {
  item: NavItem
  collapsed: boolean
  onClose?: () => void
  nested?: boolean
}) {
  // Exact match for home paths that have nested sibling routes (e.g. /performance vs /performance/team).
  const end = item.path === '/dashboard' || item.id === 'performance'

  return (
    <NavLink
      to={item.path}
      end={end}
      onClick={onClose}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          'flex shrink-0 items-center gap-3 font-medium transition-colors',
          collapsed && 'h-11 justify-center rounded-full px-0 lg:h-10',
          !collapsed &&
            !nested &&
            'h-11 w-full rounded-full px-4 text-base lg:h-10',
          !collapsed &&
            nested &&
            'h-9 w-full rounded-lg px-3 text-sm',
          isActive
            ? nested
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'bg-primary text-white shadow-lg shadow-primary/30'
            : 'text-label hover:bg-surface-muted',
        )
      }
    >
      {({ isActive }) => (
        <>
          <NavIcon
            icon={item.icon}
            className={cn('size-[18px] shrink-0', isActive && 'text-white')}
          />
          {!collapsed && <span className="truncate">{item.label}</span>}
        </>
      )}
    </NavLink>
  )
}

function SidebarGroup({
  group,
  collapsed,
  expanded,
  onToggle,
  onClose,
}: {
  group: NavGroup
  collapsed: boolean
  expanded: boolean
  onToggle: () => void
  onClose?: () => void
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const active = isGroupActive(group, location.pathname)
  const hubActive = isGroupExactHub(group, location.pathname)
  const showChildren = !collapsed && expanded

  if (collapsed) {
    return (
      <NavLink
        to={group.path}
        onClick={onClose}
        title={group.label}
        className={cn(
          'flex h-11 shrink-0 items-center justify-center rounded-full transition-colors lg:h-10',
          active
            ? 'bg-primary text-white shadow-lg shadow-primary/30'
            : 'text-label hover:bg-surface-muted',
        )}
      >
        <NavIcon
          icon={group.icon}
          className={cn('size-[18px] shrink-0', active && 'text-white')}
        />
      </NavLink>
    )
  }

  return (
    <div className="flex w-full shrink-0 flex-col">
      <div
        className={cn(
          'flex h-11 w-full shrink-0 items-center rounded-full transition-colors lg:h-10',
          hubActive
            ? 'bg-primary text-white shadow-lg shadow-primary/30'
            : active
              ? 'bg-primary-muted text-primary'
              : 'text-label hover:bg-surface-muted',
        )}
      >
        <button
          type="button"
          onClick={() => {
            if (!expanded) onToggle()
            navigate(group.path)
            onClose?.()
          }}
          className="flex h-full min-w-0 flex-1 items-center gap-3 rounded-full px-4 text-left text-base font-medium"
        >
          <NavIcon
            icon={group.icon}
            className={cn(
              'size-[18px] shrink-0',
              hubActive ? 'text-white' : active && 'text-primary',
            )}
          />
          <span className="truncate">{group.label}</span>
        </button>
        <button
          type="button"
          aria-label={expanded ? `Collapse ${group.label}` : `Expand ${group.label}`}
          aria-expanded={expanded}
          aria-controls={`nav-group-${group.id}`}
          onClick={onToggle}
          className={cn(
            'mr-1.5 flex size-8 shrink-0 items-center justify-center rounded-full transition-colors',
            hubActive ? 'hover:bg-white/15' : 'hover:bg-black/5',
          )}
        >
          <ChevronDownIcon
            className={cn(
              'size-4 transition-transform duration-200',
              expanded && 'rotate-180',
              hubActive ? 'text-white/90' : active ? 'text-primary' : 'text-text-muted',
            )}
          />
        </button>
      </div>

      {showChildren ? (
        <div
          id={`nav-group-${group.id}`}
          className="ml-4 mt-1 mb-1 flex shrink-0 flex-col gap-0.5 border-l border-border-card pl-3"
        >
          {group.children.map((child) => (
            <SidebarLink
              key={child.id}
              item={child}
              collapsed={false}
              onClose={onClose}
              nested
            />
          ))}
        </div>
      ) : (
        <div id={`nav-group-${group.id}`} hidden />
      )}
    </div>
  )
}

export function AppSidebar({ isOpen = false, onClose }: AppSidebarProps) {
  const { user } = useAuth()
  const { preferences } = useSystemPreferences()
  const location = useLocation()
  const entries: NavEntry[] = useMemo(
    () => (user ? navTreeForUser(user) : []),
    [user],
  )
  const collapsed = normalizeSidebarStyle(preferences.sidebarStyle) === 'Collapsed'
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(readExpandedIds)

  useEffect(() => {
    setExpandedIds((prev) => {
      let changed = false
      const next = { ...prev }
      for (const entry of entries) {
        if (!isNavGroup(entry)) continue
        if (isGroupActive(entry, location.pathname) && next[entry.id] !== true) {
          next[entry.id] = true
          changed = true
        }
      }
      if (changed) writeExpandedIds(next)
      return changed ? next : prev
    })
  }, [entries, location.pathname])

  const toggleGroup = (id: string) => {
    setExpandedIds((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      writeExpandedIds(next)
      return next
    })
  }

  return (
    <aside
      className={cn(
        'fixed top-14 bottom-0 left-0 z-50 flex w-[min(300px,80vw)] shrink-0 flex-col rounded-tr-[20px] bg-surface shadow-xl transition-all duration-300 ease-in-out lg:relative lg:top-auto lg:bottom-auto lg:z-auto lg:h-full lg:translate-x-0 lg:rounded-none lg:border-r lg:border-border-card lg:shadow-none',
        collapsed ? 'lg:w-[80px]' : 'lg:w-[260px]',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}
    >
      <div className="lg:hidden">
        {user?.role === 'employee' ? (
          <div className="px-6 pt-6 pb-2">
            <p className="text-lg font-bold text-heading">Employee Portal</p>
          </div>
        ) : user?.role === 'hr' ? (
          <div className="px-6 pt-6 pb-2">
            <p className="text-lg font-bold text-heading">HR Portal</p>
          </div>
        ) : (
          <SidebarUser variant="mobile" />
        )}
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-4 lg:pt-2 lg:pb-6">
        {entries.map((entry) =>
          isNavGroup(entry) ? (
            <SidebarGroup
              key={entry.id}
              group={entry}
              collapsed={collapsed}
              expanded={Boolean(expandedIds[entry.id])}
              onToggle={() => toggleGroup(entry.id)}
              onClose={onClose}
            />
          ) : (
            <SidebarLink
              key={entry.id}
              item={entry}
              collapsed={collapsed}
              onClose={onClose}
            />
          ),
        )}
      </nav>

      {!collapsed && (
        <div className="shrink-0 pb-6">
          <SidebarUser variant="desktop" />
        </div>
      )}
    </aside>
  )
}
