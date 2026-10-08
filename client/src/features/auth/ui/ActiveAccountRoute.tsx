import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/model/AuthContext'

type ActiveAccountRouteProps = {
  children: React.ReactNode
}

export function ActiveAccountRoute({ children }: ActiveAccountRouteProps) {
  const { user, logout } = useAuth()

  useEffect(() => {
    if (user?.status === 'suspended') {
      logout()
    }
  }, [user?.status, logout])

  if (user?.status === 'pending') {
    return <Navigate to="/pending-approval" replace />
  }

  if (user?.status === 'suspended') {
    return <Navigate to="/login" replace />
  }

  return children
}
