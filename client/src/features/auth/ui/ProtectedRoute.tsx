import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/model/AuthContext'
import { SessionLoadingScreen } from '@/features/auth/ui/SessionLoadingScreen'

type ProtectedRouteProps = {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <SessionLoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
