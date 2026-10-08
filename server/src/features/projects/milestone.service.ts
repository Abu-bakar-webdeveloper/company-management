import { Types } from 'mongoose'
import { AppError } from '../../utils/AppError.js'
import { Project } from './project.model.js'
import { Milestone, type IMilestone, type MilestoneStatus } from './milestone.model.js'
import type { ProjectActor } from './project.service.js'
import type { CreateMilestoneInput, UpdateMilestoneInput } from './milestone.validation.js'

export type MilestoneDto = {
  id: string
  projectId: string
  title: string
  dueDate?: string
  status: MilestoneStatus
  sortOrder: number
  weightPercent: number
}

export type MilestoneHubItemDto = {
  id: string
  title: string
  projectId: string
  projectName: string
  dueDate: string
}

export type MilestoneStatsDto = {
  total: number
  pending: number
  completed: number
  overdue: number
  dueSoon: number
  overdueItems: MilestoneHubItemDto[]
}

function toDateString(value: Date): string {
  return value.toISOString().slice(0, 10)
}

function membershipOk(project: { managerId: Types.ObjectId; teamMemberIds: Types.ObjectId[] }, acting: ProjectActor) {
  if (acting.role !== 'employee' || acting.canWrite) return true
  return (
    project.managerId.toString() === acting.id ||
    project.teamMemberIds.some((id) => id.toString() === acting.id)
  )
}

async function getProjectForActor(projectId: string, acting: ProjectActor) {
  const project = await Project.findOne({ _id: projectId, companyId: acting.companyId })
  if (!project || !membershipOk(project, acting)) {
    throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND')
  }
  return project
}

export async function recomputeProjectProgress(projectId: string): Promise<number> {
  const project = await Project.findById(projectId)
  if (!project) return 0

  if (project.status === 'completed') {
    project.progress = 100
    await project.save()
    return 100
  }

  const milestones = await Milestone.find({ projectId })
  const total = milestones.length
  if (total === 0) {
    project.progress = 100
    await project.save()
    return 100
  }

  const completed = milestones.filter((m) => m.status === 'completed').length
  const progress = Math.round((completed / total) * 100)
  project.progress = progress
  await project.save()
  return progress
}

function toMilestoneDto(milestone: IMilestone, totalCount: number): MilestoneDto {
  return {
    id: milestone._id.toString(),
    projectId: milestone.projectId.toString(),
    title: milestone.title,
    ...(milestone.dueDate ? { dueDate: toDateString(milestone.dueDate) } : {}),
    status: milestone.status,
    sortOrder: milestone.sortOrder,
    weightPercent: totalCount > 0 ? Math.round(100 / totalCount) : 0,
  }
}

export async function listMilestones(
  projectId: string,
  acting: ProjectActor,
): Promise<{ milestones: MilestoneDto[]; progress: number }> {
  await getProjectForActor(projectId, acting)

  const milestones = await Milestone.find({
    projectId,
    companyId: acting.companyId,
  }).sort({ sortOrder: 1, createdAt: 1 })

  const total = milestones.length
  return {
    milestones: milestones.map((m) => toMilestoneDto(m, total)),
    progress: total === 0 ? 100 : Math.round(
      (milestones.filter((m) => m.status === 'completed').length / total) * 100,
    ),
  }
}

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function daysFromToday(days: number): Date {
  const d = startOfToday()
  d.setDate(d.getDate() + days)
  return d
}

export async function getMilestoneStats(
  acting: ProjectActor,
  limit = 5,
): Promise<MilestoneStatsDto> {
  if (acting.role === 'employee' && !acting.canWrite) {
    throw new AppError('Company milestone stats are not available for this role', 403, 'FORBIDDEN')
  }

  const companyFilter = { companyId: acting.companyId }
  const today = startOfToday()
  const soon = daysFromToday(7)

  const overdueFilter = {
    ...companyFilter,
    status: 'pending' as const,
    dueDate: { $lt: today },
  }

  const [total, pending, completed, overdue, dueSoon, overdueMilestones] = await Promise.all([
    Milestone.countDocuments(companyFilter),
    Milestone.countDocuments({ ...companyFilter, status: 'pending' }),
    Milestone.countDocuments({ ...companyFilter, status: 'completed' }),
    Milestone.countDocuments(overdueFilter),
    Milestone.countDocuments({
      ...companyFilter,
      status: 'pending',
      dueDate: { $gte: today, $lte: soon },
    }),
    Milestone.find(overdueFilter).sort({ dueDate: 1 }).limit(limit).select('title projectId dueDate'),
  ])

  const projectIds = [...new Set(overdueMilestones.map((m) => m.projectId.toString()))]
  const projects = await Project.find({
    _id: { $in: projectIds },
    companyId: acting.companyId,
  }).select('name')
  const projectNameById = new Map(projects.map((p) => [p._id.toString(), p.name]))

  return {
    total,
    pending,
    completed,
    overdue,
    dueSoon,
    overdueItems: overdueMilestones.map((m) => ({
      id: m._id.toString(),
      title: m.title,
      projectId: m.projectId.toString(),
      projectName: projectNameById.get(m.projectId.toString()) ?? 'Project',
      dueDate: m.dueDate ? toDateString(m.dueDate) : '',
    })),
  }
}

export async function createMilestone(
  projectId: string,
  payload: CreateMilestoneInput,
  acting: ProjectActor,
): Promise<{ milestone: MilestoneDto; progress: number }> {
  if (!acting.canWrite) {
    throw new AppError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  const project = await getProjectForActor(projectId, acting)
  const count = await Milestone.countDocuments({ projectId: project._id })

  const milestone = await Milestone.create({
    companyId: acting.companyId,
    projectId: project._id,
    title: payload.title,
    dueDate: payload.dueDate,
    status: 'pending',
    sortOrder: count,
  })

  const progress = await recomputeProjectProgress(project._id.toString())
  const total = count + 1

  return {
    milestone: toMilestoneDto(milestone, total),
    progress,
  }
}

export async function updateMilestone(
  projectId: string,
  milestoneId: string,
  payload: UpdateMilestoneInput,
  acting: ProjectActor,
): Promise<{ milestone: MilestoneDto; progress: number }> {
  if (!acting.canWrite) {
    throw new AppError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  await getProjectForActor(projectId, acting)

  const milestone = await Milestone.findOne({
    _id: milestoneId,
    projectId,
    companyId: acting.companyId,
  })
  if (!milestone) {
    throw new AppError('Milestone not found', 404, 'MILESTONE_NOT_FOUND')
  }

  if (payload.title !== undefined) milestone.title = payload.title
  if (payload.dueDate !== undefined) {
    milestone.dueDate = payload.dueDate ?? undefined
  }
  if (payload.status !== undefined) milestone.status = payload.status

  await milestone.save()

  const progress = await recomputeProjectProgress(projectId)
  const total = await Milestone.countDocuments({ projectId })

  return {
    milestone: toMilestoneDto(milestone, total),
    progress,
  }
}

export async function deleteMilestone(
  projectId: string,
  milestoneId: string,
  acting: ProjectActor,
): Promise<{ progress: number }> {
  if (!acting.canWrite) {
    throw new AppError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  await getProjectForActor(projectId, acting)

  const milestone = await Milestone.findOne({
    _id: milestoneId,
    projectId,
    companyId: acting.companyId,
  })
  if (!milestone) {
    throw new AppError('Milestone not found', 404, 'MILESTONE_NOT_FOUND')
  }

  await milestone.deleteOne()
  const progress = await recomputeProjectProgress(projectId)
  return { progress }
}
