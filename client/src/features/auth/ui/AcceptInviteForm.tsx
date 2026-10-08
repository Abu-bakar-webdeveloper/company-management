import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '@/features/auth/api/authApi'
import {
  acceptInviteSchema,
  type AcceptInviteFormValues,
} from '@/features/auth/model/schemas'
import { PasswordRequirementsHint } from '@/features/auth/ui/PasswordRequirementsHint'
import { getErrorMessage } from '@/shared/api/errors'
import { Button } from '@/shared/ui/Button'
import { Label } from '@/shared/ui/Label'
import { PasswordField } from '@/shared/ui/PasswordField'
import { ArrowLeftIcon, LockIcon } from '@/shared/ui/icons'

type AcceptInviteFormProps = {
  token: string
}

export function AcceptInviteForm({ token }: AcceptInviteFormProps) {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AcceptInviteFormValues>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      await authApi.acceptInvite({
        token,
        password: values.password,
        confirmPassword: values.confirmPassword,
      })
      navigate('/login', {
        replace: true,
        state: { message: 'Your account is active. Sign in with your new password.' },
      })
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Unable to activate account. Please try again.'))
    }
  })

  return (
    <div className="flex w-full flex-col gap-6">
      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password" className="font-semibold">
            New Password
          </Label>
          <PasswordField
            id="password"
            autoComplete="new-password"
            placeholder="Enter at least 8 characters"
            error={!!errors.password}
            icon={<LockIcon />}
            tall
            {...register('password')}
          />
          {errors.password && (
            <p className="text-sm text-danger">{errors.password.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmPassword" className="font-semibold">
            Confirm Password
          </Label>
          <PasswordField
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="Repeat your new password"
            error={!!errors.confirmPassword}
            icon={<LockIcon />}
            tall
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-danger">{errors.confirmPassword.message}</p>
          )}
        </div>

        <PasswordRequirementsHint />

        {submitError && <p className="text-sm text-danger">{submitError}</p>}

        <Button type="submit" fullWidth shadow className="h-12" disabled={isSubmitting}>
          {isSubmitting ? 'Activating…' : 'Activate Account'}
        </Button>
      </form>

      <div className="flex justify-center border-t border-border-card pt-2">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-90"
        >
          <ArrowLeftIcon />
          Back to Sign In
        </Link>
      </div>
    </div>
  )
}
