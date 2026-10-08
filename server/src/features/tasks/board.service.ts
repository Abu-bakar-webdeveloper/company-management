import { Types } from 'mongoose'
import { AppError } from '../../utils/AppError.js'
import type { UserRole } from '../auth/auth.types.js'
import { Project, type IProject } from '../projects/project.model.js'
import { BoardColumn, type ColumnKind, type IBoardColumn } from './board-column.model.js'
import type {
  CreateColumnInput,
  DeleteColumnInput,
  ReorderColumnsInput,
  UpdateColumnInput,
} from './task.validation.js'

export type TaskActor = {
  id: string
  companyId: string
  role: UserRole
  canWriteTasks: boolean
  canWriteProjects: boolean
}

export type BoardColumnDto = {
  id: string
  projectId: string
  name: string
  order: number
  wipLimit: number | null
  columnKind: ColumnKind
}

const DEFAULT_COLUMNS: Array<{
  name: string
  columnKind: ColumnKind
  wipLimit: number | null
}> = [
  { name: 'To Do', columnKind: 'todo', wipLimit: null },
  { name: 'In Progress', columnKind: 'in_progress', wipLimit: null },
  { name: 'Done', columnKind: 'done', wipLimit: null },
]

export function toBoardColumnDto(column: IBoardColumn): BoardColumnDto {
  return {
    id: column._id.toString(),
    projectId: column.projectId.toString(),
    name: column.name,
    order: column.sortOrder,
    wipLimit: column.wipLimit ?? null,
    columnKind: column.columnKind,
  }
}

export function statusFromColumnKind(kind: ColumnKind): 'todo' | 'in_progress' | 'done' {
  if (kind === 'in_progress') return 'in_progress'
  if (kind === 'done') return 'done'
  return 'todo'
}

function membershipOk(
  project: { managerId: Types.ObjectId; teamMemberIds: Types.ObjectId[] },
  acting: TaskActor,
) {
  if (acting.role !== 'employee' || acting.canWriteProjects) return true
  return (
    project.managerId.toString() === acting.id ||
    project.teamMemberIds.some((id) => id.toString() === acting.id)
  )
}

export async function getProjectForTaskActor(
  projectId: string,
  acting: TaskActor,
): Promise<IProject> {
  const project = await Project.findOne({ _id: projectId, companyId: acting.companyId })
  if (!project || !membershipOk(project, acting)) {
    throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND')
  }
  return project
}

export function isBoardManager(project: IProject, acting: TaskActor): boolean {
  return (
    acting.canWriteProjects ||
    project.managerId.toString() === acting.id
  )
}

export function assertCanManageBoard(project: IProject, acting: TaskActor): void {
  if (!isBoardManager(project, acting)) {
    throw new AppError('Insufficient permissions', 403, 'FORBIDDEN')
  }
}

export async function seedDefaultColumns(
  projectId: Types.ObjectId | string,
  companyId: Types.ObjectId | string,
): Promise<IBoardColumn[]> {
  const existing = await BoardColumn.countDocuments({ projectId })
  if (existing > 0) {
    return BoardColumn.find({ projectId }).sort({ sortOrder: 1 })
  }

  const companyOid =
    typeof companyId === 'string' ? new Types.ObjectId(companyId) : companyId
  const projectOid =
    typeof projectId === 'string' ? new Types.ObjectId(projectId) : projectId

  const docs = DEFAULT_COLUMNS.map((col, index) => ({
    companyId: companyOid,
    projectId: projectOid,
    name: col.name,
    sortOrder: index,
    wipLimit: col.wipLimit,
    columnKind: col.columnKind,
  }))

  const created = await BoardColumn.insertMany(docs)
  return created as IBoardColumn[]
}

export async function ensureProjectColumns(
  projectId: string,
  acting: TaskActor,
): Promise<IBoardColumn[]> {
  const project = await getProjectForTaskActor(projectId, acting)
  await seedDefaultColumns(project._id, acting.companyId)

  // Clear legacy default WIP of 4 on In Progress so badges show card count only.
  await BoardColumn.updateMany(
    { projectId: project._id, columnKind: 'in_progress', wipLimit: 4 },
    { $set: { wipLimit: null } },
  )

  return BoardColumn.find({ projectId: project._id }).sort({ sortOrder: 1 })
}

