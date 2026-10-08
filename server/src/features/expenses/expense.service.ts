import { Types } from 'mongoose'
import { AppError } from '../../utils/AppError.js'
import {
  buildPaginatedResult,
  buildSearchFilter,
  parsePagination,
} from '../../utils/pagination.js'
import type { UserRole } from '../auth/auth.types.js'
import { hasPermission, type Permission } from '../auth/permissions.js'
import { User } from '../auth/user.model.js'
import { dispatchDomainEventSafe } from '../notifications/notification.service.js'
import { Project } from '../projects/project.model.js'
import {
  Expense,
  type ExpenseActivityType,
  type ExpenseCategory,
  type ExpenseReceipt,
  type ExpenseStatus,
  type ExpenseType,
  type IExpense,
} from './expense.model.js'
import type {
  ApprovedTotalQuery,
  CreateExpenseInput,
  ListExpensesQuery,
  UpdateExpenseInput,
  UpdateExpenseStatusInput,
} from './expense.validation.js'

export type ExpenseActor = {
  id: string
  companyId: string
  role: UserRole
  fullName: string
  permissions: Permission[]
}

export function buildExpenseActor(
  id: string,
  companyId: string,
  role: UserRole,
  fullName: string,
  permissions: Permission[] = [],
): ExpenseActor {
  return { id, companyId, role, fullName, permissions }
}

function canManageExpenses(actor: ExpenseActor): boolean {
  return (
    actor.role === 'admin' ||
    actor.role === 'hr' ||
    hasPermission(actor.role, 'expenses:write', actor.permissions)
  )
}

function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function formatFileSizeLabel(bytesLabel: string): string {
  return bytesLabel
}

async function nextRequestId(companyId: string): Promise<string> {
  const latest = await Expense.findOne({ companyId }).sort({ createdAt: -1 }).select('requestId')
  const match = latest?.requestId?.match(/EXP-(\d+)/i)
  const next = match ? Number(match[1]) + 1 : 1
  return `EXP-${String(next).padStart(4, '0')}`
}

function pushActivity(
  doc: IExpense,
  type: ExpenseActivityType,
  actor: ExpenseActor,
  note?: string,
): void {
  doc.activities.unshift({
    type,
    actorId: new Types.ObjectId(actor.id),
    actorName: actor.fullName,
    ...(note ? { note } : {}),
    createdAt: new Date(),
  })
}

function periodBounds(period: 'this_month' | 'last_month'): { start: Date; end: Date } {
  const now = new Date()
  let year = now.getUTCFullYear()
  let month = now.getUTCMonth()
  if (period === 'last_month') {
    month -= 1
    if (month < 0) {
      month = 11
      year -= 1
    }
  }
  const start = new Date(Date.UTC(year, month, 1))
  const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999))
  return { start, end }
}

export type ExpenseDto = {
  id: string
  requestId: string
  title: string
  expenseType: ExpenseType
  category: ExpenseCategory
  employeeId?: string
  employeeName?: string
  employeeAvatar?: string
  projectId?: string
  projectName?: string
  billingPeriodMonth?: number
  billingPeriodYear?: number
  eventName?: string
  eventDate?: string
  amount: number
  date: string
  status: ExpenseStatus
  description: string
  receipt?: {
    filename: string
    size: string
    type: string
    url?: string
  }
  activities: {
    id: string
    type: ExpenseActivityType
    actor: string
    timestamp: string
    note?: string
  }[]
  projectBudgetSpent: number
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string
}

