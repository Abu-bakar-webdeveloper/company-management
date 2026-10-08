import { Link, useNavigate } from 'react-router-dom'
import {
  startAsOptions,
  subscriptionPlanOptions,
} from '@/features/platform/model/companiesFormData'
import { CompanyFormSection } from '@/features/platform/ui/CompanyFormSection'
import {
  CompanyFormField,
  companyInputClass,
} from '@/features/platform/ui/CompanyFormField'
import { CompanyIconInput, CompanySelect } from '@/features/platform/ui/CompanyFormControls'
import {
  BuildingSectionIcon,
  CalendarIcon,
  MailIcon,
} from '@/features/platform/ui/icons'
import { Card } from '@/shared/ui/Card'

export function AddSubscriptionForm() {
  const navigate = useNavigate()

  return (
    <Card className="overflow-hidden">
      <form
        className="p-4 sm:p-6"
        onSubmit={(e) => {
          e.preventDefault()
          navigate('/subscriptions')
        }}
      >
        <CompanyFormSection
          icon={<BuildingSectionIcon />}
          title="Add Subscription"
          subtitle="Basic details about your organization."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <CompanyFormField label="Company Name">
              <input className={companyInputClass} placeholder="Amazigh Innovations" />
            </CompanyFormField>
            <CompanyFormField label="Email Address">
              <input className={companyInputClass} placeholder="info@company.com" />
            </CompanyFormField>
            <CompanyFormField label="Admin Full Name">
              <input className={companyInputClass} placeholder="e.g. Naeem" />
            </CompanyFormField>
            <CompanyFormField label="Admin Email">
              <CompanyIconInput icon={<MailIcon className="text-text-muted" />} placeholder="admin@company.com" />
            </CompanyFormField>
            <CompanyFormField label="Start Date">
              <CompanyIconInput icon={<CalendarIcon className="text-text-muted" />} placeholder="MM/DD/YYYY" />
            </CompanyFormField>
            <CompanyFormField label="Expiry Date">
              <CompanyIconInput icon={<CalendarIcon className="text-text-muted" />} placeholder="MM/DD/YYYY" />
            </CompanyFormField>
            <CompanyFormField label="Subscription Plan">
              <CompanySelect defaultValue="basic">
                {subscriptionPlanOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </CompanySelect>
            </CompanyFormField>
            <CompanyFormField label="Customer Limit">
              <input className={companyInputClass} placeholder="155" />
            </CompanyFormField>
            <CompanyFormField label="Company Phone Number">
              <input className={companyInputClass} placeholder="+92 300 1234567" />
            </CompanyFormField>
            <CompanyFormField label="Start As">
              <CompanySelect defaultValue="active">
                {startAsOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </CompanySelect>
            </CompanyFormField>
            <CompanyFormField label="Features">
              <CompanySelect defaultValue="auction">
                <option value="auction">Auction Access</option>
                <option value="reports">Advanced Reports</option>
              </CompanySelect>
            </CompanyFormField>
            <CompanyFormField label="Admin Limit">
              <input className={companyInputClass} placeholder="5" />
            </CompanyFormField>
          </div>
        </CompanyFormSection>

        <div className="mt-6 flex justify-end gap-3 border-t border-border-card pt-6">
          <Link
            to="/subscriptions"
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
  )
}
