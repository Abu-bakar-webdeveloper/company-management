import type { AuthUser } from '@/features/auth/model/types'

export type MockUserRecord = AuthUser & { password: string }

export const MOCK_USERS: MockUserRecord[] = [
  {
    id: '0',
    email: 'superadmin@bizflow.com',
    password: 'SuperAdmin123!',
    fullName: 'Platform Superadmin',
    role: 'superadmin',
    status: 'active',
    companyId: null,
  },
  {
    id: '1',
    email: 'admin@bizflow.com',
    password: 'Admin123!',
    fullName: 'John Doe',
    role: 'admin',
    status: 'active',
    companyId: '1',
  },
  {
    id: '2',
    email: 'manager@bizflow.com',
    password: 'Manager123!',
    fullName: 'Sarah Khan',
    role: 'manager',
    status: 'active',
    companyId: '1',
  },
  {
    id: '3',
    email: 'employee@bizflow.com',
    password: 'Employee123!',
    fullName: 'Ali Raza',
    role: 'employee',
    status: 'active',
    companyId: '1',
  },
  {
    id: '4',
    email: 'hr@bizflow.com',
    password: 'Hr123!',
    fullName: 'Emily Chen',
    role: 'hr',
    status: 'active',
    companyId: '1',
  },
]
