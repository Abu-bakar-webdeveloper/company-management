import type { Request, Response } from 'express'
import { AppError } from '../../utils/AppError.js'
import { sendSuccess } from '../../utils/apiResponse.js'
import type { UserRole } from '../auth/auth.types.js'
import { hasPermission, type Permission } from '../auth/permissions.js'
import { enrichAuthUser } from '../auth/auth-user.helper.js'
import { User } from '../auth/user.model.js'
import {
  createMilestone,
  deleteMilestone,
  getMilestoneStats,
  listMilestones,
  updateMilestone,
} from './milestone.service.js'
import type { CreateMilestoneInput, UpdateMilestoneInput } from './milestone.validation.js'
import {
  createProjectFile,
  deleteProjectFile,
  listProjectFiles,
} from './project-file.service.js'
import type { CreateProjectFileInput } from './project-file.validation.js'
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjectOverview,
  getProjectStats,
  listProjectManagers,
  listProjectMemberOptions,
  listProjects,
  listProjectsForMember,
  updateProject,
  type ProjectActor,
} from './project.service.js'
import type {
  CreateProjectInput,
  ListProjectsQuery,
  ProjectOverviewQuery,
  UpdateProjectInput,
} from './project.validation.js'

async function getProjectActor(req: Request): Promise<ProjectActor> {
  const companyId = req.user!.companyId
  if (!companyId) {
    throw new AppError('Company context required', 403, 'FORBIDDEN')
  }

  const user = await User.findById(req.user!.id)
  if (!user) {
    throw new AppError('User not found', 401, 'UNAUTHORIZED')
  }

  const authUser = await enrichAuthUser(user)
  const role = authUser.role as UserRole
  const canWrite = hasPermission(role, 'projects:write', authUser.permissions as Permission[])

  return {
    id: req.user!.id,
    companyId,
    role,
    canWrite,
  }
}

export async function listProjectsHandler(req: Request, res: Response): Promise<void> {
  const result = await listProjects(
    req.validatedQuery as ListProjectsQuery,
    await getProjectActor(req),
  )
  sendSuccess(res, result)
}

export async function getProjectStatsHandler(req: Request, res: Response): Promise<void> {
  const stats = await getProjectStats(await getProjectActor(req))
  sendSuccess(res, { stats })
}

export async function getProjectOverviewHandler(req: Request, res: Response): Promise<void> {
  const { months } = req.validatedQuery as ProjectOverviewQuery
  const overview = await getProjectOverview(await getProjectActor(req), months)
  sendSuccess(res, { overview })
}

export async function getProjectHandler(req: Request, res: Response): Promise<void> {
  const project = await getProjectById(req.params.id as string, await getProjectActor(req))
  sendSuccess(res, { project })
}

export async function createProjectHandler(req: Request, res: Response): Promise<void> {
  const project = await createProject(req.body as CreateProjectInput, await getProjectActor(req))
  sendSuccess(res, { project }, { statusCode: 201, message: 'Project created successfully' })
}

export async function updateProjectHandler(req: Request, res: Response): Promise<void> {
  const project = await updateProject(
    req.params.id as string,
    req.body as UpdateProjectInput,
    await getProjectActor(req),
  )
  sendSuccess(res, { project }, { message: 'Project updated successfully' })
}

export async function deleteProjectHandler(req: Request, res: Response): Promise<void> {
  await deleteProject(req.params.id as string, await getProjectActor(req))
  sendSuccess(res, { message: 'Project deleted successfully' })
}

export async function listManagersHandler(req: Request, res: Response): Promise<void> {
  const result = await listProjectManagers(await getProjectActor(req))
  sendSuccess(res, result)
}

export async function listMembersHandler(req: Request, res: Response): Promise<void> {
  const result = await listProjectMemberOptions(await getProjectActor(req))
  sendSuccess(res, result)
}

export async function listMemberProjectsHandler(req: Request, res: Response): Promise<void> {
  const result = await listProjectsForMember(
    req.params.userId as string,
    await getProjectActor(req),
  )
  sendSuccess(res, result)
}

export async function getMilestoneStatsHandler(req: Request, res: Response): Promise<void> {
  const limitRaw = Number(req.query.limit)
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 20) : 5
  const stats = await getMilestoneStats(await getProjectActor(req), limit)
  sendSuccess(res, { stats })
}

export async function listMilestonesHandler(req: Request, res: Response): Promise<void> {
  const result = await listMilestones(req.params.id as string, await getProjectActor(req))
  sendSuccess(res, result)
}

export async function createMilestoneHandler(req: Request, res: Response): Promise<void> {
  const result = await createMilestone(
    req.params.id as string,
    req.body as CreateMilestoneInput,
    await getProjectActor(req),
  )
  sendSuccess(res, result, { statusCode: 201, message: 'Milestone created successfully' })
}

export async function updateMilestoneHandler(req: Request, res: Response): Promise<void> {
  const result = await updateMilestone(
    req.params.id as string,
    req.params.milestoneId as string,
    req.body as UpdateMilestoneInput,
    await getProjectActor(req),
  )
  sendSuccess(res, result, { message: 'Milestone updated successfully' })
}

export async function deleteMilestoneHandler(req: Request, res: Response): Promise<void> {
  const result = await deleteMilestone(
    req.params.id as string,
    req.params.milestoneId as string,
    await getProjectActor(req),
  )
  sendSuccess(res, result, { message: 'Milestone deleted successfully' })
}

export async function listProjectFilesHandler(req: Request, res: Response): Promise<void> {
  const result = await listProjectFiles(req.params.id as string, await getProjectActor(req))
  sendSuccess(res, result)
}

export async function createProjectFileHandler(req: Request, res: Response): Promise<void> {
  const result = await createProjectFile(
    req.params.id as string,
    req.body as CreateProjectFileInput,
    await getProjectActor(req),
  )
  sendSuccess(res, result, { statusCode: 201, message: 'Item added successfully' })
}

export async function deleteProjectFileHandler(req: Request, res: Response): Promise<void> {
  await deleteProjectFile(
    req.params.id as string,
    req.params.fileId as string,
    await getProjectActor(req),
  )
  sendSuccess(res, { message: 'Item deleted successfully' })
}
