import { Router } from 'express'
import { authorize, protect } from '../../middleware/auth.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireActive } from '../../middleware/requireActive.js'
import { requirePermission } from '../../middleware/requirePermission.js'
import { validate } from '../../middleware/validate.js'
import * as companyController from './company.controller.js'
import {
  createCompanySchema,
  listCompaniesQuerySchema,
  companyGrowthQuerySchema,
  updateCompanySchema,
  updateMyCompanyPreferencesSchema,
} from './company.validation.js'

const companyRouter = Router()

companyRouter.use(protect, requireActive)

companyRouter.get('/me', asyncHandler(companyController.getMyCompanyPreferencesHandler))
companyRouter.patch(
  '/me',
  requirePermission('settings:admin'),
  validate(updateMyCompanyPreferencesSchema),
  asyncHandler(companyController.updateMyCompanyPreferencesHandler),
)

companyRouter.use(authorize('superadmin'))

companyRouter.post('/', validate(createCompanySchema), asyncHandler(companyController.createCompanyHandler))
companyRouter.get('/', validate(listCompaniesQuerySchema, 'query'), asyncHandler(companyController.listCompaniesHandler))
companyRouter.get('/stats', asyncHandler(companyController.getCompanyStatsHandler))
companyRouter.get(
  '/stats/growth',
  validate(companyGrowthQuerySchema, 'query'),
  asyncHandler(companyController.getCompanyGrowthHandler),
)
companyRouter.get('/:id', asyncHandler(companyController.getCompanyHandler))
companyRouter.patch('/:id', validate(updateCompanySchema), asyncHandler(companyController.updateCompanyHandler))
companyRouter.delete('/:id', asyncHandler(companyController.deleteCompanyHandler))
companyRouter.post('/:id/resend-invite', asyncHandler(companyController.resendInviteHandler))
companyRouter.post('/:id/reset-access', asyncHandler(companyController.resetCompanyAccessHandler))

export default companyRouter
