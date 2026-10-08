import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/model/AuthContext'
import type { AuthUser } from '@/features/auth/model/types'
import { AuthDivider } from '@/features/auth/ui/AuthDivider'
import { loginSchema, type LoginFormValues } from '@/features/auth/model/schemas'
import { ApiError } from '@/shared/api/errors'
import { Button } from '@/shared/ui/Button'
import { Checkbox } from '@/shared/ui/Checkbox'
import { Label } from '@/shared/ui/Label'
import { PasswordField } from '@/shared/ui/PasswordField'
import { TextField } from '@/shared/ui/TextField'
import { ArrowRightIcon, GoogleIcon, LockIcon, MailIcon } from '@/shared/ui/icons'

type LoginFormProps = {
  onSuccess: (user: AuthUser) => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [pendingInvite, setPendingInvite] = useState(false)
  const [suspendedAccount, setSuspendedAccount] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: true },
  })

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    setPendingInvite(false)
    setSuspendedAccount(false)
    try {
      const user = await login(values)
      onSuccess(user)
    } catch (err) {
      if (err instanceof ApiError && err.code === 'ACCOUNT_PENDING') {
        setPendingInvite(true)
        return
      }
      if (err instanceof ApiError && err.code === 'ACCOUNT_SUSPENDED') {
        setSuspendedAccount(true)
        return
      }
      setSubmitError(
        err instanceof Error && err.message
          ? err.message
          : 'Invalid email or password. Please try again.',
      )
    }
  })

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email Address</Label>
        <TextField
          id="email"
          type="email"
          autoComplete="email"
          placeholder="johndoe@company.com"
          error={!!errors.email}
          icon={<MailIcon />}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-danger">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" tone="slate" className="mb-0">
            Password
          </Label>
          <Link
            to="/forgot-password"
            className="text-xs font-semibold leading-4 text-primary hover:opacity-90"
          >
            Forgot Password?
          </Link>
        </div>
        <PasswordField
          id="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={!!errors.password}
          icon={<LockIcon />}
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-danger">{errors.password.message}</p>
        )}
      </div>

      <label className="flex cursor-pointer items-center gap-2 py-1">
        <Checkbox id="rememberMe" {...register('rememberMe')} />
        <span className="text-sm leading-5 text-heading">Remember for 30 days</span>
      </label>

      {pendingInvite && (
        <div className="rounded-xl border border-border-card bg-primary-muted/40 px-4 py-3 text-sm leading-6 text-text-muted">
          <p className="font-medium text-heading">Account setup incomplete</p>
          <p className="mt-1">
            Your company admin account is still pending. Check your email for the invitation link
            to set your password before signing in.
          </p>
        </div>
      )}

      {suspendedAccount && (
        <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm leading-6 text-[#991b1b]">
          <p className="font-medium">Account suspended</p>
          <p className="mt-1">
            Your account has been suspended. Contact your company administrator to restore access.
          </p>
        </div>
      )}

      {submitError && <p className="text-sm text-danger">{submitError}</p>}

      <Button type="submit" fullWidth disabled={isSubmitting} icon={<ArrowRightIcon />}>
        {isSubmitting ? 'Signing in…' : 'Sign In'}
      </Button>

      <AuthDivider />

      <Button
        type="button"
        variant="secondary"
        fullWidth
        className="h-12 rounded-xl"
        icon={<GoogleIcon />}
      >
        Google
      </Button>
    </form>
  )
}