async function getProjectBudgetSpent(
  companyId: string,
  projectId: string,
): Promise<number> {
  const result = await Expense.aggregate<{ total: number }>([
    {
      $match: {
        companyId: new Types.ObjectId(companyId),
        projectId: new Types.ObjectId(projectId),
        status: 'approved',
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ])
  return result[0]?.total ?? 0
}

async function toDto(doc: IExpense, projectBudgetSpent?: number): Promise<ExpenseDto> {
  const projectId = doc.projectId?.toString()
  const spent =
    projectBudgetSpent ??
    (projectId ? await getProjectBudgetSpent(doc.companyId.toString(), projectId) : 0)

  return {
    id: doc._id.toString(),
    requestId: doc.requestId,
    title: doc.title,
    expenseType: doc.expenseType ?? 'employee',
    category: doc.category,
    ...(doc.employeeId
      ? {
          employeeId: doc.employeeId.toString(),
          employeeName: doc.employeeName ?? 'Unknown',
          ...(doc.employeeAvatar ? { employeeAvatar: doc.employeeAvatar } : {}),
        }
      : {}),
    ...(projectId
      ? {
          projectId,
          projectName: doc.projectName ?? 'Unknown',
        }
      : {}),
    ...(doc.billingPeriodMonth ? { billingPeriodMonth: doc.billingPeriodMonth } : {}),
    ...(doc.billingPeriodYear ? { billingPeriodYear: doc.billingPeriodYear } : {}),
    ...(doc.eventName ? { eventName: doc.eventName } : {}),
    ...(doc.eventDate ? { eventDate: formatDateOnly(doc.eventDate) } : {}),
    amount: doc.amount,
    date: formatDateOnly(doc.date),
    status: doc.status,
    description: doc.description ?? '',
    ...(doc.receipt
      ? {
          receipt: {
            filename: doc.receipt.filename,
            size: formatFileSizeLabel(doc.receipt.size),
            type: doc.receipt.mimeType.includes('pdf')
              ? 'PDF'
              : doc.receipt.mimeType.split('/')[1]?.toUpperCase() ?? 'FILE',
            url: doc.receipt.url,
          },
        }
      : {}),
    activities: doc.activities.map((a, index) => ({
      id: `${doc._id.toString()}-a${index}`,
      type: a.type,
      actor: a.actorName,
      timestamp: a.createdAt.toISOString(),
      ...(a.note ? { note: a.note } : {}),
    })),
    projectBudgetSpent: spent,
    ...(doc.approvedByName ? { approvedBy: doc.approvedByName } : {}),
    ...(doc.approvedAt ? { approvedAt: formatDateOnly(doc.approvedAt) } : {}),
    ...(doc.rejectionReason ? { rejectionReason: doc.rejectionReason } : {}),
  }
}

async function loadEmployee(employeeId: string, companyId: string) {
  const user = await User.findOne({ _id: employeeId, companyId })
  if (!user) {
    throw new AppError('Employee not found', 404, 'EMPLOYEE_NOT_FOUND')
  }
  return user
}

async function loadProject(projectId: string, companyId: string) {
  const project = await Project.findOne({ _id: projectId, companyId })
  if (!project) {
    throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND')
  }
  return project
}

function mapReceipt(
  receipt: CreateExpenseInput['receipt'] | NonNullable<UpdateExpenseInput['receipt']>,
): ExpenseReceipt | undefined {
  if (!receipt) return undefined
  return {
    url: receipt.url,
    ...(receipt.publicId ? { publicId: receipt.publicId } : {}),
    filename: receipt.filename,
    size: receipt.size,
    mimeType: receipt.mimeType,
  }
}

export async function listExpenses(query: ListExpensesQuery, actor: ExpenseActor) {
  const { page, limit, skip } = parsePagination(query)
  const filter: Record<string, unknown> = { companyId: actor.companyId }

  if (query.status) filter.status = query.status
  if (query.expenseType) filter.expenseType = query.expenseType
  if (query.category) filter.category = query.category
  if (query.employeeId) filter.employeeId = new Types.ObjectId(query.employeeId)
  if (query.projectId) filter.projectId = new Types.ObjectId(query.projectId)

  if (query.period === 'this_month' || query.period === 'last_month') {
    const { start, end } = periodBounds(query.period)
    filter.date = { $gte: start, $lte: end }
  }

  const searchFilter = buildSearchFilter(query.search, [
    'title',
    'requestId',
    'employeeName',
    'projectName',
    'eventName',
    'description',
  ])
  if (searchFilter) Object.assign(filter, searchFilter)

  const [docs, total] = await Promise.all([
    Expense.find(filter).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limit),
    Expense.countDocuments(filter),
  ])

  const projectIds = [
    ...new Set(docs.map((d) => d.projectId?.toString()).filter((id): id is string => Boolean(id))),
  ]
  const spentByProject = new Map<string, number>()
  await Promise.all(
    projectIds.map(async (projectId) => {
      spentByProject.set(projectId, await getProjectBudgetSpent(actor.companyId, projectId))
    }),
  )

  const expenses = await Promise.all(
    docs.map((doc) =>
      toDto(doc, doc.projectId ? spentByProject.get(doc.projectId.toString()) : 0),
    ),
  )

  const result = buildPaginatedResult(expenses, total, page, limit)
  return { expenses: result.items, pagination: result.pagination }
}

export async function getExpenseStats(actor: ExpenseActor) {
  const filter: Record<string, unknown> = {
    companyId: new Types.ObjectId(actor.companyId),
  }

  const [statusRows, categoryRows] = await Promise.all([
    Expense.aggregate<{
      _id: ExpenseStatus
      count: number
      totalAmount: number
    }>([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]),
    Expense.aggregate<{
      _id: ExpenseCategory
      count: number
      totalAmount: number
    }>([
      { $match: filter },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]),
  ])

  const byStatus = Object.fromEntries(statusRows.map((row) => [row._id, row])) as Record<
    string,
    { count: number; totalAmount: number }
  >

  const pendingAmount = byStatus.pending?.totalAmount ?? 0
  const approvedAmount = byStatus.approved?.totalAmount ?? 0
  const rejectedAmount = byStatus.rejected?.totalAmount ?? 0

  return {
    stats: {
      total: pendingAmount + approvedAmount + rejectedAmount,
      pending: pendingAmount,
      approved: approvedAmount,
      rejected: rejectedAmount,
      count:
        (byStatus.pending?.count ?? 0) +
        (byStatus.approved?.count ?? 0) +
        (byStatus.rejected?.count ?? 0),
      byCategory: categoryRows.map((row) => ({
        category: row._id,
        amount: row.totalAmount,
        count: row.count,
      })),
    },
  }
}

export async function getExpenseById(id: string, actor: ExpenseActor): Promise<ExpenseDto> {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Expense not found', 404, 'EXPENSE_NOT_FOUND')
  }

  const doc = await Expense.findOne({ _id: id, companyId: actor.companyId })
  if (!doc) {
    throw new AppError('Expense not found', 404, 'EXPENSE_NOT_FOUND')
  }

  return toDto(doc)
}

