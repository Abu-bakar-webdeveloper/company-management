import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { salariesApi } from '@/features/salaries/api/salariesApi'
import type { Salary } from '@/features/salaries/model/types'
import { SalaryForm } from '@/features/salaries/ui/SalaryForm'
import { ArrowLeftIcon } from '@/shared/ui/icons'

export function SalaryEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [salary, setSalary] = useState<Salary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    void salariesApi
      .getById(id)
      .then(setSalary)
      .catch(() => setSalary(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <p className="text-sm text-text-muted">Loading…</p>
      </div>
    )
  }

  if (!salary) {
    return (
      <div className="p-8">
        <p className="font-semibold text-heading">Salary record not found</p>
        <Link to="/salaries" className="mt-4 inline-block text-sm text-[#1877f2]">
          Back to Salaries
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8">
      <Link
        to={`/salaries/${salary.id}`}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-heading"
      >
        <ArrowLeftIcon className="text-text-muted" />
        Back to Details
      </Link>

      <header className="mb-6">
        <h1 className="text-[30px] font-bold leading-9 text-heading">Edit Payroll</h1>
        <p className="mt-1 text-base leading-6 text-text-muted">
          Update earnings, deductions, or status for {salary.employeeName} — {salary.payPeriodLabel}.
        </p>
      </header>

      <SalaryForm
        mode="edit"
        initial={salary}
        onCancel={() => navigate(`/salaries/${salary.id}`)}
        onSubmit={async (values) => {
          const updated = await salariesApi.update(salary.id, {
            status: values.status,
            description: values.description,
            earnings: values.earnings,
            deductions: values.deductions,
            applyToEmployeeDefaults: values.applyToEmployeeDefaults,
          })
          toast.success('Payroll updated')
          navigate(`/salaries/${updated.id}`)
        }}
      />
    </div>
  )
}
