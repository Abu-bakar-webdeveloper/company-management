import type { Project, ProjectTeamMember } from '@/features/projects/model/types'

function avatarUrl(id: string): string {
  const img = Number.parseInt(id, 10) % 70 || 1
  return `https://i.pravatar.cc/80?img=${img}`
}

export const statusLabels: Record<Project['status'], string> = {
  in_progress: 'In Progress',
  completed: 'Completed',
  delayed: 'Delayed',
}

export const priorityLabels: Record<Project['priority'], string> = {
  low: 'Low Priority',
  medium: 'Medium Priority',
  high: 'High Priority',
}

export const managerOptions = [
  { id: '1', name: 'Sarah Khan', avatar: avatarUrl('47') },
  { id: '2', name: 'John Doe', avatar: avatarUrl('12') },
  { id: '3', name: 'Ali Raza', avatar: avatarUrl('33') },
  { id: '4', name: 'Naeem Ashraf', avatar: avatarUrl('68') },
] as const

const defaultTeam: ProjectTeamMember[] = [
  { id: 't1', name: 'John Doe', jobTitle: 'Senior Developer', avatar: avatarUrl('12') },
  { id: 't2', name: 'Ali Raza', jobTitle: 'Lead Developer', avatar: avatarUrl('33') },
]

const PAGE_SEED_PROJECTS: Omit<Project, 'id'>[] = [
  {
    projectCode: 'PRJ-0001',
    name: 'Cloud Migration',
    description: 'Infrastructure update & scaling',
    managerId: '1',
    managerName: 'Sarah Khan',
    managerAvatar: avatarUrl('47'),
    team: [
      ...defaultTeam,
      { id: 't3', name: 'Mike Chen', jobTitle: 'DevOps Engineer', avatar: avatarUrl('15') },
      { id: 't4', name: 'Emma Wilson', jobTitle: 'Product Designer', avatar: avatarUrl('25') },
      { id: 't5', name: 'Tom Lee', jobTitle: 'Software Engineer', avatar: avatarUrl('41') },
      { id: 't6', name: 'Lisa Park', jobTitle: 'UI Designer', avatar: avatarUrl('52') },
    ],
    startDate: '2026-01-12',
    endDate: '2026-03-20',
    status: 'in_progress',
    priority: 'high',
    progress: 45,
  },
  {
    projectCode: 'PRJ-0002',
    name: 'CRM Integration',
    description: 'Customer data sync with Salesforce',
    managerId: '2',
    managerName: 'John Doe',
    managerAvatar: avatarUrl('12'),
    team: Array.from({ length: 7 }, (_, i) => ({
      id: `crm-${i}`,
      name: `Member ${i + 1}`,
      jobTitle: 'Software Engineer',
      avatar: avatarUrl(String(i + 20)),
    })),
    startDate: '2025-11-01',
    endDate: '2026-01-15',
    status: 'completed',
    priority: 'medium',
    progress: 100,
  },
  {
    projectCode: 'PRJ-0003',
    name: 'Cybersecurity Audit',
    description: 'Q4 security compliance check',
    managerId: '3',
    managerName: 'Ali Raza',
    managerAvatar: avatarUrl('33'),
    team: [
      { id: 'cs1', name: 'Dev One', jobTitle: 'Security Engineer', avatar: avatarUrl('5') },
      { id: 'cs2', name: 'Dev Two', jobTitle: 'Backend Developer', avatar: avatarUrl('8') },
    ],
    startDate: '2025-10-05',
    endDate: '2025-10-25',
    status: 'completed',
    priority: 'high',
    progress: 100,
  },
  {
    projectCode: 'PRJ-0004',
    name: 'E-commerce Redesign',
    description: 'UI/UX overhaul for checkout flow',
    managerId: '4',
    managerName: 'Naeem Ashraf',
    managerAvatar: avatarUrl('68'),
    team: Array.from({ length: 5 }, (_, i) => ({
      id: `eco-${i}`,
      name: `Designer ${i + 1}`,
      jobTitle: 'UI Designer',
      avatar: avatarUrl(String(i + 30)),
    })),
    startDate: '2026-02-01',
    endDate: '2026-04-30',
    status: 'in_progress',
    priority: 'medium',
    progress: 62,
  },
  {
    projectCode: 'PRJ-0005',
    name: 'Marketing Campaign',
    description: 'Q2 Social media push',
    managerId: '1',
    managerName: 'Sarah Khan',
    managerAvatar: avatarUrl('47'),
    team: Array.from({ length: 8 }, (_, i) => ({
      id: `mkt-${i}`,
      name: `Marketer ${i + 1}`,
      jobTitle: 'Marketing Lead',
      avatar: avatarUrl(String(i + 40)),
    })),
    startDate: '2026-04-01',
    endDate: '2026-06-30',
    status: 'delayed',
    priority: 'low',
    progress: 28,
  },
  {
    projectCode: 'PRJ-0006',
    name: 'car auction',
    description: 'auction and shipping vehicle',
    managerId: '4',
    managerName: 'Naeem Ashraf',
    managerAvatar: avatarUrl('68'),
    team: [
      { id: 'ca1', name: 'Naeem Ashraf', jobTitle: 'Project Lead', avatar: avatarUrl('68') },
      { id: 'ca2', name: 'Sarah Khan', jobTitle: 'UI Designer', avatar: avatarUrl('47') },
      { id: 'ca3', name: 'John Doe', jobTitle: 'Backend Developer', avatar: avatarUrl('12') },
      { id: 'ca4', name: 'Ali Raza', jobTitle: 'Frontend Developer', avatar: avatarUrl('33') },
    ],
    startDate: '2026-03-04',
    endDate: '2026-04-11',
    status: 'in_progress',
    priority: 'high',
    progress: 0,
    image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop',
  },
]

