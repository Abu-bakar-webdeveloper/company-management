import { Types } from 'mongoose'
import { AppError } from '../../utils/AppError.js'
import {
  buildPaginatedResult,
  buildSearchFilter,
  parsePagination,
} from '../../utils/pagination.js'
import type { AuthUser, UserRole } from '../auth/auth.types.js'
import { enrichAuthUser } from '../auth/auth-user.helper.js'
import { User } from '../auth/user.model.js'
import {
  assertClientInCompany,
  createClientQuick,
} from '../clients/client.service.js'
import { Client } from '../clients/client.model.js'
import { resolveActorFullName } from '../notifications/actor-name.js'
import { dispatchDomainEventSafe } from '../notifications/notification.service.js'
import {
  Project,
  type IProject,
  type ProjectPriority,
  type ProjectSource,
  type ProjectStatus,
} from './project.model.js'
import type {
  CreateProjectInput,
  ListProjectsQuery,
  UpdateProjectInput,
} from './project.validation.js'

export type ProjectActor = {
  id: string
  companyId: string
  role: UserRole
  canWrite: boolean
}

export type ProjectTeamMemberDto = {
  id: string
  name: string
  jobTitle: string
  avatar?: string
}

export type ProjectDto = {
  id: string
  projectCode: string
  name: string
  description: string
  managerId: string
  managerName: string
  managerAvatar?: string
  team: ProjectTeamMemberDto[]
  clientId?: string
  clientName?: string
  clientCode?: string
  source?: ProjectSource
  sourceNote?: string
  contractValue?: number
  startDate: string
  endDate: string
  status: ProjectStatus
  priority: ProjectPriority
  progress: number
}

export type ProjectStatsDto = {
  total: number
  completed: number
  inProgress: number
  delayed: number
}

export type ProjectOverviewPoint = {
  month: string
  active: number
  completed: number
  activeCount: number
  completedCount: number
}

const ROLE_LABELS: Record<string, string> = {
  manager: 'Manager',
  hr: 'HR',
  employee: 'Employee',
  admin: 'Admin',
  superadmin: 'Super Admin',
}

function memberJobTitle(user: AuthUser): string {
  if (user.jobTitle?.trim()) return user.jobTitle.trim()
  if (user.customRoleName?.trim()) return user.customRoleName.trim()
  return ROLE_LABELS[user.role] ?? '—'
}

function toDateString(value: Date): string {
  return value.toISOString().slice(0, 10)
}

function membershipFilter(userId: string): Record<string, unknown> {
  const oid = new Types.ObjectId(userId)
  return {
    $or: [{ managerId: oid }, { teamMemberIds: oid }],
  }
}

/** Employees without write only see projects they manage or belong to. HR keeps company-wide read. */
function shouldScopeToMembership(acting: ProjectActor): boolean {
  return acting.role === 'employee' && !acting.canWrite
}

/** Source / contract value are admin+HR commercial fields. */
function canViewCommercialDetails(role: UserRole): boolean {
  return role === 'admin' || role === 'hr' || role === 'superadmin'
}

async function assertCanViewProject(project: IProject, acting: ProjectActor): Promise<void> {
  if (!shouldScopeToMembership(acting)) return

  const isManager = project.managerId.toString() === acting.id
  const isMember = project.teamMemberIds.some((id) => id.toString() === acting.id)
  if (!isManager && !isMember) {
    throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND')
  }
}

async function nextProjectCode(companyId: string): Promise<string> {
  const latest = await Project.findOne({ companyId })
    .sort({ createdAt: -1 })
    .select('projectCode')
    .lean()

  let next = 1
  if (latest?.projectCode) {
    const num = Number.parseInt(latest.projectCode.replace(/\D/g, ''), 10)
    if (!Number.isNaN(num)) next = num + 1
  }

  return `PRJ-${String(next).padStart(4, '0')}`
}