export async function createExpense(
  payload: CreateExpenseInput,
  actor: ExpenseActor,
): Promise<ExpenseDto> {
  if (!canManageExpenses(actor)) {
    throw new AppError('You do not have permission to create expenses', 403, 'FORBIDDEN')
  }

  const expenseType = payload.expenseType ?? 'employee'
  const employee = payload.employeeId
    ? await loadEmployee(payload.employeeId, actor.companyId)
    : null
  const project = payload.projectId
    ? await loadProject(payload.projectId, actor.companyId)
    : null

  const status: ExpenseStatus = payload.status ?? 'pending'

  const requestId = await nextRequestId(actor.companyId)
  const doc = await Expense.create({
    companyId: actor.companyId,
    requestId,
    title: payload.title,
    expenseType,
    category: payload.category,
    ...(employee
      ? {
          employeeId: employee._id,
          employeeName: employee.fullName,
          ...(employee.avatar ? { employeeAvatar: employee.avatar } : {}),
        }
      : {}),
    ...(project
      ? {
          projectId: project._id,
          projectName: project.name,
        }
      : {}),
    ...(expenseType === 'monthly'
      ? {
          billingPeriodMonth: payload.billingPeriodMonth,
          billingPeriodYear: payload.billingPeriodYear,
        }
      : {}),
    ...(expenseType === 'event'
      ? {
          eventName: payload.eventName?.trim(),
          ...(payload.eventDate ? { eventDate: parseDateOnly(payload.eventDate) } : {}),
        }
      : {}),
    amount: payload.amount,
    date: parseDateOnly(payload.date),
    status,
    description: payload.description?.trim() ?? '',
    ...(payload.receipt ? { receipt: mapReceipt(payload.receipt) } : {}),
    activities: [],
  })

  pushActivity(doc, 'created', actor)

  if (status === 'approved') {
    doc.approvedById = new Types.ObjectId(actor.id)
    doc.approvedByName = actor.fullName
    doc.approvedAt = new Date()
    pushActivity(doc, 'approved', actor)
  } else if (status === 'rejected') {
    doc.rejectionReason = 'Rejected on create'
    pushActivity(doc, 'rejected', actor)
  }

  await doc.save()

  const subjectUserId = doc.employeeId?.toString()
  const entityLabel = doc.title
  if (status === 'pending') {
    await dispatchDomainEventSafe({
      type: 'expense.submitted',
      actor: { id: actor.id, fullName: actor.fullName, companyId: actor.companyId },
      entityId: doc._id.toString(),
      subjectUserId,
      relatedUserIds: subjectUserId ? [subjectUserId] : undefined,
      context: { entityLabel, subjectName: doc.employeeName },
    })
  } else if (status === 'approved' && subjectUserId) {
    await dispatchDomainEventSafe({
      type: 'expense.approved',
      actor: { id: actor.id, fullName: actor.fullName, companyId: actor.companyId },
      entityId: doc._id.toString(),
      subjectUserId,
      context: { entityLabel, subjectName: doc.employeeName },
    })
  } else if (status === 'rejected' && subjectUserId) {
    await dispatchDomainEventSafe({
      type: 'expense.rejected',
      actor: { id: actor.id, fullName: actor.fullName, companyId: actor.companyId },
      entityId: doc._id.toString(),
      subjectUserId,
      context: { entityLabel, subjectName: doc.employeeName },
    })
  }

  return toDto(doc)
}

