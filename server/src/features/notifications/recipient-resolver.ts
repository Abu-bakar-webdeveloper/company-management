import { Types } from 'mongoose'
import type { UserRole } from '../auth/auth.types.js'
import {
  hasPermission,
  type Permission,
  ROLE_PERMISSIONS,
} from '../auth/permissions.js'
import { User } from '../auth/user.model.js'
import { CompanyRole } from '../roles/companyRole.model.js'
import type { NotificationType } from './notification.model.js'

export type ResolveRecipientsInput = {
  type: NotificationType
  companyId: string | null
  actorId: string
  /** Primary subject of the event (leave requester, expense owner, assignee, etc.). */
  subjectUserId?: string
  /** Additional recipients (project team, manager, task creator, etc.). */
  extraRecipientIds?: string[]
  /** For project.updated significant changes — also notify admin/HR. */
  includeAdminHr?: boolean
  /** For user.status_changed — when suspended, also notify manager. */
  statusLabel?: string
}

async function usersWithPermission(
  companyId: string,
  permission: Permission,
): Promise<string[]> {
  const companyObjectId = new Types.ObjectId(companyId)
  const rolesWithPerm = (Object.entries(ROLE_PERMISSIONS) as [UserRole, Permission[]][])
    .filter(([, perms]) => perms.includes(permission))
    .map(([role]) => role)

  const customRoles = await CompanyRole.find({
    companyId: companyObjectId,
    permissions: permission,
  }).select('_id permissions')
  const customRoleIds = customRoles.map((r) => r._id)

  const users = await User.find({
    companyId: companyObjectId,
    status: 'active',
    $or: [
      { customRoleId: null, role: { $in: rolesWithPerm } },
      ...(customRoleIds.length > 0 ? [{ customRoleId: { $in: customRoleIds } }] : []),
    ],
  }).select('_id role customRoleId')

  const customRoleMap = new Map(
    customRoles.map((r) => [r._id.toString(), r.permissions as Permission[]]),
  )

  const ids: string[] = []
  for (const user of users) {
    if (user.customRoleId) {
      const perms = customRoleMap.get(user.customRoleId.toString())
      if (perms && hasPermission(user.role, permission, perms)) {
        ids.push(user._id.toString())
      }
      continue
    }
    if (hasPermission(user.role, permission)) {
      ids.push(user._id.toString())
    }
  }

  return ids
}

async function companyAdminHrIds(companyId: string): Promise<string[]> {
  const users = await User.find({
    companyId: new Types.ObjectId(companyId),
    status: 'active',
    role: { $in: ['admin', 'hr'] },
  }).select('_id')
  return users.map((u) => u._id.toString())
}

async function superadminIds(): Promise<string[]> {
  const users = await User.find({
    role: 'superadmin',
    status: 'active',
  }).select('_id')
  return users.map((u) => u._id.toString())
}

function addAll(target: Set<string>, ids: string[]): void {
  for (const id of ids) {
    if (id) target.add(id)
  }
}

export async function resolveRecipients(input: ResolveRecipientsInput): Promise<string[]> {
  const {
    type,
    companyId,
    actorId,
    subjectUserId,
    extraRecipientIds = [],
    includeAdminHr = false,
    statusLabel,
  } = input
  const recipientIds = new Set<string>()

  switch (type) {
    case 'leave.submitted': {
      if (subjectUserId) {
        const employee = await User.findById(subjectUserId).select('managerId')
        if (employee?.managerId) {
          recipientIds.add(employee.managerId.toString())
        } else if (companyId) {
          addAll(recipientIds, await usersWithPermission(companyId, 'leave:approve'))
        }
      }
      break
    }
    case 'leave.approved':
    case 'leave.rejected': {
      if (subjectUserId) recipientIds.add(subjectUserId)
      break
    }
    case 'expense.submitted': {
      if (companyId) {
        addAll(recipientIds, await usersWithPermission(companyId, 'expenses:write'))
      }
      break
    }
    case 'expense.approved':
    case 'expense.rejected': {
      if (subjectUserId) recipientIds.add(subjectUserId)
      break
    }
    case 'salary.paid':
    case 'salary.status_changed': {
      if (subjectUserId) recipientIds.add(subjectUserId)
      break
    }
    case 'project.created':
    case 'project.deleted':
    case 'client.created':
    case 'user.created':
    case 'user.invite_accepted': {
      if (companyId) {
        addAll(recipientIds, await companyAdminHrIds(companyId))
      }
      addAll(recipientIds, extraRecipientIds)
      break
    }
    case 'project.updated': {
      addAll(recipientIds, extraRecipientIds)
      if (includeAdminHr && companyId) {
        addAll(recipientIds, await companyAdminHrIds(companyId))
      }
      break
    }
    case 'task.assigned': {
      if (subjectUserId) recipientIds.add(subjectUserId)
      break
    }
    case 'task.completed': {
      addAll(recipientIds, extraRecipientIds)
      if (subjectUserId) recipientIds.add(subjectUserId)
      break
    }
    case 'user.status_changed': {
      if (subjectUserId) recipientIds.add(subjectUserId)
      if (statusLabel === 'suspended' && subjectUserId) {
        const user = await User.findById(subjectUserId).select('managerId')
        if (user?.managerId) recipientIds.add(user.managerId.toString())
      }
      addAll(recipientIds, extraRecipientIds)
      break
    }
    case 'performance.review_created':
    case 'performance.review_updated': {
      if (subjectUserId) {
        recipientIds.add(subjectUserId)
        const employee = await User.findById(subjectUserId).select('managerId')
        if (employee?.managerId) recipientIds.add(employee.managerId.toString())
      }
      addAll(recipientIds, extraRecipientIds)
      break
    }
    case 'company.created': {
      addAll(recipientIds, await superadminIds())
      break
    }
    case 'attendance.clocked_in':
    case 'attendance.clocked_out': {
      if (subjectUserId) {
        const employee = await User.findById(subjectUserId).select('managerId')
        if (employee?.managerId) recipientIds.add(employee.managerId.toString())
      }
      if (companyId) {
        addAll(recipientIds, await usersWithPermission(companyId, 'attendance:manage'))
      }
      break
    }
    default:
      break
  }

  recipientIds.delete(actorId)
  return [...recipientIds]
}
