import { Link } from 'react-router-dom'
import type { NavItem } from '@/app/shell/navigation'
import { NavIcon } from '@/app/shell/icons'

type HubModulesGridProps = {
  modules: NavItem[]
}

export function HubModulesGrid({ modules }: HubModulesGridProps) {
  if (modules.length === 0) return null

  return (
    <nav
      aria-label="Hub modules"
      className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
    >
      {modules.map((item) => (
        <Link
          key={item.id}
          to={item.path}
          className="flex min-h-14 items-center gap-3 rounded-xl border border-border-card bg-surface p-3 shadow-[var(--shadow-stat)] transition-colors hover:border-primary/40 hover:bg-primary-muted/40 sm:min-h-16 sm:p-4"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-muted text-primary sm:size-10">
            <NavIcon icon={item.icon} className="size-4 sm:size-[18px]" />
          </span>
          <span className="min-w-0 truncate text-sm font-semibold text-heading sm:text-[15px]">
            {item.label}
          </span>
        </Link>
      ))}
    </nav>
  )
}
