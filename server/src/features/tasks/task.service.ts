import { Types } from 'mongoose'
import { AppError } from '../../utils/AppError.js'
import {
  buildPaginatedResult,
  parsePagination,
} from '../../utils/pagination.js'
import { User } from '../auth/user.model.js'
import { resolveActorFullName } from '../notifications/actor-name.js'
import { dispatchDomainEventSafe } from '../notifications/notification.service.js'
import { Milestone } from '../projects/milestone.model.js'
import { Project, type IProject } from '../projects/project.model.js'
import {
  assertCanManageBoard,
  ensureProjectColumns,
  getProjectForTaskActor,
  isBoardManager,
  listColumns,
  statusFromColumnKind,
  toBoardColumnDto,
  type BoardColumnDto,
  type TaskActor,
} from './board.service.js'
import { BoardColumn } from './board-column.model.js'
import {
  Task,
  MAX_TASK_ATTACHMENTS,
  type ITask,
  type TaskPriority,
  type TaskStatus,
} from './task.model.js'
import type {
  CreateAttachmentInput,
  CreateTaskInput,
  ListMyTasksQuery,
  MoveTaskInput,
  QuickCreateTaskInput,
  TaskStatsQuery,
  UpdateTaskInput,
} from './task.validation.js'

export type BoardMemberDto = {
  id: string
  name: string
  initials: string
  colorClass: string
}

export type BoardMilestoneDto = {
  id: string
  name: string
  colorClass: string
}

export type BoardSubtaskDto = {
  id: string
  text: string
  done: boolean
}

export type BoardAttachmentDto = {
  id: string
  url: string
  publicId: string | null
  fileName: string
  mimeType: string
  sizeBytes: number
  sortOrder: number
  createdAt: string
}

export type BoardTaskDto = {
  id: string
  projectId: string
  title: string
  description: string
  assigneeId: string | null
  priority: TaskPriority
  status: TaskStatus
  dueDate: string
  milestoneId: string | null
  subtasks: BoardSubtaskDto[]
  comments: number
  attachments: number
  attachmentItems: BoardAttachmentDto[]
  columnId: string
  image: string | null
  sortOrder: number
}

export type MyTaskDto = {
  id: string
  name: string
  project: string
  projectId: string
  assignedBy: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  status: 'in_progress' | 'completed' | 'hold' | 'overdue'
  actionVariant: 'view' | 'menu'
}

export type TaskHubItemDto = {
  id: string
  title: string
  projectId: string
  projectName: string
  dueDate: string
}

export type TaskStatsDto = {
  total: number
  inProgress: number
  completed: number
  overdue: number
  overdueItems?: TaskHubItemDto[]
}

export type TaskProgressPoint = {
  month: string
  completed: number
}

const MEMBER_COLORS = [
  'bg-primary',
  'bg-success',
  'bg-warning',
  'bg-[#D9527E]',
  'bg-[#7C3AED]',
  'bg-[#0EA5E9]',
]

function toDateString(value: Date): string {
  return value.toISOString().slice(0, 10)
}

function memberInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function colorForId(id: string): string {
  const n = Number.parseInt(id.slice(-2), 16)
  return MEMBER_COLORS[Number.isFinite(n) ? n % MEMBER_COLORS.length : 0]!
}

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function isOverdue(task: { dueDate?: Date | null; status: TaskStatus }): boolean {
  if (!task.dueDate || task.status === 'done') return false
  return task.dueDate < startOfToday()
}

/** Stamp completion time when entering `done`; clear when reopened. */
function syncCompletedAt(task: ITask, previousStatus: TaskStatus): void {
  if (task.status === 'done' && previousStatus !== 'done') {
    task.completedAt = new Date()
  } else if (task.status !== 'done' && previousStatus === 'done') {
    task.completedAt = null
  }
}

