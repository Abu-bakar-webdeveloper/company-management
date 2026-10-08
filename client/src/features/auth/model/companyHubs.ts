import type { Permission } from '@/features/auth/model/permissions'

export const COMPANY_HUBS = ['people', 'finance', 'work'] as const

export type CompanyHub = (typeof COMPANY_HUBS)[number]

export const COMPANY_HUB_LABELS: Record<CompanyHub, string> = {
  people: 'Workforce',
  finance: 'Payroll',
  work: 'Delivery',
}

export const COMPANY_HUB_DESCRIPTIONS: Record<CompanyHub, string> = {
  people: 'Employees, team, leave, attendance, and performance',
  finance: 'Salaries and expenses',
  work: 'Projects, tasks, and clients',
}

export const HUB_PERMISSIONS: Record<CompanyHub, readonly Permission[]> = {
  people: [
    'employees:read',
    'employees:write',
    'team:read',
    'leave:manage',
    'leave:approve',
    'leave:request',
    'attendance:self',
    'attendance:team',
    'attendance:manage',
    'attendance:settings',
    'performance:read',
    'performance:write',
    'performance:kpi-setup',
    'performance:roi:view',
  ],
  finance: [
    'salaries:read',
    'salaries:write',
    'salaries:self',
    'expenses:read',
    'expenses:write',
  ],
  work: [
    'projects:read',
    'projects:write',
    'tasks:read',
    'tasks:write',
    'clients:read',
    'clients:write',
  ],
}

export const REPORT_TYPE_HUB = {
  employees: 'people',
  leaves: 'people',
  performance: 'people',
  expenses: 'finance',
  projects: 'work',
} as const

export function resolveEnabledHubs(hubs?: readonly string[] | null): CompanyHub[] {
  const allowed = new Set<string>(COMPANY_HUBS)
  const unique = [...new Set((hubs ?? []).filter((hub): hub is CompanyHub => allowed.has(hub)))]
  return unique.length > 0 ? unique : [...COMPANY_HUBS]
}

export function isCompanyHubEnabled(
  hubs: readonly string[] | null | undefined,
  hub: CompanyHub,
): boolean {
  return resolveEnabledHubs(hubs).includes(hub)
}

export function companyHubListLabel(hubs?: readonly string[] | null): string {
  const labels = resolveEnabledHubs(hubs).map((hub) => COMPANY_HUB_LABELS[hub])
  if (labels.length === 1) return labels[0]
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`
  return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`
}

export function filterPermissionsForHubs(
  permissions: Permission[],
  hubs: readonly CompanyHub[],
): Permission[] {
  const enabled = new Set(hubs)
  const blocked = new Set<Permission>()
  for (const hub of COMPANY_HUBS) {
    if (enabled.has(hub)) continue
    for (const permission of HUB_PERMISSIONS[hub]) blocked.add(permission)
  }
  return permissions.filter((permission) => !blocked.has(permission))
}