async function assertCompanyUsers(params: {
  userIds: string[]
  companyId: string
  requireManagerRole?: boolean
}): Promise<Map<string, InstanceType<typeof User>>> {
  const uniqueIds = [...new Set(params.userIds)]
  if (uniqueIds.length === 0) return new Map()

  const users = await User.find({
    _id: { $in: uniqueIds },
    companyId: params.companyId,
  })

  const byId = new Map(users.map((user) => [user._id.toString(), user]))

  for (const id of uniqueIds) {
    const user = byId.get(id)
    if (!user) {
      throw new AppError('One or more users were not found in this company', 400, 'INVALID_USER')
    }
    if (params.requireManagerRole && user.role !== 'manager') {
      throw new AppError('Project manager must have the manager role', 400, 'INVALID_MANAGER')
    }
  }

  return byId
}

async function toProjectDto(
  project: IProject,
  acting?: ProjectActor,
): Promise<ProjectDto> {
  const memberIds = [
    project.managerId.toString(),
    ...project.teamMemberIds.map((id) => id.toString()),
  ]
  const uniqueIds = [...new Set(memberIds)]
  const users = await User.find({ _id: { $in: uniqueIds } })
  const enriched = await Promise.all(users.map((user) => enrichAuthUser(user)))
  const byId = new Map(enriched.map((user) => [user.id, user]))

  const manager = byId.get(project.managerId.toString())
  const team: ProjectTeamMemberDto[] = project.teamMemberIds.map((id) => {
    const user = byId.get(id.toString())
    if (!user) {
      return {
        id: id.toString(),
        name: 'Unknown',
        jobTitle: '—',
      }
    }
    return {
      id: user.id,
      name: user.fullName,
      jobTitle: memberJobTitle(user),
      ...(user.avatar ? { avatar: user.avatar } : {}),
    }
  })

  let clientName: string | undefined
  let clientCode: string | undefined
  if (project.clientId) {
    const client = await Client.findById(project.clientId).select('name clientCode').lean()
    if (client) {
      clientName = client.name
      clientCode = client.clientCode
    }
  }

  const includeCommercial = !acting || canViewCommercialDetails(acting.role)

  return {
    id: project._id.toString(),
    projectCode: project.projectCode,
    name: project.name,
    description: project.description,
    managerId: project.managerId.toString(),
    managerName: manager?.fullName ?? 'Unknown',
    ...(manager?.avatar ? { managerAvatar: manager.avatar } : {}),
    team,
    ...(project.clientId
      ? {
          clientId: project.clientId.toString(),
          ...(clientName ? { clientName } : {}),
          ...(clientCode ? { clientCode } : {}),
        }
      : {}),
    ...(includeCommercial && project.source ? { source: project.source } : {}),
    ...(includeCommercial && project.sourceNote ? { sourceNote: project.sourceNote } : {}),
    ...(includeCommercial && project.contractValue != null
      ? { contractValue: project.contractValue }
      : {}),
    startDate: toDateString(project.startDate),
    endDate: toDateString(project.endDate),
    status: project.status,
    priority: project.priority,
    progress: project.progress,
  }
}

export async function listProjects(query: ListProjectsQuery, acting: ProjectActor) {
  const { page, limit, skip } = parsePagination(query)
  const filter: Record<string, unknown> = { companyId: acting.companyId }

  if (query.status) filter.status = query.status
  if (query.clientId) filter.clientId = new Types.ObjectId(query.clientId)

  if (query.memberId) {
    filter.$or = [
      { managerId: new Types.ObjectId(query.memberId) },
      { teamMemberIds: new Types.ObjectId(query.memberId) },
    ]
  } else if (shouldScopeToMembership(acting)) {
    Object.assign(filter, membershipFilter(acting.id))
  }

  const searchFilter = buildSearchFilter(query.search, ['name', 'description', 'projectCode'])
  if (searchFilter) {
    if (filter.$or) {
      filter.$and = [{ $or: filter.$or as unknown[] }, searchFilter]
      delete filter.$or
    } else {
      Object.assign(filter, searchFilter)
    }
  }

  const [projects, total] = await Promise.all([
    Project.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Project.countDocuments(filter),
  ])

  const items = await Promise.all(projects.map((project) => toProjectDto(project, acting)))
  const result = buildPaginatedResult(items, total, page, limit)

  return {
    projects: result.items,
    pagination: result.pagination,
  }
}

