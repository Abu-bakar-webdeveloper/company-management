import { Router } from 'express'
import { protect } from '../../middleware/auth.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireActive } from '../../middleware/requireActive.js'
import { requirePermission } from '../../middleware/requirePermission.js'
import { requireCompanyHub } from '../../middleware/requireCompanyHub.js'
import { validate } from '../../middleware/validate.js'
import * as taskController from './task.controller.js'
import {
  createAttachmentSchema,
  listMyTasksQuerySchema,
  moveTaskSchema,
  taskStatsQuerySchema,
  updateTaskSchema,
} from './task.validation.js'

const taskRouter = Router()

taskRouter.use(protect, requireActive, requireCompanyHub('work'))

taskRouter.get(
  '/mine',
  requirePermission('tasks:read'),
  validate(listMyTasksQuerySchema, 'query'),
  asyncHandler(taskController.listMyTasksHandler),
)

taskRouter.get(
  '/stats',
  requirePermission('tasks:read'),
  validate(taskStatsQuerySchema, 'query'),
  asyncHandler(taskController.getTaskStatsHandler),
)

taskRouter.get(
  '/stats/progress',
  requirePermission('tasks:read'),
  validate(taskStatsQuerySchema, 'query'),
  asyncHandler(taskController.getTaskProgressHandler),
)

taskRouter.get(
  '/:id',
  requirePermission('tasks:read', 'projects:read'),
  asyncHandler(taskController.getTaskHandler),
)

taskRouter.patch(
  '/:id',
  requirePermission('tasks:write', 'projects:write'),
  validate(updateTaskSchema),
  asyncHandler(taskController.updateTaskHandler),
)

taskRouter.delete(
  '/:id',
  requirePermission('tasks:write', 'projects:write'),
  asyncHandler(taskController.deleteTaskHandler),
)

taskRouter.patch(
  '/:id/move',
  requirePermission('tasks:write', 'projects:write'),
  validate(moveTaskSchema),
  asyncHandler(taskController.moveTaskHandler),
)

taskRouter.post(
  '/:id/attachments',
  requirePermission('tasks:write', 'projects:write'),
  validate(createAttachmentSchema),
  asyncHandler(taskController.addTaskAttachmentHandler),
)

taskRouter.delete(
  '/:id/attachments/:attachmentId',
  requirePermission('tasks:write', 'projects:write'),
  asyncHandler(taskController.deleteTaskAttachmentHandler),
)

export default taskRouter
