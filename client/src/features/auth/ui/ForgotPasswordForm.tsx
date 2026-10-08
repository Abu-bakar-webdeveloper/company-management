import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { authApi } from '@/features/auth/api/authApi'
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/features/auth/model/schemas'
import { Button } from '@/shared/ui/Button'
import { Label } from '@/shared/ui/Label'
import { TextField } from '@/shared/ui/TextField'
import { ArrowLeftIcon, ArrowRightIcon, MailIcon } from '@/shared/ui/icons'

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      await authApi.requestPasswordReset(values)
      setSent(true)
    } catch {
      setSubmitError('Unable to send reset link. Please try again.')
    }
  })

  if (sent) {
    return (
      <>
        <div className="rounded-xl border border-border-card bg-surface-input px-4 py-3 text-center text-sm leading-6 text-text-muted">
          If an account exists for that email, we sent password reset instructions.
        </div>
        <div className="flex justify-center pt-2">
          <Link
            to="/reset-password"
            className="text-sm font-semibold text-primary hover:opacity-90"
          >
            Enter reset code / new password
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email" tone="muted" className="normal-case">
            Email address
          </Label>
          <TextField
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
            error={!!errors.email}
            icon={<MailIcon />}
            roundedFull
            inputClassName="bg-surface-input py-[17px]"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-danger">{errors.email.message}</p>
          )}
        </div>

        {submitError && <p className="text-sm text-danger">{submitError}</p>}

        <Button
          type="submit"
          fullWidth
          size="pill"
          shadow
          disabled={isSubmitting}
          icon={<ArrowRightIcon />}
        >
          {isSubmitting ? 'Sending…' : 'Send Reset Link'}
        </Button>
      </form>

      <div className="flex justify-center pt-2">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-medium leading-5 text-heading hover:text-primary"
        >
          <ArrowLeftIcon />
          Back to Login
        </Link>
      </div>
    </>
  )
}