export async function getProjectStats(acting: ProjectActor): Promise<ProjectStatsDto> {
  const match: Record<string, unknown> = {
    companyId: new Types.ObjectId(acting.companyId),
  }
  if (shouldScopeToMembership(acting)) {
    Object.assign(match, membershipFilter(acting.id))
  }

  const rows = await Project.aggregate<{ _id: ProjectStatus; count: number }>([
    { $match: match },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ])

  const byStatus = Object.fromEntries(rows.map((row) => [row._id, row.count])) as Partial<
    Record<ProjectStatus, number>
  >

  const inProgress = byStatus.in_progress ?? 0
  const completed = byStatus.completed ?? 0
  const delayed = byStatus.delayed ?? 0

  return {
    total: inProgress + completed + delayed,
    completed,
    inProgress,
    delayed,
  }
}

export async function getProjectOverview(
  acting: ProjectActor,
  months = 6,
): Promise<ProjectOverviewPoint[]> {
  const match: Record<string, unknown> = {
    companyId: new Types.ObjectId(acting.companyId),
  }
  if (shouldScopeToMembership(acting)) {
    Object.assign(match, membershipFilter(acting.id))
  }

  const projects = await Project.find(match)
    .select('status createdAt updatedAt')
    .lean()

  const now = new Date()
  const series: ProjectOverviewPoint[] = []
  const includeYear = months > 6

  for (let i = months - 1; i >= 0; i -= 1) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    const short = start.toLocaleString('en-US', { month: 'short' })
    const label = includeYear
      ? `${short} '${String(start.getFullYear()).slice(-2)}`
      : short

    let activeCount = 0
    let completedCount = 0
    for (const project of projects) {
      const createdAt = project.createdAt
      const updatedAt = project.updatedAt
      if (createdAt < end && (project.status !== 'completed' || updatedAt >= end)) {
        activeCount += 1
      }
      if (
        project.status === 'completed' &&
        updatedAt >= start &&
        updatedAt < end
      ) {
        completedCount += 1
      }
    }

    series.push({
      month: label,
      active: activeCount,
      completed: completedCount,
      activeCount,
      completedCount,
    })
  }

  return series
}

export async function getProjectById(projectId: string, acting: ProjectActor): Promise<ProjectDto> {
  const project = await Project.findOne({ _id: projectId, companyId: acting.companyId })
  if (!project) {
    throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND')
  }
  await assertCanViewProject(project, acting)

  // Heal stored progress when no milestones exist (treat as 100%).
  if (project.status !== 'completed' && project.progress !== 100) {
    const { Milestone } = await import('./milestone.model.js')
    const milestoneCount = await Milestone.countDocuments({ projectId: project._id })
    if (milestoneCount === 0) {
      project.progress = 100
      await project.save()
    }
  }

  return toProjectDto(project, acting)
}

