import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/model/AuthContext'
import { SessionLoadingScreen } from '@/features/auth/ui/SessionLoadingScreen'
import { getLandingPath } from '@/features/settings/lib/preference-utils'
import { useSystemPreferences } from '@/features/settings/model/SystemPreferencesContext'

type GuestRouteProps = {
  children: React.ReactNode
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth()
  const { preferences } = useSystemPreferences()

  if (isLoading) {
    return <SessionLoadingScreen />
  }

  if (isAuthenticated && user) {
    if (user.status === 'pending') {
      return <Navigate to="/pending-approval" replace />
    }
    return <Navigate to={getLandingPath(preferences.defaultLandingPage, user.enabledHubs)} replace />
  }

  return children
}