function generateExtraProjects(): Omit<Project, 'id'>[] {
  const templates = [
    { name: 'Mobile App Launch', desc: 'Native iOS and Android release', status: 'in_progress' as const },
    { name: 'Data Warehouse', desc: 'Central analytics platform', status: 'in_progress' as const },
    { name: 'HR Portal', desc: 'Employee self-service portal', status: 'completed' as const },
    { name: 'API Gateway', desc: 'Microservices gateway setup', status: 'in_progress' as const },
    { name: 'Brand Refresh', desc: 'Visual identity update', status: 'delayed' as const },
    { name: 'Inventory System', desc: 'Stock management automation', status: 'completed' as const },
    { name: 'Training Platform', desc: 'LMS for employee onboarding', status: 'in_progress' as const },
    { name: 'Payment Gateway', desc: 'Stripe integration rollout', status: 'completed' as const },
    { name: 'Support Chatbot', desc: 'AI-powered customer support', status: 'in_progress' as const },
    { name: 'Office Relocation', desc: 'HQ move coordination', status: 'delayed' as const },
    { name: 'Compliance Review', desc: 'Annual regulatory audit', status: 'completed' as const },
    { name: 'DevOps Pipeline', desc: 'CI/CD infrastructure upgrade', status: 'in_progress' as const },
    { name: 'Partner Portal', desc: 'B2B partner access platform', status: 'in_progress' as const },
    { name: 'Email Migration', desc: 'Move to cloud email provider', status: 'completed' as const },
    { name: 'Sales Dashboard', desc: 'Real-time sales analytics', status: 'in_progress' as const },
    { name: 'Vendor Management', desc: 'Supplier relationship system', status: 'delayed' as const },
    { name: 'Knowledge Base', desc: 'Internal documentation hub', status: 'completed' as const },
    { name: 'Network Upgrade', desc: 'Office network infrastructure', status: 'in_progress' as const },
  ]

  return templates.map((t, i) => {
    const manager = managerOptions[i % managerOptions.length]
    return {
      projectCode: `PRJ-${String(i + 7).padStart(4, '0')}`,
      name: t.name,
      description: t.desc,
      managerId: manager.id,
      managerName: manager.name,
      managerAvatar: manager.avatar,
      team: defaultTeam,
      startDate: `2026-0${(i % 9) + 1}-01`,
      endDate: `2026-0${(i % 9) + 2}-28`,
      status: t.status,
      priority: (['low', 'medium', 'high'] as const)[i % 3],
      progress: t.status === 'completed' ? 100 : t.status === 'delayed' ? 35 : 55,
    }
  })
}

export const mockProjects: Project[] = [...PAGE_SEED_PROJECTS, ...generateExtraProjects()].map(
  (project, index) => ({
    ...project,
    id: String(index + 1),
  }),
)
