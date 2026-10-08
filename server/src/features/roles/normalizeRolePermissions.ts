import { AppError } from '../../utils/AppError.js'
import type { Permission } from '../auth/permissions.js'

const WRITE_IMPLIES_READ: ReadonlyArray<readonly [Permission, Permission]> = [
  ['employees:write', 'employees:read'],
  ['projects:write', 'projects:read'],
  ['clients:write', 'clients:read'],
  ['tasks:write', 'tasks:read'],
  ['expenses:write', 'expenses:read'],
  ['performance:write', 'performance:read'],
  ['settings:admin', 'settings:read'],
  ['salaries:write', 'salaries:read'],
]

/**
 * Normalize custom-role permissions before persist.
 * Dedupes, applies implication rules, and rejects empty sets.
 */
export function normalizeRolePermissions(permissions: Permission[]): Permission[] {
  const set = new Set<Permission>(permissions)

  for (const [write, read] of WRITE_IMPLIES_READ) {
    if (set.has(write)) set.add(read)
  }

  if (set.has('attendance:settings')) {
    set.add('attendance:manage')
  }

  // Org salary access wins over self-only when both are present.
  if (set.has('salaries:self') && (set.has('salaries:read') || set.has('salaries:write'))) {
    set.delete('salaries:self')
  }

  const normalized = [...set].sort()
  if (normalized.length === 0) {
    throw new AppError('At least one permission is required', 400, 'PERMISSIONS_REQUIRED')
  }

  return normalized
}
