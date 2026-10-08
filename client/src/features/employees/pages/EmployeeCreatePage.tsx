import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useCreateEmployee } from '@/features/employees/hooks/useEmployees'
import { AddEmployeeForm } from '@/features/employees/ui/AddEmployeeForm'
import { ApiError } from '@/shared/api/errors'

export function EmployeeCreatePage() {
  const navigate = useNavigate()
  const createEmployee = useCreateEmployee()

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto">
        <AddEmployeeForm
          isSubmitting={createEmployee.isPending}
          onCancel={() => navigate('/employees')}
          onSubmit={async (values) => {
            try {
              const result = await createEmployee.mutateAsync(values)
              toast.success('Employee created')
              navigate(`/employees/${result.employee.id}`, {
                state: { employee: result.employee },
              })
            } catch (err) {
              if (err instanceof ApiError) {
                throw err
              }
              throw new Error('Unable to create employee')
            }
          }}
        />
      </div>
    </div>
  )
}
