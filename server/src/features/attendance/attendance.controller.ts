import type { Request, Response } from 'express'
import { AppError } from '../../utils/AppError.js'
import { sendSuccess } from '../../utils/apiResponse.js'
import type { UserRole } from '../auth/auth.types.js'
import { enrichAuthUser } from '../auth/auth-user.helper.js'
import type { Permission } from '../auth/permissions.js'
import { User } from '../auth/user.model.js'
import {
  buildAttendanceActor,
  exportAttendanceCsv,
  getAttendanceDashboard,
  getEmployeeProfileHeader,
  getSettings,
  getTodaySession,
  listEmployeeAttendance,
  listMyAttendance,
  punch,
  updateAttendanceDay,
  updateSettings,
} from './attendance.service.js'
import type {
  DashboardQuery,
  ExportAttendanceQuery,
  ListAttendanceQuery,
  PunchInput,
  UpdateAttendanceDayInput,
  UpdateAttendanceSettingsInput,
} from './attendance.validation.js'

async function getAttendanceActor(req: Request) {
  const companyId = req.user!.companyId
  if (!companyId) {
    throw new AppError('Company context required', 403, 'FORBIDDEN')
  }

  const user = await User.findById(req.user!.id)
  if (!user) {
    throw new AppError('User not found', 401, 'UNAUTHORIZED')
  }

  const authUser = await enrichAuthUser(user)
  return buildAttendanceActor(
    req.user!.id,
    companyId,
    authUser.role as UserRole,
    (authUser.permissions ?? []) as Permission[],
  )
}

export async function punchHandler(req: Request, res: Response): Promise<void> {
  const session = await punch(req.body as PunchInput, await getAttendanceActor(req), {
    ip: req.ip,
    userAgent: req.get('user-agent') ?? undefined,
  })
  sendSuccess(res, { session }, { message: 'Punch recorded' })
}

export async function getTodayHandler(req: Request, res: Response): Promise<void> {
  const session = await getTodaySession(await getAttendanceActor(req))
  sendSuccess(res, { session })
}

export async function listMineHandler(req: Request, res: Response): Promise<void> {
  const result = await listMyAttendance(
    (req.validatedQuery ?? req.query) as ListAttendanceQuery,
    await getAttendanceActor(req),
  )
  sendSuccess(res, result)
}

export async function listEmployeeHandler(req: Request, res: Response): Promise<void> {
  const actor = await getAttendanceActor(req)
  const employeeId = req.params.employeeId as string
  const query = (req.validatedQuery ?? req.query) as ListAttendanceQuery
  const [result, profile] = await Promise.all([
    listEmployeeAttendance(employeeId, query, actor),
    getEmployeeProfileHeader(employeeId, actor),
  ])
  sendSuccess(res, { ...result, profile })
}

export async function dashboardHandler(req: Request, res: Response): Promise<void> {
  const dashboard = await getAttendanceDashboard(
    req.query as unknown as DashboardQuery,
    await getAttendanceActor(req),
  )
  sendSuccess(res, { dashboard })
}

export async function getSettingsHandler(req: Request, res: Response): Promise<void> {
  const settings = await getSettings(await getAttendanceActor(req))
  sendSuccess(res, { settings })
}

export async function updateSettingsHandler(req: Request, res: Response): Promise<void> {
  const settings = await updateSettings(
    req.body as UpdateAttendanceSettingsInput,
    await getAttendanceActor(req),
  )
  sendSuccess(res, { settings }, { message: 'Attendance settings updated' })
}

export async function updateDayHandler(req: Request, res: Response): Promise<void> {
  const day = await updateAttendanceDay(
    req.params.id as string,
    req.body as UpdateAttendanceDayInput,
    await getAttendanceActor(req),
  )
  sendSuccess(res, { day }, { message: 'Attendance day updated' })
}

export async function exportHandler(req: Request, res: Response): Promise<void> {
  const csv = await exportAttendanceCsv(
    req.query as unknown as ExportAttendanceQuery,
    await getAttendanceActor(req),
  )
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename="attendance.csv"')
  res.status(200).send(csv)
}
