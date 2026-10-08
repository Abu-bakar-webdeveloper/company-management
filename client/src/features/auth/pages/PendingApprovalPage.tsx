import { Link } from 'react-router-dom'
import loginBg from '@/features/auth/assets/login-bg.png'
import { useAuth } from '@/features/auth/model/AuthContext'
import { AuthCard } from '@/features/auth/ui/AuthCard'
import { AuthShell } from '@/features/auth/ui/AuthShell'
import { HourglassIcon, LogoutIcon, ShieldClockIcon } from '@/features/auth/ui/auth-icons'
import { Button } from '@/shared/ui/Button'

export function PendingApprovalPage() {
  const { logout } = useAuth()

  return (
    <AuthShell background={loginBg}>
    <AuthCard className="p-6 sm:p-[41px]">
      <header className="flex flex-col items-center text-center">
        <div className="relative mb-6 flex size-24 items-center justify-center">
          <span
            className="absolute inset-0 rounded-full bg-primary/10 blur-xl"
            aria-hidden
          />
          <div className="relative flex size-24 items-center justify-center rounded-full bg-primary-muted">
            <ShieldClockIcon className="size-8" />
          </div>
        </div>

        <h1 className="text-2xl font-bold leading-8 text-heading sm:text-[30px] sm:leading-[38px]">
          Account Pending Approval
        </h1>
        <p className="mt-4 max-w-[446px] text-sm leading-5 text-text-muted sm:text-base sm:leading-[22px]">
          Your account is waiting for admin approval. We need to verify your details before you
          can access the dashboard.
        </p>
        <p className="mt-4 max-w-[432px] text-sm leading-5 text-text-muted">
          You will receive an email notification once your account has been reviewed.
        </p>
      </header>

      <div className="rounded-xl border border-border-card bg-primary-muted/40 px-6 py-6">
        <div className="flex items-center gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-muted">
            <HourglassIcon />
          </div>
          <div>
            <p className="text-sm font-medium text-heading">Verification in progress</p>
            <p className="text-xs text-text-muted">Typical wait time: 12–24 hours</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="secondary"
          fullWidth
          className="h-12"
          iconPosition="start"
          icon={<LogoutIcon />}
          onClick={logout}
        >
          Logout
        </Button>

        <Button
          type="button"
          variant="ghost"
          fullWidth
          className="h-12 border border-border text-heading"
          onClick={() => window.open('mailto:support@bizflow.com', '_blank')}
        >
          Contact Support
        </Button>
      </div>

      <p className="text-center text-sm text-text-muted">
        Already approved?{' '}
        <Link to="/login" className="font-bold text-primary hover:opacity-90">
          Sign in
        </Link>
      </p>
    </AuthCard>
    </AuthShell>
  )
}
