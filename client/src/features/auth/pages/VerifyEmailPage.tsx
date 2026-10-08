import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import verifyEmailBg from '@/features/auth/assets/verify-email-bg.png'
import { authApi } from '@/features/auth/api/authApi'
import { AuthCard } from '@/features/auth/ui/AuthCard'
import { AuthShell } from '@/features/auth/ui/AuthShell'
import { InfoCircleIcon, MailVerifyIcon } from '@/features/auth/ui/auth-icons'
import { Button } from '@/shared/ui/Button'
import { ArrowLeftIcon } from '@/shared/ui/icons'

export function VerifyEmailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = (location.state as { email?: string } | null)?.email
  const [isResending, setIsResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleResend = async () => {
    if (!email) {
      setError('No email on file. Please register again.')
      return
    }
    setError(null)
    setIsResending(true)
    try {
      await authApi.resendVerificationEmail({ email })
      setResent(true)
    } catch {
      setError('Could not resend email. Try again later.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthShell background={verifyEmailBg}>
    <AuthCard className="overflow-hidden p-0">
      <div className="relative flex h-[120px] items-center justify-center bg-gradient-to-b from-primary/15 to-primary/5 sm:h-[161px]">
        <div className="flex size-[72px] items-center justify-center rounded-2xl border border-border-card bg-surface shadow-[var(--shadow-card)] sm:size-[90px]">
          <MailVerifyIcon />
        </div>
      </div>

      <div className="flex flex-col gap-6 px-5 pb-6 pt-6 sm:gap-8 sm:px-8 sm:pb-8 sm:pt-8">
        <header className="text-center">
          <h1 className="text-2xl font-bold leading-8 text-heading sm:text-[30px] sm:leading-[38px]">
            Verify Your Email
          </h1>
          <p className="mx-auto mt-3 max-w-[340px] text-sm leading-6 text-text-muted sm:leading-[26px]">
            We&apos;ve sent a verification link to your email address. Please click the link to
            activate your account and start using BIZFLOW.
          </p>
          {email && (
            <p className="mt-2 text-sm font-medium text-heading">{email}</p>
          )}
        </header>

        <div className="flex flex-col gap-3">
          {resent && (
            <p className="rounded-lg bg-success-muted px-4 py-2 text-center text-sm text-success">
              Verification email sent again.
            </p>
          )}
          {error && <p className="text-center text-sm text-danger">{error}</p>}

          <Button
            type="button"
            fullWidth
            className="h-12"
            disabled={isResending}
            onClick={handleResend}
          >
            {isResending ? 'Sending…' : 'Resend Verification Email'}
          </Button>

          <Button
            type="button"
            variant="secondary"
            fullWidth
            className="h-12"
            iconPosition="start"
            icon={<ArrowLeftIcon className="size-3.5 text-heading" />}
            onClick={() => navigate('/login')}
          >
            Back to Login
          </Button>

          {/* Demo: continue onboarding after "verification" */}
          <button
            type="button"
            onClick={() => navigate('/pending-approval', { replace: true })}
            className="text-center text-xs text-text-muted underline-offset-2 hover:text-primary hover:underline"
          >
            Continue (demo: email verified)
          </button>
        </div>

        <div className="flex items-start justify-center gap-2 rounded-lg border border-border-card bg-surface-muted px-4 py-3">
          <InfoCircleIcon className="mt-0.5" />
          <p className="text-xs leading-4 text-text-muted">
            Can&apos;t find the email? Check your spam folder.
          </p>
        </div>
      </div>
    </AuthCard>
    </AuthShell>
  )
}
