import { apiClient } from '@/shared/api/axios'
import type { SalaryFormValues } from '@/features/salaries/model/schemas'
import type {
  CompanyPayrollSettings,
  EmployeeCompensation,
  EmployeeLoan,
  EmployeeSalaryDefaults,
  PayrollAssignment,
  PayrollComponent,
  Salary,
  SalaryStats,
  SalaryStatus,
} from '@/features/salaries/model/types'

type ListResult = {
  salaries: Salary[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function filenameFromDisposition(header: string | undefined, fallback: string): string {
  if (!header) return fallback
  const match = /filename="?([^"]+)"?/i.exec(header)
  return match?.[1] ?? fallback
}

export const salariesApi = {
  async list(params?: {
    page?: number
    limit?: number
    search?: string
    department?: string
    status?: SalaryStatus
    employeeId?: string
    period?: 'all' | 'this_month' | 'last_month'
    month?: number
    year?: number
  }): Promise<Salary[]> {
    const { data } = await apiClient.get<ListResult>('/salaries', {
      params: { limit: 100, ...params },
    })
    return data.salaries
  },

  async listMine(params?: {
    page?: number
    limit?: number
    month?: number
    year?: number
    status?: SalaryStatus
  }): Promise<Salary[]> {
    const { data } = await apiClient.get<ListResult>('/salaries/me', {
      params: { limit: 100, ...params },
    })
    return data.salaries
  },

  async getPf(employeeId: string): Promise<{
    employeeId: string
    balance: number
    entries: {
      id: string
      year: number
      month: number
      employeeAmount: number
      employerAmount: number
      type: string
      note?: string
      createdAt: string
    }[]
  }> {
    const { data } = await apiClient.get<{
      pf: {
        employeeId: string
        balance: number
        entries: {
          id: string
          year: number
          month: number
          employeeAmount: number
          employerAmount: number
          type: string
          note?: string
          createdAt: string
        }[]
      }
    }>(`/salaries/pf/${employeeId}`)
    return data.pf
  },

  async getMyPf(): Promise<{
    employeeId: string
    balance: number
    entries: {
      id: string
      year: number
      month: number
      employeeAmount: number
      employerAmount: number
      type: string
      note?: string
      createdAt: string
    }[]
  }> {
    const { data } = await apiClient.get<{
      pf: {
        employeeId: string
        balance: number
        entries: {
          id: string
          year: number
          month: number
          employeeAmount: number
          employerAmount: number
          type: string
          note?: string
          createdAt: string
        }[]
      }
    }>('/salaries/me/pf')
    return data.pf
  },

  async getStats(params?: { month?: number; year?: number }): Promise<SalaryStats> {
    const { data } = await apiClient.get<{ stats: SalaryStats }>('/salaries/stats', {
      params,
    })
    return data.stats
  },

  async getById(id: string): Promise<Salary> {
    const { data } = await apiClient.get<{ salary: Salary }>(`/salaries/${id}`)
    return data.salary
  },

  async getEmployeeDefaults(employeeId: string): Promise<EmployeeSalaryDefaults> {
    const { data } = await apiClient.get<{ defaults: EmployeeSalaryDefaults }>(
      `/salaries/employee-defaults/${employeeId}`,
    )
    return data.defaults
  },

  async create(values: SalaryFormValues): Promise<Salary> {
    const { data } = await apiClient.post<{ salary: Salary }>('/salaries', values)
    return data.salary
  },

  async generateMonth(params?: { month?: number; year?: number }): Promise<{
    created: number
    skipped: number
    month: number
    year: number
  }> {
    const { data } = await apiClient.post<{
      created: number
      skipped: number
      month: number
      year: number
    }>('/salaries/generate-month', params ?? {})
    return data
  },

  async update(id: string, values: Partial<SalaryFormValues>): Promise<Salary> {
    const { data } = await apiClient.patch<{ salary: Salary }>(`/salaries/${id}`, values)
    return data.salary
  },

  async updateStatus(id: string, status: SalaryStatus): Promise<Salary> {
    const { data } = await apiClient.patch<{ salary: Salary }>(`/salaries/${id}/status`, {
      status,
    })
    return data.salary
  },

  async bulkUpdateStatus(ids: string[], status: SalaryStatus): Promise<{ updated: number }> {
    const { data } = await apiClient.patch<{ updated: number }>('/salaries/bulk-status', {
      ids,
      status,
    })
    return data
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/salaries/${id}`)
  },

  async downloadSlip(id: string, fallbackName = 'salary-slip.pdf'): Promise<void> {
    const response = await apiClient.get<Blob>(`/salaries/${id}/slip`, {
      responseType: 'blob',
    })

    const contentType = String(response.headers['content-type'] ?? '')
    if (contentType.includes('application/json')) {
      const text = await response.data.text()
      let message = 'Download failed'
      try {
        const parsed = JSON.parse(text) as { error?: { message?: string } }
        message = parsed.error?.message ?? message
      } catch {
        // ignore
      }
      throw new Error(message)
    }

    const filename = filenameFromDisposition(
      response.headers['content-disposition'] as string | undefined,
      fallbackName,
    )
    triggerBlobDownload(response.data, filename)
  },

  async getSettings(): Promise<CompanyPayrollSettings> {
    const { data } = await apiClient.get<{ settings: CompanyPayrollSettings }>(
      '/salaries/settings',
    )
    return data.settings
  },

  async updateSettings(
    payload: Partial<
      Pick<CompanyPayrollSettings, 'pf' | 'leavePolicy' | 'incrementPolicy'>
    >,
  ): Promise<CompanyPayrollSettings> {
    const { data } = await apiClient.put<{ settings: CompanyPayrollSettings }>(
      '/salaries/settings',
      payload,
    )
    return data.settings
  },

  async getCompensation(employeeId: string): Promise<EmployeeCompensation> {
    const { data } = await apiClient.get<{
      compensation: EmployeeCompensation
    }>(`/salaries/employees/${employeeId}/compensation`)
    return data.compensation
  },

  async createCompensationEvent(
    employeeId: string,
    payload: {
      effectiveFrom: string
      type: 'increment' | 'confirmation' | 'correction' | 'structure_change'
      basic: number
      allowances?: { HRA?: number; UTILITY?: number; CONVEYANCE?: number }
      reason?: string
      setPermanent?: boolean
      regeneratePending?: boolean
    },
  ): Promise<{ event: unknown; regenerated: number }> {
    const { data } = await apiClient.post<{ event: unknown; regenerated: number }>(
      `/salaries/employees/${employeeId}/compensation`,
      payload,
    )
    return data
  },

  async listAssignments(employeeId: string): Promise<PayrollAssignment[]> {
    const { data } = await apiClient.get<{
      assignments: PayrollAssignment[]
    }>(`/salaries/employees/${employeeId}/assignments`)
    return data.assignments
  },

  async createAssignment(
    employeeId: string,
    payload: {
      componentCode: string
      kind: 'earning' | 'deduction'
      amount: number
      startMonth: number
      startYear: number
      endMonth?: number | null
      endYear?: number | null
      note?: string
    },
  ): Promise<PayrollAssignment> {
    const { data } = await apiClient.post<{ assignment: PayrollAssignment }>(
      `/salaries/employees/${employeeId}/assignments`,
      payload,
    )
    return data.assignment
  },

  async deleteAssignment(employeeId: string, assignmentId: string): Promise<void> {
    await apiClient.delete(
      `/salaries/employees/${employeeId}/assignments/${assignmentId}`,
    )
  },

  async listLoans(employeeId: string): Promise<EmployeeLoan[]> {
    const { data } = await apiClient.get<{ loans: EmployeeLoan[] }>(
      `/salaries/employees/${employeeId}/loans`,
    )
    return data.loans
  },

  async createLoan(
    employeeId: string,
    payload: {
      principal: number
      installmentAmount: number
      startMonth: number
      startYear: number
      issueInPayroll?: boolean
      note?: string
    },
  ): Promise<EmployeeLoan> {
    const { data } = await apiClient.post<{ loan: EmployeeLoan }>(
      `/salaries/employees/${employeeId}/loans`,
      payload,
    )
    return data.loan
  },

  async cancelLoan(employeeId: string, loanId: string): Promise<EmployeeLoan> {
    const { data } = await apiClient.post<{ loan: EmployeeLoan }>(
      `/salaries/employees/${employeeId}/loans/${loanId}/cancel`,
    )
    return data.loan
  },

  async listIncrementDue(): Promise<
    {
      employeeId: string
      employeeName: string
      message: string
      stage: 'probation' | 'permanent'
      kind: 'probation_review' | 'increment_cycle'
      nextEligibleOn: string | null
    }[]
  > {
    const { data } = await apiClient.get<{
      due: {
        employeeId: string
        employeeName: string
        message: string
        stage: 'probation' | 'permanent'
        kind: 'probation_review' | 'increment_cycle'
        nextEligibleOn: string | null
      }[]
    }>('/salaries/increment-due')
    return data.due
  },

  async createComponent(payload: {
    name: string
    kind: 'earning' | 'deduction'
    code?: string
    calcType?: 'fixed' | 'percent_of_basic'
    defaultValue?: number
  }): Promise<PayrollComponent> {
    const { data } = await apiClient.post<{ component: PayrollComponent }>(
      '/salaries/settings/components',
      payload,
    )
    return data.component
  },

  async updateComponent(
    id: string,
    payload: Partial<{
      name: string
      active: boolean
      defaultValue: number
      calcType: 'fixed' | 'percent_of_basic'
    }>,
  ): Promise<PayrollComponent> {
    const { data } = await apiClient.patch<{ component: PayrollComponent }>(
      `/salaries/settings/components/${id}`,
      payload,
    )
    return data.component
  },

  async deleteComponent(id: string): Promise<void> {
    await apiClient.delete(`/salaries/settings/components/${id}`)
  },
}
