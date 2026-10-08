import type { CompanyDetail } from '@/features/platform/model/types'

export const mockCompanyDetails: Record<string, CompanyDetail> = {
  '1': {
    id: '1',
    name: 'Tec system',
    industry: 'Information Technology',
    email: 'Tec system@gmail.com',
    phone: '+1 (555) 000-1234',
    joinDate: 'January 15, 2024',
    status: 'active',
    plan: 'pro',
    adminId: 'EMP-9402',
    joiningDate: 'March 12, 2021',
    workLocation: 'Remote (London)',
    adminName: 'Sarah Khan',
    adminEmail: 'sarah@tecsystem.com',
    adminStatus: 'active',
    adminAvatar: 'https://i.pravatar.cc/80?img=47',
    employees: 15,
    employeeAvatars: [
      'https://i.pravatar.cc/40?img=1',
      'https://i.pravatar.cc/40?img=2',
      'https://i.pravatar.cc/40?img=3',
      'https://i.pravatar.cc/40?img=4',
    ],
  },
  '2': {
    id: '2',
    name: 'NovaSoft',
    industry: 'Software Development',
    email: 'contact@novasoft.com',
    phone: '+1 (555) 111-2222',
    joinDate: 'February 3, 2023',
    status: 'active',
    plan: 'basic',
    adminId: 'EMP-8201',
    joiningDate: 'June 8, 2020',
    workLocation: 'New York, USA',
    adminName: 'John Doe',
    adminEmail: 'admin@novasoft.com',
    adminStatus: 'active',
    employees: 12,
    employeeAvatars: [
      'https://i.pravatar.cc/40?img=5',
      'https://i.pravatar.cc/40?img=6',
      'https://i.pravatar.cc/40?img=7',
    ],
  },
}

export function getCompanyDetail(id: string): CompanyDetail | undefined {
  return mockCompanyDetails[id] ?? mockCompanyDetails['1']
}
