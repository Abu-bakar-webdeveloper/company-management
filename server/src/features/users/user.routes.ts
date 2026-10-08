import { Router } from 'express'
import { protect } from '../../middleware/auth.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireActive } from '../../middleware/requireActive.js'
import { requirePermission } from '../../middleware/requirePermission.js'
import { requireCompanyHub } from '../../middleware/requireCompanyHub.js'
import { validate } from '../../middleware/validate.js'
import * as userController from './user.controller.js'
import { createUserSchema, listUsersQuerySchema, updateUserSchema } from './user.validation.js'

const userRouter = Router()

userRouter.use(protect, requireActive, requireCompanyHub('people'))

userRouter.post(
  '/',
  requirePermission('employees:write'),
  validate(createUserSchema),
  asyncHandler(userController.createUser),
)
userRouter.get(
  '/',
  requirePermission('employees:read'),
  validate(listUsersQuerySchema, 'query'),
  asyncHandler(userController.listUsersHandler),
)
userRouter.get(
  '/manager-options',
  requirePermission('employees:read'),
  asyncHandler(userController.listManagersHandler),
)
userRouter.get(
  '/:id',
  requirePermission('employees:read'),
  asyncHandler(userController.getUser),
)
userRouter.patch(
  '/:id',
  requirePermission('employees:write'),
  validate(updateUserSchema),
  asyncHandler(userController.updateUser),
)
userRouter.delete(
  '/:id',
  requirePermission('employees:write'),
  asyncHandler(userController.deleteUser),
)
userRouter.post(
  '/:id/resend-invite',
  requirePermission('employees:write'),
  asyncHandler(userController.resendInvite),
)

export default userRouter
