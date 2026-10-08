import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/features/auth/api/authApi'
import { registerSessionListener } from '@/features/auth/lib/auth-session-sync'
import {
  clearAuthSession,
  loadAuthSession,
  saveAuthSession,
} from '@/features/auth/lib/auth-storage'
import { userHasPermission, type Permission } from '@/features/auth/model/permissions'
import type {
  AuthSession,
  AuthUser,
  LoginCredentials,
  RegisterPayload,
  UserRole,
} from '@/features/auth/model/types'
import { isTerminalAuthFailure } from '@/shared/api/errors'
import { queryKeys } from '@/shared/api/queryKeys'
import { registerUnauthorizedHandler } from '@/shared/api/unauthorized'

type AuthContextValue = {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<AuthUser>
  register: (payload: RegisterPayload) => Promise<AuthUser>
  logout: () => void
  hasRole: (...roles: UserRole[]) => boolean
  can: (permission: Permission) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function applySession(session: AuthSession | null, setSession: (s: AuthSession | null) => void) {
  if (session) {
    saveAuthSession(session)
    setSession(session)
  } else {
    clearAuthSession()
    setSession(null)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [session, setSession] = useState<AuthSession | null>(() => loadAuthSession())
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  const logout = useCallback(() => {
    void queryClient.cancelQueries()
    void authApi.logout().catch(() => {})
    applySession(null, setSession)
    queryClient.clear()
  }, [queryClient])

  useEffect(() => {
    registerUnauthorizedHandler(logout)
    return () => registerUnauthorizedHandler(null)
  }, [logout])

  useEffect(() => {
    registerSessionListener((next) => {
      setSession(next)
      queryClient.setQueryData(queryKeys.auth.me(), next.user)
    })
    return () => registerSessionListener(null)
  }, [queryClient])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      try {
        const refreshed = await authApi.refresh()
        if (!cancelled) {
          applySession(refreshed, setSession)
          queryClient.setQueryData(queryKeys.auth.me(), refreshed.user)
        }
      } catch (error) {
        if (!cancelled) {
          if (isTerminalAuthFailure(error)) {
            applySession(null, setSession)
            queryClient.removeQueries({ queryKey: queryKeys.auth.all })
          } else {
            // Keep hydrated local session on rate-limit / network blips.
            const existing = loadAuthSession()
            if (existing) {
              setSession(existing)
              queryClient.setQueryData(queryKeys.auth.me(), existing.user)
            }
          }
        }
      } finally {
        if (!cancelled) setIsBootstrapping(false)
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [queryClient])

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const next = await authApi.login(credentials)
      applySession(next, setSession)
      queryClient.setQueryData(queryKeys.auth.me(), next.user)
      return next.user
    },
    [queryClient],
  )

  const register = useCallback(async (payload: RegisterPayload) => {
    const user = await authApi.register(payload)
    return user
  }, [])

  const hasRole = useCallback(
    (...roles: UserRole[]) => {
      if (!session?.user) return false
      return roles.includes(session.user.role)
    },
    [session],
  )

  const can = useCallback(
    (permission: Permission) => {
      if (!session?.user) return false
      return userHasPermission(session.user, permission)
    },
    [session],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      isAuthenticated: Boolean(session?.user),
      isLoading: isBootstrapping,
      login,
      register,
      logout,
      hasRole,
      can,
    }),
    [session, isBootstrapping, login, register, logout, hasRole, can],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
