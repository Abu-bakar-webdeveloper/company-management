import type { EmployeeLeaveSummary } from '@/features/employees/model/types'

export const defaultLeaveSummary: EmployeeLeaveSummary = {
  year: new Date().getFullYear(),
  yearlyTaken: 12,
  remainingBalance: 8,
  pendingRequests: 1,
  totalTaken: 22,
  balances: [],
  history: [
    {
      id: '1',
      type: 'Sick Leave',
      typeColor: '#ff5c00',
      dates: 'Feb 10 - Feb 12, 2024',
      duration: '3 Days',
      reason: 'High Fever',
      status: 'approved',
    },
    {
      id: '2',
      type: 'Casual Leave',
      typeColor: '#1877f2',
      dates: 'Mar 15, 2024',
      duration: '1 Days',
      reason: 'Family Matter',
      status: 'pending',
    },
    {
      id: '3',
      type: 'Annual Leave',
      typeColor: '#00b67a',
      dates: 'Dec 20 - Dec 24, 2023',
      duration: '5 Days',
      reason: 'Vacation',
      status: 'approved',
    },
  ],
}


export function getEmployeeLeaveSummary(employeeId: string): EmployeeLeaveSummary {
  void employeeId
  return defaultLeaveSummary
}
