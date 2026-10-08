import type { StaffRole } from '@/features/auth/lib/staff-roles'
import type { Employee, EmployeeDepartment } from '@/features/employees/model/types'

function avatarUrl(id: string): string {
  const img = Number.parseInt(id, 10) % 70 || 1
  return `https://i.pravatar.cc/80?img=${img}`
}

export const departmentLabels: Record<Employee['department'], string> = {
  engineering: 'Engineering',
  design: 'Design',
  marketing: 'Marketing',
  hr: 'Human Resources',
  finance: 'Finance',
  operations: 'Operations',
}

export const statusLabels: Record<Employee['status'], string> = {
  active: 'Active',
  pending: 'Pending Invite',
  on_leave: 'On Leave',
  inactive: 'Inactive',
  suspended: 'Suspended',
}

/** System roles typically used within each department (custom roles always remain available). */
export const staffRolesByDepartment: Record<EmployeeDepartment, StaffRole[]> = {
  engineering: ['employee', 'manager'],
  design: ['employee', 'manager'],
  marketing: ['employee', 'manager'],
  hr: ['hr', 'employee', 'manager'],
  finance: ['employee', 'manager'],
  operations: ['employee', 'manager'],
}

/** Job titles filtered by department, then by system role. */
export const jobTitlesByDepartmentAndRole: Record<
  EmployeeDepartment,
  Partial<Record<StaffRole, readonly string[]>>
> = {
  engineering: {
    employee: [
      'Software Engineer',
      'Senior Developer',
      'DevOps Engineer',
      'QA Engineer',
      'Frontend Developer',
      'Backend Engineer',
    ],
    manager: ['Lead Developer', 'Tech Lead', 'Engineering Manager'],
  },
  design: {
    employee: [
      'UI Designer',
      'Product Designer',
      'UI/UX Designer',
      'Visual Designer',
      'UX Researcher',
    ],
    manager: ['Design Lead', 'Head of Design'],
  },
  marketing: {
    employee: [
      'Content Strategist',
      'SEO Specialist',
      'Marketing Specialist',
      'Brand Manager',
    ],
    manager: ['Marketing Lead', 'Marketing Manager'],
  },
  hr: {
    employee: ['Recruiter', 'HR Coordinator', 'Training Coordinator'],
    hr: ['HR Specialist', 'HR Business Partner'],
    manager: ['HR Manager', 'People Operations Lead'],
  },
  finance: {
    employee: ['Financial Analyst', 'Accountant', 'Payroll Officer', 'Budget Analyst'],
    manager: ['Finance Manager', 'Finance Lead'],
  },
  operations: {
    employee: ['Logistics Lead', 'Office Manager', 'Operations Coordinator'],
    manager: ['Operations Manager', 'Operations Lead'],
  },
}

export function getJobTitlesForDepartmentRole(
  department: EmployeeDepartment | '' | undefined,
  role: string | undefined,
): string[] {
  if (!department) return []

  const byRole = jobTitlesByDepartmentAndRole[department]
  if (!byRole) return []

  if (!role || typeof role !== 'string') return []

  if (role.startsWith('custom:')) {
    return [...new Set(Object.values(byRole).flatMap((titles) => titles ?? []))]
  }

  return [...(byRole[role as StaffRole] ?? [])]
}

export const jobTitleOptions = [
  ...new Set(
    Object.values(jobTitlesByDepartmentAndRole).flatMap((byRole) =>
      Object.values(byRole).flatMap((titles) => titles ?? []),
    ),
  ),
] as const

