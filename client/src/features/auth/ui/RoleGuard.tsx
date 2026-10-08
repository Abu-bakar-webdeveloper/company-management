import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/model/AuthContext'
import type { UserRole } from '@/features/auth/model/types'

type RoleGuardProps = {
  allowedRoles: UserRole[]
  children: React.ReactNode
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user } = useAuth()

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
