import { useState } from 'react'
import type { CompanyDetail } from '@/features/platform/model/types'
import { useResendCompanyInvite } from '@/features/platform/hooks/useCompanies'
import { getErrorMessage } from '@/shared/api/errors'
import { Button } from '@/shared/ui/Button'
import { MailIcon } from '@/features/platform/ui/icons'

type CompanyAdminInviteCardProps = {
  company: CompanyDetail
}

export function CompanyAdminInviteCard({ company }: CompanyAdminInviteCardProps) {
  const resendInvite = useResendCompanyInvite()
  const [feedback, setFeedback] = useState<string | null>(null) // TODO: add feedback translation
  const [error, setError] = useState<string | null>(null) // TODO: add error translation

  if (company.adminStatus !== 'pending') {
    return null
  }

  const handleResend = async () => {
    setFeedback(null)
    setError(null)
    try {
      const result = await resendInvite.mutateAsync(company.id)
      if (import.meta.env.DEV && result.devInviteToken) {
        console.info('[dev] Admin invite token:', result.devInviteToken)
      }
      setFeedback(`Invitation resent to ${company.adminEmail}.`)
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to resend invitation.'))
    }
  }

  return (
    <div className="mb-6 rounded-xl border border-[#C5DBF5] bg-[#F0F7FF] p-5 shadow-[0_2px_8px_rgba(24,119,242,0.06)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-primary">
            Admin invitation pending
          </p>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            <span className="font-medium text-heading">{company.adminName}</span> (
            {company.adminEmail}) must set a password via the invite email before they can sign in.
          </p>
          {import.meta.env.DEV && (
            <p className="mt-2 text-xs leading-5 text-text-muted">
              In development, the invite token is logged to the browser console when created or
              resent.
            </p>
          )}
        </div>

        <Button
          type="button"
          variant="secondary"
          className="h-10 shrink-0 px-5"
          icon={<MailIcon className="text-text-muted" />}
          disabled={resendInvite.isPending}
          onClick={() => void handleResend()}
        >
          {resendInvite.isPending ? 'Sending…' : 'Resend Invite'}
        </Button>
      </div>

      {feedback && <p className="mt-3 text-sm text-success">{feedback}</p>}
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </div>
  )
}
