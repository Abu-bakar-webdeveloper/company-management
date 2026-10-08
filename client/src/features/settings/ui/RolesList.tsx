import type { ReactNode } from 'react'
import type { Role } from '@/features/settings/model/types'
import {
  BriefcaseIcon,
  CheckCircleSolidIcon,
  PlusCircleIcon,
  ShieldIcon,
  UserIcon,
  UsersIcon,
} from '@/features/settings/ui/icons'
import { cn } from '@/shared/lib/cn'

const roleIcons: Record<string, (props: { className?: string }) => ReactNode> = {
  admin: ShieldIcon,
  manager: UsersIcon,
  employee: UserIcon,
  'hr-specialist': BriefcaseIcon,
}

type RolesListProps = {
  roles: Role[]
  selectedId: string
  onSelect: (id: string) => void
  onCreateNew?: () => void
}

type RoleCardProps = {
  role: Role
  selected: boolean
  onSelect: (id: string) => void
  compact?: boolean
}

function RoleCard({ role, selected, onSelect, compact = false }: RoleCardProps) {
  const Icon = roleIcons[role.id] ?? UserIcon

  return (
    <button
      type="button"
      onClick={() => onSelect(role.id)}
      className={cn(
        'flex items-center gap-3 rounded-xl border text-left transition-colors',
        compact ? 'min-w-[220px] shrink-0 snap-start p-3' : 'w-full p-3 lg:p-3.5 xl:p-4',
        selected
          ? 'border-primary bg-primary text-white shadow-[0_4px_12px_rgba(24,119,242,0.3)]'
          : 'border-border-card bg-surface-muted hover:border-primary/40',
      )}
    >
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-lg',
          compact ? 'size-9' : 'size-10',
          selected ? 'bg-white/15 text-white' : 'bg-[#e2e8f0] text-text-muted',
        )}
      >
        <Icon className={compact ? 'size-4' : 'size-5'} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn('block truncate font-bold', selected ? 'text-white' : 'text-heading')}>
          {role.name}
        </span>
        <span
          className={cn(
            'mt-0.5 block truncate text-xs',
            selected ? 'text-white/80' : 'text-text-muted',
          )}
        >
          {role.description}
        </span>
      </span>
      {selected ? (
        <CheckCircleSolidIcon className="shrink-0 text-white" />
      ) : (
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-text-muted">
          {String(role.userCount).padStart(2, '0')} Users
        </span>
      )}
    </button>
  )
}

function CreateRoleButton({ onCreateNew, className }: { onCreateNew?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onCreateNew}
      className={cn(
        'flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-4 text-[11px] font-bold uppercase tracking-wide text-text-muted transition-colors hover:border-primary/50 hover:text-primary',
        className,
      )}
    >
      <PlusCircleIcon className="size-4" />
      Create New Role
    </button>
  )
}

export function RolesList({ roles, selectedId, onSelect, onCreateNew }: RolesListProps) {
  return (
    <>
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 md:gap-4 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {roles.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            selected={role.id === selectedId}
            onSelect={onSelect}
            compact
          />
        ))}
      </div>

      <div className="hidden flex-col gap-3 lg:sticky lg:top-6 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:pr-1 lg:flex">
        {roles.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            selected={role.id === selectedId}
            onSelect={onSelect}
          />
        ))}
        {onCreateNew ? <CreateRoleButton onCreateNew={onCreateNew} /> : null}
      </div>
    </>
  )
}
