import { Link, useNavigate } from 'react-router-dom'
import registerBg from '@/features/auth/assets/register-bg.png'
import { AuthCard } from '@/features/auth/ui/AuthCard'
import { AuthShell } from '@/features/auth/ui/AuthShell'
import { RegisterForm } from '@/features/auth/ui/RegisterForm'

export function RegisterPage() {
  const navigate = useNavigate()

  return (
    <AuthShell background={registerBg}>
    <AuthCard>
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold leading-8 text-heading-alt sm:text-[30px] sm:leading-9">
          Create an account
        </h1>
        <p className="text-sm leading-5 text-text-slate sm:text-base sm:leading-6">
          Start your 14-day free trial. No credit card required.
        </p>
      </header>

      <RegisterForm
        onSuccess={({ email }) =>
          navigate('/verify-email', { replace: true, state: { email } })
        }
      />

      <div className="border-t border-border-card pt-8 text-center">
        <p className="text-sm leading-5 text-text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary hover:opacity-90">
            Log in
          </Link>
        </p>
      </div>
    </AuthCard>
    </AuthShell>
  )
}
