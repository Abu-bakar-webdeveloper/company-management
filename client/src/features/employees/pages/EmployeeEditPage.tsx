import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { authApi } from '@/features/auth/api/authApi'
import {
  useDeleteEmployee,
  useEmployee,
  useResendEmployeeInvite,
  useUpdateEmployee,
} from '@/features/employees/hooks/useEmployees'
import { EditEmployeeForm } from '@/features/employees/ui/EditEmployeeForm'
import { ApiError, getErrorMessage } from '@/shared/api/errors'
import { FormCardSkeleton } from '@/shared/ui/DataSkeletons'

export function EmployeeEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: employee, isLoading } = useEmployee(id)
  const updateEmployee = useUpdateEmployee(id ?? '')
  const resendInvite = useResendEmployeeInvite()
  const deleteEmployee = useDeleteEmployee()

  if (isLoading) {
    return <FormCardSkeleton />
  }

  if (!employee || !id) {
    return (
      <div className="p-8">
        <p className="font-semibold text-heading">Employee not found</p>
        <Link to="/employees" className="mt-4 inline-block text-sm text-primary">
          Back to Employees
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto">
        <EditEmployeeForm
          employee={employee}
          onCancel={() => navigate(`/employees/${employee.id}`)}
          onResendInvite={
            employee.status === 'pending'
              ? async () => {
                  try {
                    await resendInvite.mutateAsync(id)
                    toast.success('Invite resent')
                  } catch (err) {
                    toast.error(getErrorMessage(err, 'Unable to resend invite'))
                    throw err
                  }
                }
              : undefined
          }
          onPasswordReset={
            employee.status === 'active'
              ? async () => {
                  try {
                    await authApi.requestPasswordReset({ email: employee.email })
                    toast.success('Password reset email sent')
                  } catch (err) {
                    toast.error(getErrorMessage(err, 'Unable to send password reset'))
                    throw err
                  }
                }
              : undefined
          }
          onDelete={async () => {
            try {
              await deleteEmployee.mutateAsync(id)
              toast.success('Employee deleted')
              navigate('/employees')
            } catch (err) {
              toast.error(getErrorMessage(err, 'Unable to delete employee'))
              throw err
            }
          }}
          onSubmit={async (values) => {
            try {
              const updated = await updateEmployee.mutateAsync(values)
              toast.success('Employee updated')
              navigate(`/employees/${employee.id}`, { state: { employee: updated } })
            } catch (err) {
              if (err instanceof ApiError) throw err
              throw new Error('Unable to save changes')
            }
          }}
        />
      </div>
    </div>
  )
}