function toBoardAttachmentDto(
  item: ITask['attachmentItems'][number],
): BoardAttachmentDto {
  return {
    id: item._id.toString(),
    url: item.url,
    publicId: item.publicId ?? null,
    fileName: item.fileName,
    mimeType: item.mimeType,
    sizeBytes: item.sizeBytes,
    sortOrder: item.sortOrder,
    createdAt: (item.createdAt ?? new Date()).toISOString(),
  }
}

function syncCoverImage(task: ITask): void {
  const items = [...(task.attachmentItems ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)
  task.attachmentCount = items.length
  if (items.length === 0) {
    task.image = null
    return
  }
  // Keep existing cover if it still exists; otherwise use first attachment
  const stillHasCover = task.image && items.some((i) => i.url === task.image)
  if (!stillHasCover) {
    task.image = items[0]!.url
  }
}

function toBoardTaskDto(task: ITask): BoardTaskDto {
  const items = [...(task.attachmentItems ?? [])]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(toBoardAttachmentDto)

  return {
    id: task._id.toString(),
    projectId: task.projectId.toString(),
    title: task.title,
    description: task.description ?? '',
    assigneeId: task.assigneeId ? task.assigneeId.toString() : null,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate ? toDateString(task.dueDate) : '',
    milestoneId: task.milestoneId ? task.milestoneId.toString() : null,
    subtasks: (task.subtasks ?? []).map((s) => ({
      id: s._id.toString(),
      text: s.text,
      done: s.done,
    })),
    comments: task.commentCount ?? 0,
    attachments: task.attachmentCount ?? items.length,
    attachmentItems: items,
    columnId: task.columnId.toString(),
    image: task.image ?? null,
    sortOrder: task.sortOrder,
  }
}

function canEditTask(project: IProject, task: ITask, acting: TaskActor): boolean {
  if (isBoardManager(project, acting)) return true
  if (!acting.canWriteTasks) return false
  return Boolean(task.assigneeId && task.assigneeId.toString() === acting.id)
}

function assertCanEditTask(project: IProject, task: ITask, acting: TaskActor): void {
  if (!canEditTask(project, task, acting)) {
    throw new AppError('Insufficient permissions', 403, 'FORBIDDEN')
  }
}

async function resolveBoardMembers(project: IProject): Promise<BoardMemberDto[]> {
  const ids = [
    project.managerId,
    ...project.teamMemberIds.filter((id) => !id.equals(project.managerId)),
  ]
  if (ids.length === 0) return []

  const users = await User.find({ _id: { $in: ids } }).select('fullName')
  const byId = new Map(users.map((u) => [u._id.toString(), u]))

  return ids
    .map((id) => {
      const user = byId.get(id.toString())
      if (!user) return null
      const name = user.fullName
      return {
        id: id.toString(),
        name,
        initials: memberInitials(name),
        colorClass: colorForId(id.toString()),
      }
    })
    .filter((m): m is BoardMemberDto => Boolean(m))
}

async function resolveBoardMilestones(projectId: string): Promise<BoardMilestoneDto[]> {
  const milestones = await Milestone.find({ projectId }).sort({ sortOrder: 1 })
  return milestones.map((m) => ({
    id: m._id.toString(),
    name: m.title,
    colorClass: colorForId(m._id.toString()),
  }))
}

async function getColumnOrThrow(
  projectId: Types.ObjectId | string,
  columnId: string,
  companyId: string,
) {
  const column = await BoardColumn.findOne({
    _id: columnId,
    projectId,
    companyId,
  })
  if (!column) {
    throw new AppError('Column not found', 404, 'COLUMN_NOT_FOUND')
  }
  return column
}

export async function getBoard(
  projectId: string,
  acting: TaskActor,
): Promise<{
  projectId: string
  projectName: string
  columns: BoardColumnDto[]
  tasks: BoardTaskDto[]
  members: BoardMemberDto[]
  milestones: BoardMilestoneDto[]
  canManageBoard: boolean
}> {
  const project = await getProjectForTaskActor(projectId, acting)
  await ensureProjectColumns(projectId, acting)

  const [columns, tasks, members, milestones] = await Promise.all([
    BoardColumn.find({ projectId: project._id, companyId: acting.companyId }).sort({
      sortOrder: 1,
    }),
    Task.find({ projectId: project._id, companyId: acting.companyId }).sort({
      columnId: 1,
      sortOrder: 1,
    }),
    resolveBoardMembers(project),
    resolveBoardMilestones(projectId),
  ])

  return {
    projectId: project._id.toString(),
    projectName: project.name,
    columns: columns.map(toBoardColumnDto),
    tasks: tasks.map(toBoardTaskDto),
    members,
    milestones,
    canManageBoard: isBoardManager(project, acting),
  }
}

export async function createTask(
  projectId: string,
  payload: CreateTaskInput,
  acting: TaskActor,
): Promise<BoardTaskDto> {
  const project = await getProjectForTaskActor(projectId, acting)
  if (!acting.canWriteTasks && !isBoardManager(project, acting)) {
    throw new AppError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  await ensureProjectColumns(projectId, acting)
  const column = await getColumnOrThrow(project._id, payload.columnId, acting.companyId)

  const teamIds = new Set([
    project.managerId.toString(),
    ...project.teamMemberIds.map((id) => id.toString()),
  ])
  const resolvedAssigneeId =
    payload.assigneeId === undefined
      ? teamIds.has(acting.id)
        ? acting.id
        : null
      : payload.assigneeId

  if (resolvedAssigneeId && !teamIds.has(resolvedAssigneeId)) {
    throw new AppError('Assignee must be on the project team', 400, 'INVALID_ASSIGNEE')
  }

  if (payload.milestoneId) {
    const milestone = await Milestone.findOne({
      _id: payload.milestoneId,
      projectId: project._id,
      companyId: acting.companyId,
    })
    if (!milestone) {
      throw new AppError('Milestone not found', 404, 'MILESTONE_NOT_FOUND')
    }
  }

  const maxOrder = await Task.findOne({
    projectId: project._id,
    columnId: column._id,
  })
    .sort({ sortOrder: -1 })
    .select('sortOrder')

  const status =
    payload.status ?? statusFromColumnKind(column.columnKind)

  const task = await Task.create({
    companyId: acting.companyId,
    projectId: project._id,
    columnId: column._id,
    sortOrder: (maxOrder?.sortOrder ?? -1) + 1,
    title: payload.title,
    description: payload.description ?? '',
    assigneeId: resolvedAssigneeId,
    createdById: acting.id,
    milestoneId: payload.milestoneId ?? null,
    priority: payload.priority ?? 'medium',
    status,
    completedAt: status === 'done' ? new Date() : null,
    dueDate: payload.dueDate ?? null,
    subtasks: (payload.subtasks ?? []).map((s, index) => ({
      text: s.text,
      done: s.done ?? false,
      sortOrder: index,
    })),
  })

  if (resolvedAssigneeId && resolvedAssigneeId !== acting.id) {
    const assignee = await User.findById(resolvedAssigneeId).select('fullName')
    await dispatchDomainEventSafe({
      type: 'task.assigned',
      actor: {
        id: acting.id,
        fullName: await resolveActorFullName(acting.id),
        companyId: acting.companyId,
      },
      entityId: task._id.toString(),
      subjectUserId: resolvedAssigneeId,
      context: {
        entityLabel: task.title,
        subjectName: assignee?.fullName,
      },
    })
  }

  return toBoardTaskDto(task)
}

export async function quickCreateTask(
  projectId: string,
  payload: QuickCreateTaskInput,
  acting: TaskActor,
): Promise<BoardTaskDto> {
  return createTask(
    projectId,
    {
      title: payload.title,
      columnId: payload.columnId,
      assigneeId: acting.id,
      priority: 'medium',
    },
    acting,
  )
}

export async function getTaskById(
  taskId: string,
  acting: TaskActor,
): Promise<BoardTaskDto> {
  const task = await Task.findOne({ _id: taskId, companyId: acting.companyId })
  if (!task) {
    throw new AppError('Task not found', 404, 'TASK_NOT_FOUND')
  }
  await getProjectForTaskActor(task.projectId.toString(), acting)
  return toBoardTaskDto(task)
}

export async function updateTask(
  taskId: string,
  payload: UpdateTaskInput,
  acting: TaskActor,
): Promise<BoardTaskDto> {
  const task = await Task.findOne({ _id: taskId, companyId: acting.companyId })
  if (!task) {
    throw new AppError('Task not found', 404, 'TASK_NOT_FOUND')
  }

  const project = await getProjectForTaskActor(task.projectId.toString(), acting)
  assertCanEditTask(project, task, acting)

  const previousAssigneeId = task.assigneeId?.toString() ?? null
  const previousStatus = task.status

  if (payload.title !== undefined) task.title = payload.title
  if (payload.description !== undefined) task.description = payload.description
  if (payload.priority !== undefined) task.priority = payload.priority
  if (payload.status !== undefined) task.status = payload.status
  if (payload.dueDate !== undefined) task.dueDate = payload.dueDate
  if (payload.image !== undefined) task.image = payload.image
  if (payload.assigneeId !== undefined) {
    task.assigneeId = payload.assigneeId
      ? new Types.ObjectId(payload.assigneeId)
      : null
  }
  if (payload.milestoneId !== undefined) {
    if (payload.milestoneId) {
      const milestone = await Milestone.findOne({
        _id: payload.milestoneId,
        projectId: project._id,
        companyId: acting.companyId,
      })
      if (!milestone) {
        throw new AppError('Milestone not found', 404, 'MILESTONE_NOT_FOUND')
      }
      task.milestoneId = new Types.ObjectId(payload.milestoneId)
    } else {
      task.milestoneId = null
    }
  }
  if (payload.subtasks !== undefined) {
    task.subtasks = payload.subtasks.map((s, index) => ({
      _id: s.id ? new Types.ObjectId(s.id) : new Types.ObjectId(),
      text: s.text,
      done: s.done,
      sortOrder: index,
    }))
  }

  syncCompletedAt(task, previousStatus)
  await task.save()

  const actorName = await resolveActorFullName(acting.id)
  const newAssigneeId = task.assigneeId?.toString() ?? null
  if (
    payload.assigneeId !== undefined &&
    newAssigneeId &&
    newAssigneeId !== previousAssigneeId &&
    newAssigneeId !== acting.id
  ) {
    const assignee = await User.findById(newAssigneeId).select('fullName')
    await dispatchDomainEventSafe({
      type: 'task.assigned',
      actor: { id: acting.id, fullName: actorName, companyId: acting.companyId },
      entityId: task._id.toString(),
      subjectUserId: newAssigneeId,
      context: { entityLabel: task.title, subjectName: assignee?.fullName },
    })
  }

  if (
    payload.status !== undefined &&
    task.status === 'done' &&
    previousStatus !== 'done'
  ) {
    const creatorId = task.createdById.toString()
    await dispatchDomainEventSafe({
      type: 'task.completed',
      actor: { id: acting.id, fullName: actorName, companyId: acting.companyId },
      entityId: task._id.toString(),
      extraRecipientIds: creatorId !== acting.id ? [creatorId] : [],
      context: { entityLabel: task.title },
    })
  }

  return toBoardTaskDto(task)
}

export async function deleteTask(taskId: string, acting: TaskActor): Promise<void> {
  const task = await Task.findOne({ _id: taskId, companyId: acting.companyId })
  if (!task) {
    throw new AppError('Task not found', 404, 'TASK_NOT_FOUND')
  }

  const project = await getProjectForTaskActor(task.projectId.toString(), acting)
  assertCanEditTask(project, task, acting)

  await task.deleteOne()
}

export async function moveTask(
  taskId: string,
  payload: MoveTaskInput,
  acting: TaskActor,
): Promise<BoardTaskDto> {
  const task = await Task.findOne({ _id: taskId, companyId: acting.companyId })
  if (!task) {
    throw new AppError('Task not found', 404, 'TASK_NOT_FOUND')
  }

  const project = await getProjectForTaskActor(task.projectId.toString(), acting)
  assertCanEditTask(project, task, acting)

  const column = await getColumnOrThrow(project._id, payload.columnId, acting.companyId)
  const oldColumnId = task.columnId.toString()
  const sameColumn = oldColumnId === column._id.toString()

  const siblings = await Task.find({
    projectId: project._id,
    columnId: column._id,
    ...(sameColumn ? { _id: { $ne: task._id } } : {}),
  }).sort({ sortOrder: 1 })

  let insertAt = payload.sortOrder
  if (insertAt === undefined) {
    insertAt = sameColumn ? task.sortOrder : siblings.length
  }
  insertAt = Math.max(0, Math.min(insertAt, siblings.length))

  const orderedIds = siblings.map((s) => s._id.toString())
  orderedIds.splice(insertAt, 0, task._id.toString())

  const previousStatus = task.status
  task.columnId = column._id
  task.status = statusFromColumnKind(column.columnKind)
  task.sortOrder = insertAt
  syncCompletedAt(task, previousStatus)
  await task.save()

  if (task.status === 'done' && previousStatus !== 'done') {
    const creatorId = task.createdById.toString()
    await dispatchDomainEventSafe({
      type: 'task.completed',
      actor: {
        id: acting.id,
        fullName: await resolveActorFullName(acting.id),
        companyId: acting.companyId,
      },
      entityId: task._id.toString(),
      extraRecipientIds: creatorId !== acting.id ? [creatorId] : [],
      context: { entityLabel: task.title },
    })
  }

  await Promise.all(
    orderedIds.map((id, index) =>
      Task.updateOne({ _id: id }, { $set: { sortOrder: index } }),
    ),
  )

  if (!sameColumn) {
    const oldSiblings = await Task.find({
      projectId: project._id,
      columnId: oldColumnId,
    }).sort({ sortOrder: 1 })
    await Promise.all(
      oldSiblings.map((sibling, index) =>
        sibling.sortOrder === index
          ? Promise.resolve()
          : Task.updateOne({ _id: sibling._id }, { $set: { sortOrder: index } }),
      ),
    )
  }

  const refreshed = await Task.findById(task._id)
  return toBoardTaskDto(refreshed ?? task)
}

export async function addTaskAttachment(
  taskId: string,
  payload: CreateAttachmentInput,
  acting: TaskActor,
): Promise<BoardTaskDto> {
  const task = await Task.findOne({ _id: taskId, companyId: acting.companyId })
  if (!task) {
    throw new AppError('Task not found', 404, 'TASK_NOT_FOUND')
  }

  const project = await getProjectForTaskActor(task.projectId.toString(), acting)
  assertCanEditTask(project, task, acting)

  const current = task.attachmentItems ?? []
  if (current.length >= MAX_TASK_ATTACHMENTS) {
    throw new AppError(
      `A task can have at most ${MAX_TASK_ATTACHMENTS} attachments`,
      400,
      'ATTACHMENT_LIMIT',
    )
  }

  const nextOrder =
    current.length === 0
      ? 0
      : Math.max(...current.map((a) => a.sortOrder)) + 1

  task.attachmentItems.push({
    _id: new Types.ObjectId(),
    url: payload.url,
    publicId: payload.publicId ?? null,
    fileName: payload.fileName,
    mimeType: payload.mimeType,
    sizeBytes: payload.sizeBytes,
    sortOrder: nextOrder,
    createdById: new Types.ObjectId(acting.id),
    createdAt: new Date(),
  })

  syncCoverImage(task)
  await task.save()
  return toBoardTaskDto(task)
}

export async function deleteTaskAttachment(
  taskId: string,
  attachmentId: string,
  acting: TaskActor,
): Promise<BoardTaskDto> {
  const task = await Task.findOne({ _id: taskId, companyId: acting.companyId })
  if (!task) {
    throw new AppError('Task not found', 404, 'TASK_NOT_FOUND')
  }

  const project = await getProjectForTaskActor(task.projectId.toString(), acting)
  assertCanEditTask(project, task, acting)

  const before = task.attachmentItems.length
  task.attachmentItems = task.attachmentItems.filter(
    (item) => item._id.toString() !== attachmentId,
  )
  if (task.attachmentItems.length === before) {
    throw new AppError('Attachment not found', 404, 'ATTACHMENT_NOT_FOUND')
  }

  task.attachmentItems.forEach((item, index) => {
    item.sortOrder = index
  })
  syncCoverImage(task)
  await task.save()
  return toBoardTaskDto(task)
}

function mapListStatus(
  task: ITask,
): MyTaskDto['status'] {
  if (isOverdue(task)) return 'overdue'
  if (task.status === 'done') return 'completed'
  if (task.status === 'hold') return 'hold'
  return 'in_progress'
}

function mapListPriority(priority: TaskPriority): Exclude<MyTaskDto['priority'], 'active'> {
  return priority === 'urgent' ? 'high' : priority
}

export async function listMyTasks(
  query: ListMyTasksQuery,
  acting: TaskActor,
) {
  const { page, limit, skip } = parsePagination(query)

  const filter: Record<string, unknown> = {
    companyId: acting.companyId,
    assigneeId: acting.id,
  }

  if (query.search?.trim()) {
    filter.title = { $regex: query.search.trim(), $options: 'i' }
  }

  const progress = query.progress ?? 'all'
  const statusFilter = query.status ?? 'all'

  if (progress === 'in_progress' || statusFilter === 'in_progress') {
    filter.status = 'in_progress'
  } else if (
    progress === 'completed' ||
    statusFilter === 'done' ||
    statusFilter === 'completed'
  ) {
    filter.status = 'done'
  } else if (statusFilter === 'hold') {
    filter.status = 'hold'
  } else if (statusFilter === 'todo') {
    filter.status = 'todo'
  } else if (progress === 'overdue' || statusFilter === 'overdue') {
    filter.status = { $ne: 'done' }
    filter.dueDate = { $lt: startOfToday() }
  }

  const [tasks, total] = await Promise.all([
    Task.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit),
    Task.countDocuments(filter),
  ])

  const projectIds = [...new Set(tasks.map((t) => t.projectId.toString()))]
  const creatorIds = [...new Set(tasks.map((t) => t.createdById.toString()))]

  const [projects, creators] = await Promise.all([
    Project.find({ _id: { $in: projectIds } }).select('name'),
    User.find({ _id: { $in: creatorIds } }).select('fullName'),
  ])

  const projectNameById = new Map(projects.map((p) => [p._id.toString(), p.name]))
  const creatorNameById = new Map(creators.map((u) => [u._id.toString(), u.fullName]))

  const items: MyTaskDto[] = tasks.map((task) => ({
    id: task._id.toString(),
    name: task.title,
    project: projectNameById.get(task.projectId.toString()) ?? 'Unknown project',
    projectId: task.projectId.toString(),
    assignedBy: creatorNameById.get(task.createdById.toString()) ?? 'Unknown',
    dueDate: task.dueDate
      ? task.dueDate.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '—',
    priority: mapListPriority(task.priority),
    status: mapListStatus(task),
    actionVariant: 'view',
  }))

  return {
    tasks: items,
    pagination: buildPaginatedResult(items, total, page, limit).pagination,
  }
}

function assertCanUseCompanyTaskScope(acting: TaskActor): void {
  if (acting.role === 'employee') {
    throw new AppError('Company task scope is not available for this role', 403, 'FORBIDDEN')
  }
}

async function buildTaskStatsFilter(
  query: TaskStatsQuery,
  acting: TaskActor,
): Promise<Record<string, unknown>> {
  const filter: Record<string, unknown> = {
    companyId: acting.companyId,
  }

  if (query.scope === 'mine') {
    filter.assigneeId = acting.id
    return filter
  }

  if (query.scope === 'company') {
    assertCanUseCompanyTaskScope(acting)
    return filter
  }

  if (query.projectId) {
    await getProjectForTaskActor(query.projectId, acting)
    filter.projectId = query.projectId
    return filter
  }

  throw new AppError('projectId is required for project scope', 400, 'PROJECT_ID_REQUIRED')
}

export async function getTaskStats(
  query: TaskStatsQuery,
  acting: TaskActor,
): Promise<TaskStatsDto> {
  const filter = await buildTaskStatsFilter(query, acting)
  const today = startOfToday()
  const overdueFilter = {
    ...filter,
    status: { $ne: 'done' },
    dueDate: { $lt: today },
  }

  const [total, inProgress, completed, overdue] = await Promise.all([
    Task.countDocuments(filter),
    Task.countDocuments({ ...filter, status: 'in_progress' }),
    Task.countDocuments({ ...filter, status: 'done' }),
    Task.countDocuments(overdueFilter),
  ])

  const result: TaskStatsDto = { total, inProgress, completed, overdue }

  if (query.scope === 'company' || query.scope === 'project') {
    const limit = query.limit ?? 5
    const overdueTasks = await Task.find(overdueFilter)
      .sort({ dueDate: 1 })
      .limit(limit)
      .select('title projectId dueDate')

    const projectIds = [...new Set(overdueTasks.map((t) => t.projectId.toString()))]
    const projects = await Project.find({
      _id: { $in: projectIds },
      companyId: acting.companyId,
    }).select('name')
    const projectNameById = new Map(projects.map((p) => [p._id.toString(), p.name]))

    result.overdueItems = overdueTasks.map((task) => ({
      id: task._id.toString(),
      title: task.title,
      projectId: task.projectId.toString(),
      projectName: projectNameById.get(task.projectId.toString()) ?? 'Project',
      dueDate: task.dueDate ? toDateString(task.dueDate) : '',
    }))
  }

  return result
}

export async function getTaskProgress(
  query: TaskStatsQuery,
  acting: TaskActor,
  months = 6,
): Promise<TaskProgressPoint[]> {
  const filter = await buildTaskStatsFilter(query, acting)
  filter.status = 'done'

  const now = new Date()
  const rangeStart = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)
  const rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

  const match: Record<string, unknown> = {
    status: 'done',
    companyId: new Types.ObjectId(String(filter.companyId)),
    updatedAt: { $gte: rangeStart, $lt: rangeEnd },
  }
  if (filter.assigneeId) {
    match.assigneeId = new Types.ObjectId(String(filter.assigneeId))
  }
  if (filter.projectId) {
    match.projectId = new Types.ObjectId(String(filter.projectId))
  }

  const rows = await Task.aggregate<{ _id: string; completed: number }>([
    { $match: match },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m', date: '$updatedAt', timezone },
        },
        completed: { $sum: 1 },
      },
    },
  ])

  const byMonth = new Map(rows.map((row) => [row._id, row.completed]))
  const series: TaskProgressPoint[] = []
  for (let i = months - 1; i >= 0; i -= 1) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = start.toLocaleString('en-US', { month: 'short' })
    const key = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`
    series.push({ month: label, completed: byMonth.get(key) ?? 0 })
  }

  return series
}

export { listColumns, assertCanManageBoard }