export async function updateExpense(
  id: string,
  payload: UpdateExpenseInput,
  actor: ExpenseActor,
): Promise<ExpenseDto> {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Expense not found', 404, 'EXPENSE_NOT_FOUND')
  }

  if (!canManageExpenses(actor)) {
    throw new AppError('You do not have permission to edit expenses', 403, 'FORBIDDEN')
  }

  const doc = await Expense.findOne({ _id: id, companyId: actor.companyId })
  if (!doc) {
    throw new AppError('Expense not found', 404, 'EXPENSE_NOT_FOUND')
  }

  if (payload.expenseType !== undefined) doc.expenseType = payload.expenseType

  if (payload.employeeId === null) {
    doc.employeeId = undefined
    doc.employeeName = undefined
    doc.employeeAvatar = undefined
  } else if (payload.employeeId && payload.employeeId !== doc.employeeId?.toString()) {
    const employee = await loadEmployee(payload.employeeId, actor.companyId)
    doc.employeeId = employee._id as Types.ObjectId
    doc.employeeName = employee.fullName
    doc.employeeAvatar = employee.avatar
  }

  if (payload.projectId === null) {
    doc.projectId = undefined
    doc.projectName = undefined
  } else if (payload.projectId && payload.projectId !== doc.projectId?.toString()) {
    const project = await loadProject(payload.projectId, actor.companyId)
    doc.projectId = project._id as Types.ObjectId
    doc.projectName = project.name
  }

  if (payload.title !== undefined) doc.title = payload.title
  if (payload.category !== undefined) doc.category = payload.category
  if (payload.amount !== undefined) doc.amount = payload.amount
  if (payload.date !== undefined) doc.date = parseDateOnly(payload.date)
  if (payload.description !== undefined) doc.description = payload.description

  if (payload.billingPeriodMonth !== undefined) {
    doc.billingPeriodMonth = payload.billingPeriodMonth ?? undefined
  }
  if (payload.billingPeriodYear !== undefined) {
    doc.billingPeriodYear = payload.billingPeriodYear ?? undefined
  }
  if (payload.eventName !== undefined) {
    doc.eventName = payload.eventName?.trim() || undefined
  }
  if (payload.eventDate !== undefined) {
    doc.eventDate = payload.eventDate ? parseDateOnly(payload.eventDate) : undefined
  }

  if (payload.receipt === null) {
    doc.receipt = undefined
  } else if (payload.receipt) {
    doc.receipt = mapReceipt(payload.receipt)
  }

  pushActivity(doc, 'updated', actor)
  await doc.save()
  return toDto(doc)
}

