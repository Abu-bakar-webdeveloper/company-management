import { Router } from 'express'
import { protect } from '../../middleware/auth.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireActive } from '../../middleware/requireActive.js'
import { requirePermission } from '../../middleware/requirePermission.js'
import { requireCompanyHub } from '../../middleware/requireCompanyHub.js'
import { validate } from '../../middleware/validate.js'
import * as clientController from './client.controller.js'
import {
  createClientSchema,
  listClientsQuerySchema,
  updateClientSchema,
} from './client.validation.js'

const clientRouter = Router()

clientRouter.use(protect, requireActive, requireCompanyHub('work'))

clientRouter.get(
  '/',
  requirePermission('clients:read'),
  validate(listClientsQuerySchema, 'query'),
  asyncHandler(clientController.listClientsHandler),
)

clientRouter.get(
  '/options',
  requirePermission('clients:read', 'projects:read', 'projects:write'),
  asyncHandler(clientController.listClientOptionsHandler),
)

clientRouter.get(
  '/stats',
  requirePermission('clients:read'),
  asyncHandler(clientController.getClientStatsHandler),
)

clientRouter.post(
  '/',
  requirePermission('clients:write'),
  validate(createClientSchema),
  asyncHandler(clientController.createClientHandler),
)

clientRouter.get(
  '/:id',
  requirePermission('clients:read'),
  asyncHandler(clientController.getClientHandler),
)

clientRouter.patch(
  '/:id',
  requirePermission('clients:write'),
  validate(updateClientSchema),
  asyncHandler(clientController.updateClientHandler),
)

clientRouter.delete(
  '/:id',
  requirePermission('clients:write'),
  asyncHandler(clientController.deleteClientHandler),
)

export default clientRouter
