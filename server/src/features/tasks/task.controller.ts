import type { Request, Response } from 'express'
import { AppError } from '../../utils/AppError.js'
import { sendSuccess } from '../../utils/apiResponse.js'
import type { UserRole } from '../auth/auth.types.js'
import { hasPermission, type Permission } from '../auth/permissions.js'
import { enrichAuthUser } from '../auth/auth-user.helper.js'
import { User } from '../auth/user.model.js'
import {
  createColumn,
  deleteColumn,
  reorderColumns,
  updateColumn,
  type TaskActor,
} from './board.service.js'
import {
  createTask,
  deleteTask,
  deleteTaskAttachment,
  addTaskAttachment,
  getBoard,
  getTaskById,
  getTaskProgress,
  getTaskStats,
  listMyTasks,
  moveTask,
  quickCreateTask,
  updateTask,
} from './task.service.js'
import type {
  CreateAttachmentInput,
  CreateColumnInput,
  CreateTaskInput,
  ListMyTasksQuery,
  MoveTaskInput,
  QuickCreateTaskInput,
  ReorderColumnsInput,
  TaskStatsQuery,
  UpdateColumnInput,
  UpdateTaskInput,
} from './task.validation.js'
import { deleteColumnSchema } from './task.validation.js'

export async function getTaskActor(req: Request): Promise<TaskActor> {
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
  const perms = authUser.permissions as Permission[] | undefined

  return {
    id: req.user!.id,
    companyId,
    role,
    canWriteTasks: hasPermission(role, 'tasks:write', perms),
    canWriteProjects: hasPermission(role, 'projects:write', perms),
  }
}

export async function getBoardHandler(req: Request, res: Response): Promise<void> {
  const board = await getBoard(req.params.id as string, await getTaskActor(req))
  sendSuccess(res, { board })
}

export async function createColumnHandler(req: Request, res: Response): Promise<void> {
  const column = await createColumn(
    req.params.id as string,
    req.body as CreateColumnInput,
    await getTaskActor(req),
  )
  sendSuccess(res, { column }, { statusCode: 201, message: 'Column created successfully' })
}

export async function updateColumnHandler(req: Request, res: Response): Promise<void> {
  const column = await updateColumn(
    req.params.id as string,
    req.params.columnId as string,
    req.body as UpdateColumnInput,
    await getTaskActor(req),
  )
  sendSuccess(res, { column }, { message: 'Column updated successfully' })
}

export async function deleteColumnHandler(req: Request, res: Response): Promise<void> {
  const payload = deleteColumnSchema.parse(req.body ?? {})
  const result = await deleteColumn(
    req.params.id as string,
    req.params.columnId as string,
    payload,
    await getTaskActor(req),
  )
  sendSuccess(res, result, { message: 'Column deleted successfully' })
}

export async function reorderColumnsHandler(req: Request, res: Response): Promise<void> {
  const columns = await reorderColumns(
    req.params.id as string,
    req.body as ReorderColumnsInput,
    await getTaskActor(req),
  )
  sendSuccess(res, { columns }, { message: 'Columns reordered successfully' })
}

export async function createTaskHandler(req: Request, res: Response): Promise<void> {
  const task = await createTask(
    req.params.id as string,
    req.body as CreateTaskInput,
    await getTaskActor(req),
  )
  sendSuccess(res, { task }, { statusCode: 201, message: 'Task created successfully' })
}

export async function quickCreateTaskHandler(req: Request, res: Response): Promise<void> {
  const task = await quickCreateTask(
    req.params.id as string,
    req.body as QuickCreateTaskInput,
    await getTaskActor(req),
  )
  sendSuccess(res, { task }, { statusCode: 201, message: 'Task created successfully' })
}

export async function getTaskHandler(req: Request, res: Response): Promise<void> {
  const task = await getTaskById(req.params.id as string, await getTaskActor(req))
  sendSuccess(res, { task })
}

export async function updateTaskHandler(req: Request, res: Response): Promise<void> {
  const task = await updateTask(
    req.params.id as string,
    req.body as UpdateTaskInput,
    await getTaskActor(req),
  )
  sendSuccess(res, { task }, { message: 'Task updated successfully' })
}

export async function deleteTaskHandler(req: Request, res: Response): Promise<void> {
  await deleteTask(req.params.id as string, await getTaskActor(req))
  sendSuccess(res, { message: 'Task deleted successfully' })
}

export async function moveTaskHandler(req: Request, res: Response): Promise<void> {
  const task = await moveTask(
    req.params.id as string,
    req.body as MoveTaskInput,
    await getTaskActor(req),
  )
  sendSuccess(res, { task }, { message: 'Task moved successfully' })
}

export async function addTaskAttachmentHandler(req: Request, res: Response): Promise<void> {
  const task = await addTaskAttachment(
    req.params.id as string,
    req.body as CreateAttachmentInput,
    await getTaskActor(req),
  )
  sendSuccess(res, { task }, { statusCode: 201, message: 'Attachment added successfully' })
}

export async function deleteTaskAttachmentHandler(req: Request, res: Response): Promise<void> {
  const task = await deleteTaskAttachment(
    req.params.id as string,
    req.params.attachmentId as string,
    await getTaskActor(req),
  )
  sendSuccess(res, { task }, { message: 'Attachment removed successfully' })
}

export async function listMyTasksHandler(req: Request, res: Response): Promise<void> {
  const result = await listMyTasks(
    req.validatedQuery as ListMyTasksQuery,
    await getTaskActor(req),
  )
  sendSuccess(res, result)
}

export async function getTaskStatsHandler(req: Request, res: Response): Promise<void> {
  const stats = await getTaskStats(
    req.validatedQuery as TaskStatsQuery,
    await getTaskActor(req),
  )
  sendSuccess(res, { stats })
}

export async function getTaskProgressHandler(req: Request, res: Response): Promise<void> {
  const progress = await getTaskProgress(
    req.validatedQuery as TaskStatsQuery,
    await getTaskActor(req),
  )
  sendSuccess(res, { progress })
}
