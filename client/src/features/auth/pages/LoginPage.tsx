import { Link, useLocation, useNavigate } from 'react-router-dom'
import loginBg from '@/features/auth/assets/login-bg.png'
import type { AuthUser } from '@/features/auth/model/types'
import { AuthCard } from '@/features/auth/ui/AuthCard'
import { AuthShell } from '@/features/auth/ui/AuthShell'
import { LoginForm } from '@/features/auth/ui/LoginForm'
import { getDefaultLandingForRole } from '@/features/settings/lib/preference-utils'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const successMessage = (location.state as { message?: string } | null)?.message

  return (
    <AuthShell background={loginBg}>
    <AuthCard>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold leading-8 text-heading sm:text-[30px]">Welcome Back</h1>
        <p className="text-sm leading-5 text-text-muted">
          Please enter your details to sign in.
        </p>
      </header>

      {successMessage && (
        <div className="rounded-xl border border-border-card bg-success-muted/40 px-4 py-2 text-sm leading-6 text-text-muted">
          {successMessage}
        </div>
      )}

      <LoginForm
        onSuccess={(user: AuthUser) => {
          if (user.status === 'pending') {
            navigate('/pending-approval', { replace: true })
            return
          }
          navigate(getDefaultLandingForRole(user.role, user.enabledHubs), { replace: true })
        }}
      />

      <p className="text-center text-sm leading-5 text-text-secondary">
        <span className="text-heading">Don&apos;t have an account?</span>{' '}
        <Link to="/register" className="font-bold text-primary hover:opacity-90">
          Register
        </Link>
      </p>

      <footer className="flex flex-wrap justify-center gap-x-2 border-t-0 sm:gap-4">
        {['Privacy Policy', 'Terms of Service', 'Help Center'].map((label) => (
          <button
            key={label}
            type="button"
            className=" text-xs leading-4 text-text-muted hover:text-heading"
          >
            {label}
          </button>
        ))}
      </footer>
    </AuthCard>
    </AuthShell>
  )
}
