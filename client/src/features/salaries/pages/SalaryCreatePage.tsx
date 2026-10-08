import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { salariesApi } from '@/features/salaries/api/salariesApi'
import { SalaryForm } from '@/features/salaries/ui/SalaryForm'
import { ArrowLeftIcon } from '@/shared/ui/icons'

export function SalaryCreatePage() {
  const navigate = useNavigate()

  return (
    <div className="p-8">
      <Link
        to="/salaries"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-heading"
      >
        <ArrowLeftIcon className="text-text-muted" />
        Back to Salaries
      </Link>

      <header className="mb-6">
        <h1 className="text-[30px] font-bold leading-9 text-heading">Add Monthly Payroll</h1>
        <p className="mt-1 text-base leading-6 text-text-muted">
          Create a salary record for an employee. Defaults are loaded from their compensation profile.
        </p>
      </header>

      <SalaryForm
        mode="create"
        onCancel={() => navigate('/salaries')}
        onSubmit={async (values) => {
          const created = await salariesApi.create(values)
          toast.success('Payroll record created')
          navigate(`/salaries/${created.id}`)
        }}
      />
    </div>
  )
}
