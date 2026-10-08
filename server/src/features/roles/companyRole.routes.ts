import { Router } from 'express'
import { protect } from '../../middleware/auth.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireActive } from '../../middleware/requireActive.js'
import { requirePermission } from '../../middleware/requirePermission.js'
import { validate } from '../../middleware/validate.js'
import * as companyRoleController from './companyRole.controller.js'
import {
  createCompanyRoleSchema,
  updateCompanyRoleSchema,
} from './companyRole.validation.js'

const roleRouter = Router()

roleRouter.use(protect, requireActive, requirePermission('settings:admin'))

roleRouter.get('/', asyncHandler(companyRoleController.listRolesHandler))
roleRouter.post('/', validate(createCompanyRoleSchema), asyncHandler(companyRoleController.createRoleHandler))
roleRouter.get('/:id', asyncHandler(companyRoleController.getRoleHandler))
roleRouter.patch('/:id', validate(updateCompanyRoleSchema), asyncHandler(companyRoleController.updateRoleHandler))
roleRouter.delete('/:id', asyncHandler(companyRoleController.deleteRoleHandler))

export default roleRouter