export async function listColumns(
  projectId: string,
  acting: TaskActor,
): Promise<BoardColumnDto[]> {
  const columns = await ensureProjectColumns(projectId, acting)
  return columns.map(toBoardColumnDto)
}

export async function createColumn(
  projectId: string,
  payload: CreateColumnInput,
  acting: TaskActor,
): Promise<BoardColumnDto> {
  const project = await getProjectForTaskActor(projectId, acting)
  assertCanManageBoard(project, acting)

  await ensureProjectColumns(projectId, acting)
  const count = await BoardColumn.countDocuments({ projectId: project._id })

  const column = await BoardColumn.create({
    companyId: acting.companyId,
    projectId: project._id,
    name: payload.name,
    sortOrder: count,
    wipLimit: payload.wipLimit ?? null,
    columnKind: payload.columnKind ?? 'custom',
  })

  return toBoardColumnDto(column)
}

export async function updateColumn(
  projectId: string,
  columnId: string,
  payload: UpdateColumnInput,
  acting: TaskActor,
): Promise<BoardColumnDto> {
  const project = await getProjectForTaskActor(projectId, acting)
  assertCanManageBoard(project, acting)

  const column = await BoardColumn.findOne({
    _id: columnId,
    projectId: project._id,
    companyId: acting.companyId,
  })
  if (!column) {
    throw new AppError('Column not found', 404, 'COLUMN_NOT_FOUND')
  }

  if (payload.name !== undefined) column.name = payload.name
  if (payload.wipLimit !== undefined) column.wipLimit = payload.wipLimit
  if (payload.sortOrder !== undefined) column.sortOrder = payload.sortOrder

  await column.save()
  return toBoardColumnDto(column)
}

export async function deleteColumn(
  projectId: string,
  columnId: string,
  payload: DeleteColumnInput,
  acting: TaskActor,
): Promise<{ deletedId: string }> {
  const project = await getProjectForTaskActor(projectId, acting)
  assertCanManageBoard(project, acting)

  const column = await BoardColumn.findOne({
    _id: columnId,
    projectId: project._id,
    companyId: acting.companyId,
  })
  if (!column) {
    throw new AppError('Column not found', 404, 'COLUMN_NOT_FOUND')
  }

  const { Task } = await import('./task.model.js')
  const cardCount = await Task.countDocuments({
    projectId: project._id,
    columnId: column._id,
  })

  if (cardCount > 0) {
    if (!payload.moveToColumnId) {
      throw new AppError(
        'moveToColumnId is required when the column has cards',
        400,
        'MOVE_TARGET_REQUIRED',
      )
    }

    const target = await BoardColumn.findOne({
      _id: payload.moveToColumnId,
      projectId: project._id,
      companyId: acting.companyId,
    })
    if (!target) {
      throw new AppError('Target column not found', 404, 'COLUMN_NOT_FOUND')
    }
    if (target._id.equals(column._id)) {
      throw new AppError('Cannot move cards into the same column', 400, 'INVALID_MOVE_TARGET')
    }

    await Task.updateMany(
      { projectId: project._id, columnId: column._id },
      {
        $set: {
          columnId: target._id,
          status: statusFromColumnKind(target.columnKind),
        },
      },
    )
  }

  await column.deleteOne()
  return { deletedId: columnId }
}

export async function reorderColumns(
  projectId: string,
  payload: ReorderColumnsInput,
  acting: TaskActor,
): Promise<BoardColumnDto[]> {
  const project = await getProjectForTaskActor(projectId, acting)
  assertCanManageBoard(project, acting)

  const columns = await BoardColumn.find({
    projectId: project._id,
    companyId: acting.companyId,
  })

  if (columns.length !== payload.orderedIds.length) {
    throw new AppError('orderedIds must include every column', 400, 'INVALID_REORDER')
  }

  const idSet = new Set(columns.map((c) => c._id.toString()))
  for (const id of payload.orderedIds) {
    if (!idSet.has(id)) {
      throw new AppError('Invalid column id in orderedIds', 400, 'INVALID_REORDER')
    }
  }

  await Promise.all(
    payload.orderedIds.map((id, index) =>
      BoardColumn.updateOne({ _id: id }, { $set: { sortOrder: index } }),
    ),
  )

  const updated = await BoardColumn.find({ projectId: project._id }).sort({ sortOrder: 1 })
  return updated.map(toBoardColumnDto)
}
