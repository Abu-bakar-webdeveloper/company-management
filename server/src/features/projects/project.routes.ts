import { Router } from 'express'
import { protect } from '../../middleware/auth.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireActive } from '../../middleware/requireActive.js'
import { requirePermission } from '../../middleware/requirePermission.js'
import { requireCompanyHub } from '../../middleware/requireCompanyHub.js'
import { validate } from '../../middleware/validate.js'
import projectBoardRouter from '../tasks/project-board.routes.js'
import * as projectController from './project.controller.js'
import {
  createMilestoneSchema,
  updateMilestoneSchema,
} from './milestone.validation.js'
import { createProjectFileSchema } from './project-file.validation.js'
import {
  createProjectSchema,
  listProjectsQuerySchema,
  projectOverviewQuerySchema,
  updateProjectSchema,
} from './project.validation.js'

const projectRouter = Router()

projectRouter.use(protect, requireActive, requireCompanyHub('work'))

projectRouter.get(
  '/',
  requirePermission('projects:read', 'employees:read'),
  validate(listProjectsQuerySchema, 'query'),
  asyncHandler(projectController.listProjectsHandler),
)

projectRouter.get(
  '/stats',
  requirePermission('projects:read'),
  asyncHandler(projectController.getProjectStatsHandler),
)

projectRouter.get(
  '/stats/overview',
  requirePermission('projects:read'),
  validate(projectOverviewQuerySchema, 'query'),
  asyncHandler(projectController.getProjectOverviewHandler),
)

projectRouter.get(
  '/milestones/stats',
  requirePermission('projects:read'),
  asyncHandler(projectController.getMilestoneStatsHandler),
)

projectRouter.get(
  '/manager-options',
  requirePermission('projects:write'),
  asyncHandler(projectController.listManagersHandler),
)

projectRouter.get(
  '/member-options',
  requirePermission('projects:write'),
  asyncHandler(projectController.listMembersHandler),
)

projectRouter.get(
  '/by-member/:userId',
  requirePermission('projects:read', 'employees:read', 'team:read'),
  asyncHandler(projectController.listMemberProjectsHandler),
)

projectRouter.post(
  '/',
  requirePermission('projects:write'),
  validate(createProjectSchema),
  asyncHandler(projectController.createProjectHandler),
)

projectRouter.use(projectBoardRouter)

projectRouter.get(
  '/:id/milestones',
  requirePermission('projects:read'),
  asyncHandler(projectController.listMilestonesHandler),
)

projectRouter.post(
  '/:id/milestones',
  requirePermission('projects:write'),
  validate(createMilestoneSchema),
  asyncHandler(projectController.createMilestoneHandler),
)

projectRouter.patch(
  '/:id/milestones/:milestoneId',
  requirePermission('projects:write'),
  validate(updateMilestoneSchema),
  asyncHandler(projectController.updateMilestoneHandler),
)

projectRouter.delete(
  '/:id/milestones/:milestoneId',
  requirePermission('projects:write'),
  asyncHandler(projectController.deleteMilestoneHandler),
)

projectRouter.get(
  '/:id/files',
  requirePermission('projects:read'),
  asyncHandler(projectController.listProjectFilesHandler),
)

projectRouter.post(
  '/:id/files',
  requirePermission('projects:write'),
  validate(createProjectFileSchema),
  asyncHandler(projectController.createProjectFileHandler),
)

projectRouter.delete(
  '/:id/files/:fileId',
  requirePermission('projects:write'),
  asyncHandler(projectController.deleteProjectFileHandler),
)

projectRouter.get(
  '/:id',
  requirePermission('projects:read'),
  asyncHandler(projectController.getProjectHandler),
)

projectRouter.patch(
  '/:id',
  requirePermission('projects:write'),
  validate(updateProjectSchema),
  asyncHandler(projectController.updateProjectHandler),
)

projectRouter.delete(
  '/:id',
  requirePermission('projects:write'),
  asyncHandler(projectController.deleteProjectHandler),
)

export default projectRouter
