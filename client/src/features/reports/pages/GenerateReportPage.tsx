import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/model/AuthContext'
import { reportsApi } from '@/features/reports/api/reportsApi'
import { isGeneratableModule } from '@/features/reports/lib/report-utils'
import type { GenerateReportValues, GeneratableReportModule } from '@/features/reports/model/types'
import { GenerateReportForm } from '@/features/reports/ui/GenerateReportForm'
import { ArrowLeftIcon } from '@/shared/ui/icons'

const FORM_ID = 'generate-report-form'

export function GenerateReportPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (user?.role === 'superadmin') {
    return <Navigate to="/reports" replace />
  }

  const typeParam = searchParams.get('type')
  const initialReportType: GeneratableReportModule | undefined = isGeneratableModule(typeParam)
    ? typeParam
    : undefined

  const handleSubmit = async (values: GenerateReportValues) => {
    setSubmitting(true)
    setError(null)
    try {
      const { id } = await reportsApi.generate(values)
      navigate(`/reports/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link
        to="/reports"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-heading"
      >
        <ArrowLeftIcon className="text-text-muted" />
        Back to Reports
      </Link>

      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold leading-8 text-heading sm:text-[30px] sm:leading-9">
            Generate Report
          </h1>
          <p className="mt-1 text-sm leading-6 text-text-muted sm:text-base">
            Create custom report based on filters.
          </p>
          {error ? <p className="mt-2 text-sm text-[#DC2626]">{error}</p> : null}
        </div>
        <button
          type="submit"
          form={FORM_ID}
          disabled={submitting}
          className="inline-flex h-10 w-full shrink-0 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95 disabled:opacity-70 sm:w-auto"
        >
          {submitting ? 'Generating…' : 'Generate'}
        </button>
      </header>

      <GenerateReportForm
        id={FORM_ID}
        initialReportType={initialReportType}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/reports')}
        submitting={submitting}
      />
    </div>
  )
}