export async function createProject(
  payload: CreateProjectInput,
  acting: ProjectActor,
): Promise<ProjectDto> {
  await assertCompanyUsers({
    userIds: [payload.managerId],
    companyId: acting.companyId,
    requireManagerRole: true,
  })

  const teamMemberIds = payload.teamMemberIds.filter((id) => id !== payload.managerId)
  if (teamMemberIds.length > 0) {
    await assertCompanyUsers({
      userIds: teamMemberIds,
      companyId: acting.companyId,
    })
  }

  let clientId: Types.ObjectId | undefined
  if (payload.clientMode === 'new' && payload.newClient) {
    const client = await createClientQuick(payload.newClient, {
      id: acting.id,
      companyId: acting.companyId,
      role: acting.role,
    })
    clientId = client._id
  } else if (payload.clientMode !== 'company' && payload.clientId) {
    await assertClientInCompany(payload.clientId, acting.companyId)
    clientId = new Types.ObjectId(payload.clientId)
  }

  const projectCode = await nextProjectCode(acting.companyId)

  const includeCommercial = canViewCommercialDetails(acting.role)
  const project = await Project.create({
    companyId: acting.companyId,
    projectCode,
    name: payload.name,
    description: payload.description,
    managerId: payload.managerId,
    teamMemberIds,
    ...(clientId ? { clientId } : {}),
    ...(includeCommercial && payload.source ? { source: payload.source } : {}),
    ...(includeCommercial && payload.sourceNote?.trim()
      ? { sourceNote: payload.sourceNote.trim() }
      : {}),
    ...(includeCommercial && payload.contractValue != null
      ? { contractValue: payload.contractValue }
      : {}),
    startDate: payload.startDate,
    endDate: payload.endDate,
    priority: payload.priority,
    status: payload.status,
    progress: 100,
  })

  const { seedDefaultColumns } = await import('../tasks/board.service.js')
  await seedDefaultColumns(project._id, acting.companyId)

  const extraRecipientIds = [
    payload.managerId,
    ...teamMemberIds,
  ]
  await dispatchDomainEventSafe({
    type: 'project.created',
    actor: {
      id: acting.id,
      fullName: await resolveActorFullName(acting.id),
      companyId: acting.companyId,
    },
    entityId: project._id.toString(),
    extraRecipientIds,
    relatedUserIds: extraRecipientIds,
    context: { entityLabel: project.name },
  })

  return toProjectDto(project, acting)
}

export async function updateProject(
  projectId: string,
  payload: UpdateProjectInput,
  acting: ProjectActor,
): Promise<ProjectDto> {
  const project = await Project.findOne({ _id: projectId, companyId: acting.companyId })
  if (!project) {
    throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND')
  }

  const previousStatus = project.status
  const previousManagerId = project.managerId.toString()
  const significantChange =
    payload.status !== undefined ||
    payload.managerId !== undefined ||
    payload.teamMemberIds !== undefined ||
    payload.name !== undefined ||
    payload.startDate !== undefined ||
    payload.endDate !== undefined

  if (payload.managerId !== undefined) {
    await assertCompanyUsers({
      userIds: [payload.managerId],
      companyId: acting.companyId,
      requireManagerRole: true,
    })
    project.managerId = new Types.ObjectId(payload.managerId)
  }

  if (payload.teamMemberIds !== undefined) {
    const managerId = (payload.managerId ?? project.managerId.toString())
    const teamMemberIds = payload.teamMemberIds.filter((id) => id !== managerId)
    if (teamMemberIds.length > 0) {
      await assertCompanyUsers({
        userIds: teamMemberIds,
        companyId: acting.companyId,
      })
    }
    project.teamMemberIds = teamMemberIds.map((id) => new Types.ObjectId(id))
  }

  if (payload.name !== undefined) project.name = payload.name
  if (payload.description !== undefined) project.description = payload.description
  if (payload.startDate !== undefined) project.startDate = payload.startDate
  if (payload.endDate !== undefined) project.endDate = payload.endDate
  if (payload.priority !== undefined) project.priority = payload.priority
  if (payload.status !== undefined) {
    project.status = payload.status
    if (payload.status === 'completed') {
      project.progress = 100
    }
  }

  if (payload.clientId !== undefined) {
    if (payload.clientId === null || payload.clientId === '') {
      project.set('clientId', undefined)
    } else {
      await assertClientInCompany(payload.clientId, acting.companyId)
      project.clientId = new Types.ObjectId(payload.clientId)
    }
  }

  if (canViewCommercialDetails(acting.role)) {
    if (payload.source !== undefined) {
      project.source = payload.source === null ? undefined : payload.source
    }
    if (payload.sourceNote !== undefined) {
      project.sourceNote =
        payload.sourceNote === null || !payload.sourceNote.trim()
          ? undefined
          : payload.sourceNote.trim()
    }
    if (payload.contractValue !== undefined) {
      project.contractValue =
        payload.contractValue === null ? undefined : payload.contractValue
    }
  }

  const start = project.startDate
  const end = project.endDate
  if (end < start) {
    throw new AppError('Deadline must be on or after the start date', 400, 'INVALID_DATES')
  }

  await project.save()

  if (significantChange) {
    const teamIds = project.teamMemberIds.map((id) => id.toString())
    const includeAdminHr =
      (payload.status !== undefined && payload.status !== previousStatus) ||
      (payload.managerId !== undefined && payload.managerId !== previousManagerId)
    await dispatchDomainEventSafe({
      type: 'project.updated',
      actor: {
        id: acting.id,
        fullName: await resolveActorFullName(acting.id),
        companyId: acting.companyId,
      },
      entityId: project._id.toString(),
      extraRecipientIds: [project.managerId.toString(), ...teamIds],
      relatedUserIds: [project.managerId.toString(), ...teamIds],
      includeAdminHr,
      context: {
        entityLabel: project.name,
        statusLabel: payload.status !== undefined ? project.status : undefined,
      },
    })
  }

  if (project.status !== 'completed') {
    const { recomputeProjectProgress } = await import('./milestone.service.js')
    await recomputeProjectProgress(project._id.toString())
    const refreshed = await Project.findById(project._id)
    if (refreshed) return toProjectDto(refreshed, acting)
  }

  return toProjectDto(project, acting)
}

