import { Router } from 'express'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requirePermission } from '../../middleware/requirePermission.js'
import { validate } from '../../middleware/validate.js'
import * as taskController from './task.controller.js'
import {
  createColumnSchema,
  createTaskSchema,
  quickCreateTaskSchema,
  reorderColumnsSchema,
  updateColumnSchema,
} from './task.validation.js'

/** Mounted on /projects — paths include :id */
const projectBoardRouter = Router()

projectBoardRouter.get(
  '/:id/board',
  requirePermission('projects:read', 'tasks:read'),
  asyncHandler(taskController.getBoardHandler),
)

projectBoardRouter.post(
  '/:id/board/columns',
  requirePermission('projects:write', 'tasks:write'),
  validate(createColumnSchema),
  asyncHandler(taskController.createColumnHandler),
)

projectBoardRouter.patch(
  '/:id/board/columns/:columnId',
  requirePermission('projects:write', 'tasks:write'),
  validate(updateColumnSchema),
  asyncHandler(taskController.updateColumnHandler),
)

projectBoardRouter.delete(
  '/:id/board/columns/:columnId',
  requirePermission('projects:write', 'tasks:write'),
  asyncHandler(taskController.deleteColumnHandler),
)

projectBoardRouter.post(
  '/:id/board/columns/reorder',
  requirePermission('projects:write', 'tasks:write'),
  validate(reorderColumnsSchema),
  asyncHandler(taskController.reorderColumnsHandler),
)

projectBoardRouter.post(
  '/:id/tasks',
  requirePermission('tasks:write', 'projects:write'),
  validate(createTaskSchema),
  asyncHandler(taskController.createTaskHandler),
)

projectBoardRouter.post(
  '/:id/tasks/quick',
  requirePermission('tasks:write', 'projects:write'),
  validate(quickCreateTaskSchema),
  asyncHandler(taskController.quickCreateTaskHandler),
)

export default projectBoardRouter
