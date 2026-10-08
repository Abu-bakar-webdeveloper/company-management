import forgotPasswordBg from '@/features/auth/assets/forgot-password-bg.png'
import { AuthCard } from '@/features/auth/ui/AuthCard'
import { AuthIconBadge } from '@/features/auth/ui/AuthIconBadge'
import { AuthShell } from '@/features/auth/ui/AuthShell'
import { ForgotPasswordForm } from '@/features/auth/ui/ForgotPasswordForm'
import { KeyResetIcon } from '@/shared/ui/icons'

export function ForgotPasswordPage() {
  return (
    <AuthShell background={forgotPasswordBg}>
    <AuthCard className="gap-0 p-6 sm:p-[41px]">
      <header className="flex flex-col items-center text-center">
        <AuthIconBadge>
          <KeyResetIcon />
        </AuthIconBadge>
        <h1 className="pb-2 text-2xl font-bold leading-8 text-heading sm:text-[30px] sm:leading-9">
          Forgot Password
        </h1>
        <p className="max-w-[340px] text-sm leading-5 text-text-muted sm:text-base sm:leading-6">
          No worries, we&apos;ll send you reset instructions.
          <br />
          Enter your registered email address below.
        </p>
      </header>

      <ForgotPasswordForm />
    </AuthCard>
    </AuthShell>
  )
}
