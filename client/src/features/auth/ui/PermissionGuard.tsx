import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/model/AuthContext'
import { userHasAnyPermission, userHasPermission, type Permission } from '@/features/auth/model/permissions'

type PermissionGuardProps = {
  permission?: Permission
  anyOf?: Permission[]
  children: React.ReactNode
}

export function PermissionGuard({ permission, anyOf, children }: PermissionGuardProps) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const allowed = permission
    ? userHasPermission(user, permission)
    : anyOf
      ? userHasAnyPermission(user, anyOf)
      : true

  if (!allowed) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
