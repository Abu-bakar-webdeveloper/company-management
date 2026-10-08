import { Link, useNavigate } from 'react-router-dom'
import type { SubscriptionDetail } from '@/features/platform/model/types'
import { subscriptionPlanOptions } from '@/features/platform/model/companiesFormData'
import {
  CompanyFormField,
  companyInputClass,
} from '@/features/platform/ui/CompanyFormField'
import { CompanyIconInput, CompanySelect } from '@/features/platform/ui/CompanyFormControls'
import {
  CalendarIcon,
  CloseIcon,
  EditPenIcon,
  MailIcon,
  ScanIcon,
} from '@/features/platform/ui/icons'
import { PlatformActionCards } from '@/features/platform/ui/PlatformActionCards'
import { Card } from '@/shared/ui/Card'

type EditSubscriptionFormProps = {
  data: SubscriptionDetail
}

export function EditSubscriptionForm({ data }: EditSubscriptionFormProps) {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-4 sm:p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="relative">
              <div className="flex size-20 items-center justify-center rounded-xl bg-[#f1f5f9] text-text-muted sm:size-24">
                <ScanIcon />
              </div>
              <button
                type="button"
                className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-primary text-white shadow-md"
                aria-label="Edit subscription logo"
              >
                <EditPenIcon className="size-3.5" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-heading sm:text-2xl">Edit Subscription</h2>
              <p className="mt-1 text-sm text-text-muted">
                Fill in the information below to update Company details.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-text-muted hover:bg-surface-muted"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <form className="grid grid-cols-1 gap-5 md:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
          <CompanyFormField label="Admin Limit">
            <input className={companyInputClass} type="number" defaultValue={data.adminLimit} />
          </CompanyFormField>
          <CompanyFormField label="Admin ID">
            <input className={companyInputClass} defaultValue={data.adminId} />
          </CompanyFormField>
          <CompanyFormField label="Email Address">
            <CompanyIconInput icon={<MailIcon className="text-text-muted" />} defaultValue={data.email} />
          </CompanyFormField>
          <CompanyFormField label="Phone Number">
            <CompanyIconInput
              icon={
                <svg className="size-4 text-text-muted" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                  <path d="M3.5 1C2.95 1 2.47917 1.19583 2.0875 1.5875C1.69583 1.97917 1.5 2.45 1.5 3V4.5C1.5 9.75 6.25 14.5 11.5 14.5H13C13.55 14.5 14.0208 14.3042 14.4125 13.9125C14.8042 13.5208 15 13.05 15 12.5V10.35C15 9.93333 14.8583 9.58333 14.575 9.3C14.2917 9.01667 13.9417 8.875 13.525 8.875L10.75 9.25C10.3667 9.3 10.0208 9.45 9.7125 9.7C9.40417 9.95 9.18333 10.2667 9.05 10.65L8.5 12.25C7.16667 11.5833 6.04167 10.7083 5.125 9.625C4.20833 8.54167 3.58333 7.33333 3.25 6L4.85 5.45C5.23333 5.31667 5.55 5.09583 5.8 4.7875C6.05 4.47917 6.2 4.13333 6.25 3.75L6.625 0.975C6.625 0.558333 6.48333 0.208333 6.2 -0.075C5.91667 -0.358333 5.56667 -0.5 5.15 -0.5H3.5V1Z" />
                </svg>
              }
              defaultValue={data.phone}
            />
          </CompanyFormField>
          <CompanyFormField label="Subscription">
            <CompanySelect defaultValue={data.plan}>
              {subscriptionPlanOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </CompanySelect>
          </CompanyFormField>
          <CompanyFormField label="Customer Limit">
            <input className={companyInputClass} type="number" defaultValue={data.customerLimit} />
          </CompanyFormField>
          <CompanyFormField label="Join Date">
            <CompanyIconInput icon={<CalendarIcon className="text-text-muted" />} defaultValue="10/15/2025" />
          </CompanyFormField>
          <CompanyFormField label="Expiry Date">
            <CompanyIconInput icon={<CalendarIcon className="text-text-muted" />} defaultValue="10/15/2025" />
          </CompanyFormField>
          <CompanyFormField label="Number of Employees" className="md:col-span-2 md:max-w-[calc(50%-10px)]">
            <input className={companyInputClass} type="number" defaultValue={data.employees} />
          </CompanyFormField>

          <div className="flex justify-end gap-3 md:col-span-2">
            <Link
              to={`/subscriptions/${data.id}`}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-surface px-5 text-sm font-semibold text-heading hover:bg-surface-muted"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Card>

      <PlatformActionCards variant="subscription" />
    </div>
  )
}
