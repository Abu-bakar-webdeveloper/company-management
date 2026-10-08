import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/features/auth/model/AuthContext'
import {
  registerSchema,
  type RegisterFormValues,
} from '@/features/auth/model/schemas'
import { Button } from '@/shared/ui/Button'
import { Checkbox } from '@/shared/ui/Checkbox'
import { Label } from '@/shared/ui/Label'
import { PasswordField } from '@/shared/ui/PasswordField'
import { TextField } from '@/shared/ui/TextField'
import { LockIcon, MailIcon, UserIcon } from '@/shared/ui/icons'

type RegisterFormProps = {
  onSuccess: (result: { email: string }) => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { register: registerUser } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      await registerUser(values)
      onSuccess({ email: values.email })
    } catch {
      setSubmitError('Unable to create account. Please try again.')
    }
  })

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="fullName">Full Name</Label>
        <TextField
          id="fullName"
          autoComplete="name"
          placeholder="John Doe"
          error={!!errors.fullName}
          icon={<UserIcon />}
          {...register('fullName')}
        />
        {errors.fullName && (
          <p className="text-sm text-danger">{errors.fullName.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email" tone="slate">
          Email Address
        </Label>
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
        <Label htmlFor="password" tone="slate" className="font-semibold">
          Password
        </Label>
        <PasswordField
          id="password"
          autoComplete="new-password"
          placeholder="••••••••"
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
        <Label htmlFor="confirmPassword" tone="slate" className="font-semibold">
          Confirm Password
        </Label>
        <PasswordField
          id="confirmPassword"
          autoComplete="new-password"
          placeholder="••••••••"
          error={!!errors.confirmPassword}
          icon={<LockIcon />}
          tall
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-danger">{errors.confirmPassword.message}</p>
        )}
      </div>

      <label className="flex cursor-pointer items-start gap-2 py-1">
        <Checkbox className="mt-0.5" {...register('acceptTerms')} />
        <span className="text-sm leading-5 text-heading">
          I agree to the{' '}
          <span className="font-semibold text-primary">Terms of Services</span> and{' '}
          <span className="font-semibold text-primary">Privacy Policy</span>.
        </span>
      </label>
      {errors.acceptTerms && (
        <p className="text-sm text-danger">{errors.acceptTerms.message}</p>
      )}

      {submitError && <p className="text-sm text-danger">{submitError}</p>}

      <Button type="submit" fullWidth size="md" className="h-12 rounded-xl" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account…' : 'Register Account'}
      </Button>
    </form>
  )
}
