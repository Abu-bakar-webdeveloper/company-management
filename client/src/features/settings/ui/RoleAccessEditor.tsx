import type { Permission } from '@/features/auth/model/permissions'
import { useAuth } from '@/features/auth/model/AuthContext'
import {
  getEnabledModules,
  getVisibleAccessModules,
  isCapabilityEnabled,
  isModuleEnabled,
  type AccessModuleId,
  type CapabilityId,
} from '@/features/settings/lib/role-capabilities'
import { Checkbox } from '@/shared/ui/Checkbox'
import { cn } from '@/shared/lib/cn'

type RoleAccessEditorProps = {
  permissions: Permission[]
  readOnly?: boolean
  compact?: boolean
  onToggleModule?: (moduleId: AccessModuleId, enabled: boolean) => void
  onToggleCapability?: (capabilityId: CapabilityId, enabled: boolean) => void
}

export function RoleAccessEditor({
  permissions,
  readOnly = false,
  compact = false,
  onToggleModule,
  onToggleCapability,
}: RoleAccessEditorProps) {
  const { user } = useAuth()
  const modules = getVisibleAccessModules(user?.enabledHubs)
  const enabledModules = getEnabledModules(permissions).filter((id) =>
    modules.some((module) => module.id === id),
  )

  return (
    <div className={cn('space-y-3', compact && 'space-y-2.5')}>
      <p className="text-xs font-bold uppercase tracking-wide text-text-muted">
        Modules with access
      </p>

      <div className="space-y-2">
        {modules.map((module) => {
          const moduleEnabled = isModuleEnabled(permissions, module.id)

          return (
            <div
              key={module.id}
              className={cn(
                'rounded-xl border',
                moduleEnabled
                  ? 'border-primary/30 bg-[#EFF6FF]/40'
                  : 'border-border-card bg-surface',
              )}
            >
              <label
                className={cn(
                  'flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4',
                  readOnly && 'opacity-90',
                )}
              >
                <span className="text-sm font-semibold text-heading">{module.label}</span>
                <Checkbox
                  checked={moduleEnabled}
                  disabled={readOnly}
                  onChange={() => onToggleModule?.(module.id, !moduleEnabled)}
                  aria-label={`${moduleEnabled ? 'Remove' : 'Grant'} access to ${module.label}`}
                  className="size-[18px] accent-primary"
                />
              </label>

              {moduleEnabled && (
                <div className="space-y-2 border-t border-border-card/80 px-3 py-3 sm:px-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-text-muted">
                    {module.label} capabilities
                  </p>
                  <div className="space-y-2">
                    {module.capabilities.map((capability) => {
                      const checked = isCapabilityEnabled(permissions, capability.id)
                      return (
                        <label
                          key={capability.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-border-card bg-surface px-3 py-2.5"
                        >
                          <span className="text-sm font-medium text-heading">
                            {capability.label}
                          </span>
                          <Checkbox
                            checked={checked}
                            disabled={readOnly}
                            onChange={() => onToggleCapability?.(capability.id, !checked)}
                            aria-label={capability.label}
                            className="size-[18px] accent-primary"
                          />
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {enabledModules.length === 0 && (
        <p className="text-sm text-text-muted">
          {readOnly
            ? 'This role has no module access configured.'
            : 'Turn on a module to choose its capabilities.'}
        </p>
      )}
    </div>
  )
}
