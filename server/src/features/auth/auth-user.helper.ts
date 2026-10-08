import type { AuthUser } from './auth.types.js'
import type { Permission } from './permissions.js'
import { resolveUserPermissions } from './permissions.js'
import {
  filterPermissionsForHubs,
  getCompanyEnabledHubs,
  type CompanyHub,
} from '../companies/company-hubs.js'
import { CompanyRole } from '../roles/companyRole.model.js'
import type { IUser } from './user.model.js'
import { User } from './user.model.js'

export async function enrichAuthUser(
  user: IUser,
  options: { includeReporteesCount?: boolean } = {},
): Promise<AuthUser> {
  const base = user.toAuthUser()

  let managerName: string | undefined
  let managerAvatar: string | undefined
  if (user.managerId) {
    const manager = await User.findById(user.managerId).select('fullName avatar')
    if (manager) {
      managerName = manager.fullName
      if (manager.avatar) managerAvatar = manager.avatar
    }
  }

  let reporteesCount: number | undefined
  if (options.includeReporteesCount) {
    reporteesCount = await User.countDocuments({ managerId: user._id })
  }

  const withManager: AuthUser = {
    ...base,
    ...(managerName ? { managerName } : {}),
    ...(managerAvatar ? { managerAvatar } : {}),
    ...(reporteesCount !== undefined ? { reporteesCount } : {}),
  }

  let permissions: Permission[]
  let customRoleId: string | null | undefined
  let customRoleName: string | undefined

  if (!user.customRoleId) {
    permissions = resolveUserPermissions(user.role)
  } else {
    const companyRole = await CompanyRole.findById(user.customRoleId)
    if (!companyRole) {
      customRoleId = null
      permissions = resolveUserPermissions(user.role)
    } else {
      customRoleId = companyRole._id.toString()
      customRoleName = companyRole.name
      permissions = resolveUserPermissions(user.role, companyRole.permissions as Permission[])
    }
  }

  let enabledHubs: CompanyHub[] | undefined
  const companyId = user.companyId?.toString() ?? null
  if (companyId) {
    enabledHubs = await getCompanyEnabledHubs(companyId)
    permissions = filterPermissionsForHubs(permissions, enabledHubs)
  }

  return {
    ...withManager,
    ...(customRoleId !== undefined ? { customRoleId } : {}),
    ...(customRoleName ? { customRoleName } : {}),
    ...(enabledHubs ? { enabledHubs } : {}),
    permissions,
  }
}
