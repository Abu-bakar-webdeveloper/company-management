import resetPasswordBg from '@/features/auth/assets/reset-password-bg.png'
import { AuthCard } from '@/features/auth/ui/AuthCard'
import { AuthIconBadge } from '@/features/auth/ui/AuthIconBadge'
import { AuthShell } from '@/features/auth/ui/AuthShell'
import { ResetPasswordForm } from '@/features/auth/ui/ResetPasswordForm'
import { KeyResetIcon } from '@/shared/ui/icons'

export function ResetPasswordPage() {
  return (
    <AuthShell background={resetPasswordBg}>
    <AuthCard className="p-8 sm:p-[41px]">
      <header className="flex flex-col items-center text-center">
        <AuthIconBadge>
          <KeyResetIcon className="size-7 text-primary" />
        </AuthIconBadge>
        <h1 className="text-2xl font-bold leading-8 text-heading">Reset your password</h1>
        <p className="mt-2 max-w-[409px] text-sm leading-5 text-text-muted">
          Please enter and confirm your new password below to secure your account.
        </p>
      </header>

      <ResetPasswordForm />
    </AuthCard>
    </AuthShell>
  )
}
