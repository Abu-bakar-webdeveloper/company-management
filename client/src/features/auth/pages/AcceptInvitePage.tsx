import { Link, useSearchParams } from 'react-router-dom'
import registerBg from '@/features/auth/assets/register-bg.png'
import { AuthCard } from '@/features/auth/ui/AuthCard'
import { AuthIconBadge } from '@/features/auth/ui/AuthIconBadge'
import { AuthShell } from '@/features/auth/ui/AuthShell'
import { AcceptInviteForm } from '@/features/auth/ui/AcceptInviteForm'
import { KeyResetIcon } from '@/shared/ui/icons'

export function AcceptInvitePage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''

  return (
    <AuthShell background={registerBg}>
    <AuthCard className="gap-0 p-8 sm:p-[41px]">
      <header className="flex flex-col items-center text-center">
        <AuthIconBadge>
          <KeyResetIcon className="size-7 text-primary" />
        </AuthIconBadge>
        <h1 className="text-2xl font-bold leading-8 text-heading">Set up your account</h1>
        <p className="mt-2 max-w-[360px] text-sm leading-5 text-text-muted">
          Create a password to activate your company admin account and sign in to BizFlow.
        </p>
      </header>

      {token ? (
        <AcceptInviteForm token={token} />
      ) : (
        <div className="flex flex-col gap-4 text-center">
          <div className="rounded-xl border border-border-card bg-surface-input px-4 py-3 text-sm leading-6 text-text-muted">
            This invitation link is invalid or missing. Check your email for the latest invite, or
            ask your platform administrator to resend it.
          </div>
          <Link
            to="/login"
            className="text-sm font-semibold text-primary hover:opacity-90"
          >
            Back to Sign In
          </Link>
        </div>
      )}
    </AuthCard>
    </AuthShell>
  )
}
