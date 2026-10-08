import type { Permission } from '@/features/auth/model/permissions'
import { resolveEnabledHubs, type CompanyHub } from '@/features/auth/model/companyHubs'

export type AccessModuleId =
  | 'dashboard'
  | 'employees'
  | 'team'
  | 'projects'
  | 'clients'
  | 'tasks'
  | 'leaves'
  | 'attendance'
  | 'expenses'
  | 'salaries'
  | 'performance'
  | 'reports'
  | 'settings'

export type CapabilityId =
  | 'dashboard.access'
  | 'employees.view'
  | 'employees.manage'
  | 'team.view'
  | 'projects.view'
  | 'projects.manage'
  | 'clients.view'
  | 'clients.manage'
  | 'tasks.view'
  | 'tasks.manage'
  | 'leaves.request'
  | 'leaves.approve'
  | 'leaves.manage'
  | 'attendance.self'
  | 'attendance.team'
  | 'attendance.manage'
  | 'attendance.settings'
  | 'expenses.view'
  | 'expenses.manage'
  | 'salaries.self'
  | 'salaries.view'
  | 'salaries.manage'
  | 'performance.view'
  | 'performance.manage'
  | 'performance.kpiSetup'
  | 'performance.roi'
  | 'reports.view'
  | 'settings.view'
  | 'settings.manage'

export type RoleCapability = {
  id: CapabilityId
  label: string
  permission: Permission
}

export type AccessModule = {
  id: AccessModuleId
  label: string
  hub: CompanyHub | null
  capabilities: RoleCapability[]
}

