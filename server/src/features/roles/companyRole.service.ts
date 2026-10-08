import type { Types } from 'mongoose'
import type { Permission } from '../auth/permissions.js'
import { ROLE_PERMISSIONS } from '../auth/permissions.js'
import { User } from '../auth/user.model.js'
import { AppError } from '../../utils/AppError.js'
import {
  filterPermissionsForHubs,
  getCompanyEnabledHubs,
} from '../companies/company-hubs.js'
import { CompanyRole, type ICompanyRole, type StaffBaseRole } from './companyRole.model.js'
import type { CreateCompanyRoleInput, UpdateCompanyRoleInput } from './companyRole.validation.js'
import { normalizeRolePermissions } from './normalizeRolePermissions.js'

export type CompanyRoleDto = {
  id: string
  name: string
  description: string
  baseRole: StaffBaseRole
  permissions: Permission[]
  userCount: number
  isLocked: boolean
  createdAt: string
}

export type ActingCompanyAdmin = {
  companyId: string
}

function toCompanyRoleDto(role: ICompanyRole, userCount = 0): CompanyRoleDto {
  return {
    id: role._id.toString(),
    name: role.name,
    description: role.description,
    baseRole: role.baseRole,
    permissions: role.permissions as Permission[],
    userCount,
    isLocked: Boolean(role.isLocked),
    createdAt: role.createdAt.toISOString(),
  }
}

async function getUserCountsByRole(companyId: string, roleIds: Types.ObjectId[]) {
  if (roleIds.length === 0) return new Map<string, number>()

  const counts = await User.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $match: { companyId, customRoleId: { $in: roleIds } } },
    { $group: { _id: '$customRoleId', count: { $sum: 1 } } },
  ])

  return new Map(counts.map((entry) => [entry._id.toString(), entry.count]))
}

export async function listCompanyRoles(acting: ActingCompanyAdmin): Promise<CompanyRoleDto[]> {
  const roles = await CompanyRole.find({ companyId: acting.companyId }).sort({ createdAt: 1 })
  const counts = await getUserCountsByRole(
    acting.companyId,
    roles.map((role) => role._id),
  )

  return roles.map((role) => toCompanyRoleDto(role, counts.get(role._id.toString()) ?? 0))
}

export async function getCompanyRoleById(
  roleId: string,
  acting: ActingCompanyAdmin,
): Promise<CompanyRoleDto> {
  const role = await CompanyRole.findOne({ _id: roleId, companyId: acting.companyId })
  if (!role) {
    throw new AppError('Role not found', 404, 'ROLE_NOT_FOUND')
  }

  const userCount = await User.countDocuments({ companyId: acting.companyId, customRoleId: role._id })
  return toCompanyRoleDto(role, userCount)
}

export async function createCompanyRole(
  payload: CreateCompanyRoleInput,
  acting: ActingCompanyAdmin,
): Promise<CompanyRoleDto> {
  const duplicate = await CompanyRole.findOne({
    companyId: acting.companyId,
    name: payload.name,
  })
  if (duplicate) {
    throw new AppError('A role with this name already exists', 409, 'DUPLICATE_ROLE')
  }

  const permissions = filterPermissionsForHubs(
    normalizeRolePermissions(payload.permissions),
    await getCompanyEnabledHubs(acting.companyId),
  )
  if (permissions.length === 0) {
    throw new AppError(
      'At least one permission in an enabled product area is required',
      400,
      'PERMISSIONS_REQUIRED',
    )
  }

  const role = await CompanyRole.create({
    companyId: acting.companyId,
    name: payload.name,
    description: payload.description ?? `Custom role based on ${payload.baseRole}`,
    baseRole: payload.baseRole,
    permissions,
    isLocked: true,
  })

  return toCompanyRoleDto(role, 0)
}

export async function updateCompanyRole(
  roleId: string,
  payload: UpdateCompanyRoleInput,
  acting: ActingCompanyAdmin,
): Promise<CompanyRoleDto> {
  const role = await CompanyRole.findOne({ _id: roleId, companyId: acting.companyId })
  if (!role) {
    throw new AppError('Role not found', 404, 'ROLE_NOT_FOUND')
  }

  if (payload.isLocked === false) {
    throw new AppError(
      'Roles cannot be unlocked after creation. Delete and create a new role to change access.',
      400,
      'ROLE_UNLOCK_DISABLED',
    )
  }

  const mutatingContent =
    payload.name !== undefined ||
    payload.description !== undefined ||
    payload.permissions !== undefined

  if (mutatingContent) {
    throw new AppError(
      'This role is locked and cannot be changed. Delete it and create a new role instead.',
      400,
      'ROLE_LOCKED',
    )
  }

  if (payload.isLocked === true) {
    role.isLocked = true
    await role.save()
  }

  const userCount = await User.countDocuments({ companyId: acting.companyId, customRoleId: role._id })
  return toCompanyRoleDto(role, userCount)
}

export async function deleteCompanyRole(roleId: string, acting: ActingCompanyAdmin): Promise<void> {
  const role = await CompanyRole.findOne({ _id: roleId, companyId: acting.companyId })
  if (!role) {
    throw new AppError('Role not found', 404, 'ROLE_NOT_FOUND')
  }

  const assignedCount = await User.countDocuments({ companyId: acting.companyId, customRoleId: role._id })
  if (assignedCount > 0) {
    throw new AppError('Cannot delete a role that is assigned to users', 400, 'ROLE_IN_USE')
  }

  await role.deleteOne()
}

export async function assertCustomRoleAssignable(
  customRoleId: string,
  companyId: string,
  expectedBaseRole?: StaffBaseRole,
): Promise<ICompanyRole> {
  const role = await CompanyRole.findOne({ _id: customRoleId, companyId })
  if (!role) {
    throw new AppError('Custom role not found', 404, 'ROLE_NOT_FOUND')
  }

  if (expectedBaseRole && role.baseRole !== expectedBaseRole) {
    throw new AppError('Custom role does not match the selected base role', 400, 'ROLE_MISMATCH')
  }

  return role
}

export function defaultPermissionsForBaseRole(baseRole: StaffBaseRole): Permission[] {
  return ROLE_PERMISSIONS[baseRole]
}