const PAGE_SEED_EMPLOYEES: Omit<Employee, 'id' | 'avatar'>[] = [
  {
    employeeId: 'EMP-9402',
    fullName: 'Naeem Ashraf',
    firstName: 'Naeem',
    lastName: 'Ashraf',
    email: 'naeemashraf@gmail.com',
    phone: '+1 (555) 000-1234',
    cnic: '42101-1234567-1',
    homeAddress: 'London, UK',
    department: 'design',
    jobTitle: 'UI Designer',
    status: 'active',
    joinDate: '2024-01-15',
    workLocation: 'Remote (London)',
    employmentType: 'Full-time',
    managerName: 'Sarah Khan',
    managerAvatar: 'https://i.pravatar.cc/80?img=47',
    reporteesCount: 4,
  },
  {
    employeeId: 'EMP-002',
    fullName: 'John Doe',
    email: 'john.doe@bizflow.com',
    phone: '+1 555 234 5678',
    department: 'operations',
    jobTitle: 'Operations Manager',
    status: 'active',
    joinDate: '2022-06-15',
  },
  {
    employeeId: 'EMP-003',
    fullName: 'Sara Khan',
    email: 'sara.khan@bizflow.com',
    phone: '+92 321 9876543',
    department: 'design',
    jobTitle: 'UI/UX Designer',
    status: 'on_leave',
    joinDate: '2023-03-08',
  },
  {
    employeeId: 'EMP-004',
    fullName: 'Emily Chen',
    email: 'emily.chen@bizflow.com',
    phone: '+1 555 876 5432',
    department: 'marketing',
    jobTitle: 'Marketing Lead',
    status: 'inactive',
    joinDate: '2021-11-20',
  },
  {
    employeeId: 'EMP-005',
    fullName: 'Michael Brown',
    email: 'michael.brown@bizflow.com',
    phone: '+44 20 7946 0958',
    department: 'finance',
    jobTitle: 'Financial Analyst',
    status: 'active',
    joinDate: '2020-05-12',
  },
  {
    employeeId: 'EMP-006',
    fullName: 'Fatima Noor',
    email: 'fatima.noor@bizflow.com',
    phone: '+92 333 4455667',
    department: 'hr',
    jobTitle: 'HR Specialist',
    status: 'active',
    joinDate: '2024-02-01',
  },
  {
    employeeId: 'EMP-007',
    fullName: 'David Wilson',
    email: 'david.wilson@bizflow.com',
    phone: '+1 555 111 2233',
    department: 'engineering',
    jobTitle: 'DevOps Engineer',
    status: 'inactive',
    joinDate: '2019-07-22',
  },
  {
    employeeId: 'EMP-008',
    fullName: 'Aisha Malik',
    email: 'aisha.malik@bizflow.com',
    phone: '+92 345 7788990',
    department: 'design',
    jobTitle: 'Product Designer',
    status: 'active',
    joinDate: '2024-06-04',
  },
]

const EXTRA_NAMES = [
  ['Omar', 'Hassan', 'engineering', 'Backend Engineer', 'active'],
  ['Lisa', 'Park', 'marketing', 'Content Strategist', 'active'],
  ['James', 'Miller', 'finance', 'Accountant', 'on_leave'],
  ['Nina', 'Patel', 'design', 'Visual Designer', 'active'],
  ['Carlos', 'Rivera', 'operations', 'Logistics Lead', 'active'],
  ['Emma', 'Wright', 'hr', 'Recruiter', 'active'],
  ['Ryan', 'Cooper', 'engineering', 'QA Engineer', 'inactive'],
  ['Zara', 'Ahmed', 'marketing', 'SEO Specialist', 'active'],
  ['Tom', 'Baker', 'finance', 'Payroll Officer', 'active'],
  ['Mia', 'Johnson', 'design', 'UX Researcher', 'on_leave'],
  ['Kevin', 'Lee', 'engineering', 'Frontend Developer', 'active'],
  ['Sofia', 'Garcia', 'operations', 'Office Manager', 'active'],
  ['Ben', 'Scott', 'hr', 'Training Coordinator', 'active'],
  ['Priya', 'Sharma', 'marketing', 'Brand Manager', 'inactive'],
  ['Alex', 'Turner', 'engineering', 'Tech Lead', 'active'],
  ['Hannah', 'Brooks', 'finance', 'Budget Analyst', 'active'],
] as const

function buildExtraEmployee(index: number): Omit<Employee, 'id' | 'avatar'> {
  const [first, last, department, jobTitle, status] = EXTRA_NAMES[index % EXTRA_NAMES.length]
  const num = 9 + index
  return {
    employeeId: `EMP-${String(num).padStart(3, '0')}`,
    fullName: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@bizflow.com`,
    phone: '+1 555 000 0000',
    department: department as Employee['department'],
    jobTitle,
    status: status as Employee['status'],
    joinDate: `202${index % 4}-${String((index % 12) + 1).padStart(2, '0')}-15`,
  }
}

export const mockEmployees: Employee[] = [
  ...PAGE_SEED_EMPLOYEES.map((employee, index) => ({
    ...employee,
    id: String(index + 1),
    avatar: avatarUrl(String(index + 1)),
  })),
  ...Array.from({ length: 16 }, (_, index) => {
    const id = String(PAGE_SEED_EMPLOYEES.length + index + 1)
    return {
      ...buildExtraEmployee(index),
      id,
      avatar: avatarUrl(id),
    }
  }),
]
