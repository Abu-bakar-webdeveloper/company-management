import type { UserRole } from '@/features/auth/model/types'
export { getInitials } from '@/shared/lib/string-utils'

export function roleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    superadmin: 'Super Admin',
    admin: 'Admin',
    manager: 'Manager',
    hr: 'HR',
    employee: 'Employee',
  }
  return labels[role]
}