export async function updateExpenseStatus(
  id: string,
  payload: UpdateExpenseStatusInput,
  actor: ExpenseActor,
): Promise<ExpenseDto> {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Expense not found', 404, 'EXPENSE_NOT_FOUND')
  }

  if (!canManageExpenses(actor)) {
    throw new AppError('You do not have permission to review this expense', 403, 'FORBIDDEN')
  }

  const doc = await Expense.findOne({ _id: id, companyId: actor.companyId })
  if (!doc) {
    throw new AppError('Expense not found', 404, 'EXPENSE_NOT_FOUND')
  }

  if (doc.status !== 'pending') {
    throw new AppError('Only pending expenses can be reviewed', 400, 'EXPENSE_NOT_PENDING')
  }

  pushActivity(doc, 'reviewed', actor, payload.note)

  doc.status = payload.status
  if (payload.status === 'approved') {
    doc.approvedById = new Types.ObjectId(actor.id)
    doc.approvedByName = actor.fullName
    doc.approvedAt = new Date()
    doc.rejectionReason = undefined
    pushActivity(doc, 'approved', actor, payload.note)
  } else {
    doc.approvedById = undefined
    doc.approvedByName = undefined
    doc.approvedAt = undefined
    doc.rejectionReason = payload.note?.trim() || 'Rejected'
    pushActivity(doc, 'rejected', actor, payload.note)
  }

  await doc.save()

  const subjectUserId = doc.employeeId?.toString()
  if (subjectUserId) {
    await dispatchDomainEventSafe({
      type: payload.status === 'approved' ? 'expense.approved' : 'expense.rejected',
      actor: { id: actor.id, fullName: actor.fullName, companyId: actor.companyId },
      entityId: doc._id.toString(),
      subjectUserId,
      context: {
        entityLabel: doc.title,
        subjectName: doc.employeeName,
        note: payload.note,
      },
    })
  }

  return toDto(doc)
}

export async function deleteExpense(id: string, actor: ExpenseActor): Promise<void> {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Expense not found', 404, 'EXPENSE_NOT_FOUND')
  }

  if (!canManageExpenses(actor)) {
    throw new AppError('You do not have permission to delete this expense', 403, 'FORBIDDEN')
  }

  const doc = await Expense.findOne({ _id: id, companyId: actor.companyId })
  if (!doc) {
    throw new AppError('Expense not found', 404, 'EXPENSE_NOT_FOUND')
  }

  await doc.deleteOne()
}

export async function getApprovedExpensesTotal(
  query: ApprovedTotalQuery,
  actor: ExpenseActor,
): Promise<{ total: number; count: number }> {
  const start = new Date(Date.UTC(query.year, query.month - 1, 1))
  const end = new Date(Date.UTC(query.year, query.month, 0, 23, 59, 59, 999))

  const rows = await Expense.aggregate<{ total: number; count: number }>([
    {
      $match: {
        companyId: new Types.ObjectId(actor.companyId),
        employeeId: new Types.ObjectId(query.employeeId),
        expenseType: 'employee',
        status: 'approved',
        date: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ])

  return {
    total: rows[0]?.total ?? 0,
    count: rows[0]?.count ?? 0,
  }
}