export const ACCESS_MODULES: AccessModule[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    hub: null,
    capabilities: [{ id: 'dashboard.access', label: 'Access dashboard', permission: 'dashboard:view' }],
  },
  {
    id: 'employees',
    label: 'Employees',
    hub: 'people',
    capabilities: [
      { id: 'employees.view', label: 'View employees', permission: 'employees:read' },
      { id: 'employees.manage', label: 'Manage employees', permission: 'employees:write' },
    ],
  },
  {
    id: 'team',
    label: 'Team',
    hub: 'people',
    capabilities: [{ id: 'team.view', label: 'View team', permission: 'team:read' }],
  },
  {
    id: 'projects',
    label: 'Projects',
    hub: 'work',
    capabilities: [
      { id: 'projects.view', label: 'View projects', permission: 'projects:read' },
      { id: 'projects.manage', label: 'Manage projects', permission: 'projects:write' },
    ],
  },
  {
    id: 'clients',
    label: 'Clients',
    hub: 'work',
    capabilities: [
      { id: 'clients.view', label: 'View clients', permission: 'clients:read' },
      { id: 'clients.manage', label: 'Manage clients', permission: 'clients:write' },
    ],
  },
  {
    id: 'tasks',
    label: 'Tasks',
    hub: 'work',
    capabilities: [
      { id: 'tasks.view', label: 'View tasks', permission: 'tasks:read' },
      { id: 'tasks.manage', label: 'Manage tasks', permission: 'tasks:write' },
    ],
  },
  {
    id: 'leaves',
    label: 'Leaves',
    hub: 'people',
    capabilities: [
      { id: 'leaves.request', label: 'Can request leave', permission: 'leave:request' },
      { id: 'leaves.approve', label: 'Can approve leave', permission: 'leave:approve' },
      { id: 'leaves.manage', label: 'Can manage leave settings', permission: 'leave:manage' },
    ],
  },
  {
    id: 'attendance',
    label: 'Attendance',
    hub: 'people',
    capabilities: [
      { id: 'attendance.self', label: 'Can mark own attendance', permission: 'attendance:self' },
      { id: 'attendance.team', label: 'Can view team attendance', permission: 'attendance:team' },
      { id: 'attendance.manage', label: 'Can manage attendance', permission: 'attendance:manage' },
      {
        id: 'attendance.settings',
        label: 'Can change attendance settings',
        permission: 'attendance:settings',
      },
    ],
  },
  {
    id: 'expenses',
    label: 'Expenses',
    hub: 'finance',
    capabilities: [
      { id: 'expenses.view', label: 'View expenses', permission: 'expenses:read' },
      { id: 'expenses.manage', label: 'Manage expenses', permission: 'expenses:write' },
    ],
  },
  {
    id: 'salaries',
    label: 'Salaries',
    hub: 'finance',
    capabilities: [
      { id: 'salaries.self', label: 'View own salary', permission: 'salaries:self' },
      { id: 'salaries.view', label: 'View salaries', permission: 'salaries:read' },
      { id: 'salaries.manage', label: 'Manage salaries', permission: 'salaries:write' },
    ],
  },
  {
    id: 'performance',
    label: 'Performance',
    hub: 'people',
    capabilities: [
      { id: 'performance.view', label: 'View performance', permission: 'performance:read' },
      { id: 'performance.manage', label: 'Manage reviews', permission: 'performance:write' },
      { id: 'performance.kpiSetup', label: 'KPI setup', permission: 'performance:kpi-setup' },
      { id: 'performance.roi', label: 'View ROI', permission: 'performance:roi:view' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    hub: null,
    capabilities: [{ id: 'reports.view', label: 'View reports', permission: 'reports:read' }],
  },
  {
    id: 'settings',
    label: 'Settings',
    hub: null,
    capabilities: [
      { id: 'settings.view', label: 'View settings', permission: 'settings:read' },
      { id: 'settings.manage', label: 'Manage settings', permission: 'settings:admin' },
    ],
  },
]

const MODULE_BY_ID = Object.fromEntries(ACCESS_MODULES.map((module) => [module.id, module])) as Record<
  AccessModuleId,
  AccessModule
>

const CAPABILITY_BY_ID = Object.fromEntries(
  ACCESS_MODULES.flatMap((module) => module.capabilities.map((cap) => [cap.id, { module, cap }])),
) as Record<CapabilityId, { module: AccessModule; cap: RoleCapability }>

const VIEW_MANAGE_PAIRS: ReadonlyArray<readonly [CapabilityId, CapabilityId]> = [
  ['employees.view', 'employees.manage'],
  ['projects.view', 'projects.manage'],
  ['clients.view', 'clients.manage'],
  ['tasks.view', 'tasks.manage'],
  ['expenses.view', 'expenses.manage'],
  ['performance.view', 'performance.manage'],
  ['settings.view', 'settings.manage'],
  ['salaries.view', 'salaries.manage'],
]

function toSet(permissions: Permission[]): Set<Permission> {
  return new Set(permissions)
}

function fromSet(set: Set<Permission>): Permission[] {
  return [...set].sort()
}

export function getVisibleAccessModules(hubs?: readonly string[] | null): AccessModule[] {
  const enabled = new Set(resolveEnabledHubs(hubs))
  return ACCESS_MODULES.filter((module) => module.hub == null || enabled.has(module.hub))
}

export function getModulePermissions(moduleId: AccessModuleId): Permission[] {
  return MODULE_BY_ID[moduleId].capabilities.map((cap) => cap.permission)
}

export function getEnabledModules(permissions: Permission[]): AccessModuleId[] {
  const set = toSet(permissions)
  return ACCESS_MODULES.filter((module) =>
    module.capabilities.some((cap) => set.has(cap.permission)),
  ).map((module) => module.id)
}

export function isModuleEnabled(permissions: Permission[], moduleId: AccessModuleId): boolean {
  const set = toSet(permissions)
  return MODULE_BY_ID[moduleId].capabilities.some((cap) => set.has(cap.permission))
}

export function isCapabilityEnabled(permissions: Permission[], capabilityId: CapabilityId): boolean {
  const entry = CAPABILITY_BY_ID[capabilityId]
  return permissions.includes(entry.cap.permission)
}

export function toggleModule(
  permissions: Permission[],
  moduleId: AccessModuleId,
  enabled: boolean,
): Permission[] {
  const set = toSet(permissions)
  const modulePerms = getModulePermissions(moduleId)

  if (!enabled) {
    for (const permission of modulePerms) set.delete(permission)
    return fromSet(set)
  }

  // Enabling a module grants its first (usually view/access) capability only.
  const first = MODULE_BY_ID[moduleId].capabilities[0]
  if (first) set.add(first.permission)
  return fromSet(set)
}

export function toggleCapability(
  permissions: Permission[],
  capabilityId: CapabilityId,
  enabled: boolean,
): Permission[] {
  const set = toSet(permissions)
  const { cap } = CAPABILITY_BY_ID[capabilityId]

  if (enabled) {
    set.add(cap.permission)

    for (const [viewId, manageId] of VIEW_MANAGE_PAIRS) {
      if (capabilityId === manageId) {
        set.add(CAPABILITY_BY_ID[viewId].cap.permission)
      }
    }

    if (capabilityId === 'attendance.settings') {
      set.add('attendance:manage')
    }

    if (capabilityId === 'salaries.self') {
      set.delete('salaries:read')
      set.delete('salaries:write')
    }

    if (capabilityId === 'salaries.view' || capabilityId === 'salaries.manage') {
      set.delete('salaries:self')
    }
  } else {
    set.delete(cap.permission)

    for (const [viewId, manageId] of VIEW_MANAGE_PAIRS) {
      if (capabilityId === viewId) {
        set.delete(CAPABILITY_BY_ID[manageId].cap.permission)
      }
    }

    if (capabilityId === 'attendance.manage') {
      set.delete('attendance:settings')
    }
  }

  return fromSet(set)
}
