import { Types } from 'mongoose'
import { AppError } from '../../utils/AppError.js'
import { buildPaginatedResult, type PaginatedResult } from '../../utils/pagination.js'
import type { UserRole } from '../auth/auth.types.js'
import { hasPermission, type Permission } from '../auth/permissions.js'
import { User } from '../auth/user.model.js'
import { Activity, type ActivityIconHint } from './activity.model.js'

export type ActivityScope = 'me' | 'team' | 'company' | 'platform'

export type ActivityActor = {
  id: string
  role: UserRole
  companyId: string | null
  permissions?: Permission[]
}

export type ActivityDto = {
  id: string
  title: string
  description: string
  time: string
  icon: ActivityIconHint
  module: string
  action: string
  entityType: string
  entityId: string
  createdAt: string
}

function assertAllowedScope(actor: ActivityActor, scope: ActivityScope): void {
  if (scope === 'platform') {
    if (actor.role !== 'superadmin') {
      throw new AppError('Insufficient permissions', 403, 'FORBIDDEN')
    }
    return
  }

  if (!actor.companyId) {
    throw new AppError('Company context required', 403, 'FORBIDDEN')
  }

  if (scope === 'company' && !['admin', 'hr'].includes(actor.role)) {
    throw new AppError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  if (scope === 'team' && !['manager', 'admin', 'hr'].includes(actor.role)) {
    throw new AppError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  if (scope === 'me') return
}

async function getDirectReportIds(managerId: string, companyId: string): Promise<Types.ObjectId[]> {
  const reports = await User.find({
    managerId: new Types.ObjectId(managerId),
    companyId: new Types.ObjectId(companyId),
  }).select('_id')
  return reports.map((r) => r._id as Types.ObjectId)
}

function passesPermission(actor: ActivityActor, required?: Permission): boolean {
  if (!required) return true
  if (hasPermission(actor.role, required, actor.permissions)) return true
  // Manage implies team-level attendance activity visibility
  if (
    required === 'attendance:team' &&
    hasPermission(actor.role, 'attendance:manage', actor.permissions)
  ) {
    return true
  }
  return false
}

const ACTIVITY_FETCH_CAP = 500

export async function listActivitiesForUser(
  actor: ActivityActor,
  options: { scope?: ActivityScope; page?: number; limit?: number } = {},
): Promise<PaginatedResult<ActivityDto>> {
  const scope = options.scope ?? (actor.role === 'superadmin' ? 'platform' : 'me')
  const page = Math.max(1, options.page ?? 1)
  const limit = Math.min(50, Math.max(1, options.limit ?? 10))

  assertAllowedScope(actor, scope)

  let filter: Record<string, unknown>

  if (scope === 'platform') {
    filter = { visibility: 'platform' }
  } else if (scope === 'me') {
    const userId = new Types.ObjectId(actor.id)
    filter = {
      companyId: new Types.ObjectId(actor.companyId!),
      $or: [{ actorId: userId }, { relatedUserIds: userId }],
      visibility: { $ne: 'platform' },
    }
  } else if (scope === 'team') {
    const reportIds = await getDirectReportIds(actor.id, actor.companyId!)
    const teamIds = [new Types.ObjectId(actor.id), ...reportIds]
    filter = {
      companyId: new Types.ObjectId(actor.companyId!),
      visibility: { $in: ['private', 'team', 'company'] },
      $or: [{ actorId: { $in: teamIds } }, { relatedUserIds: { $in: teamIds } }],
    }
  } else {
    // company
    filter = {
      companyId: new Types.ObjectId(actor.companyId!),
      visibility: { $in: ['team', 'company', 'private'] },
    }
  }

  const docs = await Activity.find(filter).sort({ createdAt: -1 }).limit(ACTIVITY_FETCH_CAP)

  const filtered = docs.filter((doc) => {
    // Private events already scoped to related users for me/team — allow subject without HR perm
    if (doc.visibility === 'private' && (scope === 'me' || scope === 'team')) {
      return true
    }
    if (!passesPermission(actor, doc.requiredPermission)) return false
    return true
  })

  const skip = (page - 1) * limit
  const pageItems = filtered.slice(skip, skip + limit).map((doc) => ({
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    time: doc.createdAt.toISOString(),
    icon: doc.iconHint,
    module: doc.module,
    action: doc.action,
    entityType: doc.entityType,
    entityId: doc.entityId.toString(),
    createdAt: doc.createdAt.toISOString(),
  }))

  return buildPaginatedResult(pageItems, filtered.length, page, limit)
}