export async function deleteProject(projectId: string, acting: ProjectActor): Promise<void> {
  const project = await Project.findOne({ _id: projectId, companyId: acting.companyId })
  if (!project) {
    throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND')
  }

  const projectName = project.name
  const projectIdStr = project._id.toString()

  const { Milestone } = await import('./milestone.model.js')
  const { ProjectFile } = await import('./project-file.model.js')
  const { BoardColumn } = await import('../tasks/board-column.model.js')
  const { Task } = await import('../tasks/task.model.js')

  await Task.deleteMany({ projectId: project._id })
  await BoardColumn.deleteMany({ projectId: project._id })
  await Milestone.deleteMany({ projectId: project._id })
  await ProjectFile.deleteMany({ projectId: project._id })
  await project.deleteOne()

  await dispatchDomainEventSafe({
    type: 'project.deleted',
    actor: {
      id: acting.id,
      fullName: await resolveActorFullName(acting.id),
      companyId: acting.companyId,
    },
    entityId: projectIdStr,
    context: { entityLabel: projectName },
  })
}

export async function listProjectManagers(acting: ProjectActor): Promise<{ managers: AuthUser[] }> {
  const users = await User.find({
    companyId: acting.companyId,
    role: 'manager',
    status: 'active',
  }).sort({ fullName: 1 })

  const managers = await Promise.all(users.map((user) => enrichAuthUser(user)))
  return { managers }
}

export async function listProjectMemberOptions(
  acting: ProjectActor,
): Promise<{ members: AuthUser[] }> {
  const users = await User.find({
    companyId: acting.companyId,
    role: { $in: ['manager', 'hr', 'employee'] },
    status: 'active',
  }).sort({ fullName: 1 })

  const members = await Promise.all(users.map((user) => enrichAuthUser(user)))
  return { members }
}

export async function listProjectsForMember(
  memberId: string,
  acting: ProjectActor,
): Promise<{ projects: ProjectDto[] }> {
  if (!Types.ObjectId.isValid(memberId)) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  }

  const member = await User.findOne({ _id: memberId, companyId: acting.companyId })
  if (!member) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  }

  const projects = await Project.find({
    companyId: acting.companyId,
    $or: [
      { managerId: member._id },
      { teamMemberIds: member._id },
    ],
  }).sort({ createdAt: -1 })

  const items = await Promise.all(projects.map((project) => toProjectDto(project, acting)))
  return { projects: items }
}
