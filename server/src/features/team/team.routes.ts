import { Router } from 'express'
import { protect } from '../../middleware/auth.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireActive } from '../../middleware/requireActive.js'
import { requirePermission } from '../../middleware/requirePermission.js'
import { requireCompanyHub } from '../../middleware/requireCompanyHub.js'
import * as teamController from './team.controller.js'

const teamRouter = Router()

teamRouter.use(protect, requireActive, requireCompanyHub('people'))

teamRouter.get(
  '/members',
  requirePermission('team:read'),
  asyncHandler(teamController.listTeamMembers),
)

teamRouter.get(
  '/workload',
  requirePermission('team:read'),
  asyncHandler(teamController.getTeamWorkloadHandler),
)

teamRouter.get(
  '/members/:id',
  requirePermission('team:read'),
  asyncHandler(teamController.getTeamMember),
)

export default teamRouter
