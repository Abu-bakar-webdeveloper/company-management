import { Types } from 'mongoose'
import { AppError } from '../../utils/AppError.js'
import type { UserRole } from '../auth/auth.types.js'
import { hasPermission, type Permission } from '../auth/permissions.js'
import { User } from '../auth/user.model.js'
import { LeaveRequest } from '../leave/leave-request.model.js'
import { dispatchDomainEventSafe } from '../notifications/notification.service.js'
import { Task, taskCompletionTime } from '../tasks/task.model.js'
import {
  addCalendarDays,
  attendancePercent,
  buildWorkRhythm,
  computeLate,
  eachDateInRange,
  effectiveNowForDay,
  endOfZonedDay,
  expectedWorkMinutes,
  finalizeDayStatus,
  formatMinutes,
  getZonedParts,
  punchWorkIntervals,
  zonedDateTime,
  type PunchEvent,
} from './attendance-calc.js'
import {
  AttendanceDay,
  type AttendanceClockInLocation,
  type AttendanceDayStatus,
  type IAttendanceDay,
} from './attendance-day.model.js'
import {
  AttendancePunch,
  type AttendancePunchLocation,
  type AttendancePunchType,
  type PunchLocationStatus,
} from './attendance-punch.model.js'
import {
  CompanyAttendanceSettings,
  type AttendanceOfficeSite,
  type ICompanyAttendanceSettings,
} from './company-attendance-settings.model.js'
import type {
  DashboardQuery,
  ExportAttendanceQuery,
  ListAttendanceQuery,
  PunchInput,
  UpdateAttendanceDayInput,
  UpdateAttendanceSettingsInput,
} from './attendance.validation.js'

export type AttendanceActor = {
  id: string
  companyId: string
  role: UserRole
  permissions: Permission[]
  canSelf: boolean
  canTeam: boolean
  canManage: boolean
  canSettings: boolean
}

export function buildAttendanceActor(
  id: string,
  companyId: string,
  role: UserRole,
  permissions: Permission[],
): AttendanceActor {
  return {
    id,
    companyId,
    role,
    permissions,
    canSelf: hasPermission(role, 'attendance:self', permissions),
    canTeam: hasPermission(role, 'attendance:team', permissions),
    canManage: hasPermission(role, 'attendance:manage', permissions),
    canSettings: hasPermission(role, 'attendance:settings', permissions),
  }
}

export type PunchLocationSummaryDto = {
  label?: string
  status: PunchLocationStatus
  lat?: number
  lng?: number
  distanceMeters?: number
  nearestSiteName?: string
  ip?: string
}

export type AttendanceDayDto = {
  id: string
  employeeId: string
  employeeName?: string
  avatar?: string | null
  jobTitle?: string
  department?: string
  date: string
  status: AttendanceDayStatus
  clockInAt: string | null
  clockOutAt: string | null
  totalWorkMinutes: number
  workHoursLabel: string
  breakMinutes: number
  isLate: boolean
  lateMinutes: number
  source: string
  notes?: string
  clockInLocation?: PunchLocationSummaryDto | null
}

export type AttendanceSettingsDto = {
  companyId: string
  timezone: string
  workDays: number[]
  defaultShift: {
    start: string
    end: string
    breakMinutes: number
    graceMinutes: number
  }
  halfDayHours: number
  fullDayHours: number
  officeSites: AttendanceOfficeSite[]
}

export type TodaySessionDto = {
  date: string
  status: AttendanceDayStatus
  sessionState: 'not_clocked_in' | 'working' | 'on_break' | 'clocked_out'
  clockInAt: string | null
  clockOutAt: string | null
  totalWorkMinutes: number
  workHoursLabel: string
  breakMinutes: number
  canClockIn: boolean
  canBreakStart: boolean
  canBreakEnd: boolean
  canClockOut: boolean
  day: AttendanceDayDto | null
  timezone: string
  /** Present after a successful punch so the client can soft-warn */
  lastPunchLocation?: PunchLocationSummaryDto | null
}

export type MonthActivityDayDto = {
  date: string
  status: AttendanceDayStatus
  clockInAt: string | null
  clockOutAt: string | null
  workHoursLabel: string
  tasksCompleted: number
  taskTitles: string[]
}

const MAX_ACTIVITY_TASK_TITLES = 5

async function loadCompletedTasksInRange(params: {
  companyId: string
  employeeIds: string[]
  fromDate: string
  toDate: string
  timeZone: string
}): Promise<Array<{ at: Date; title: string; assigneeId: string }>> {
  if (params.employeeIds.length === 0) return []

  const rangeStart = zonedDateTime(params.fromDate, '00:00', params.timeZone)
  const rangeEnd = endOfZonedDay(params.toDate, params.timeZone)

  // Prefer completedAt; include legacy done tasks via updatedAt when completedAt is null.
  const tasks = await Task.find({
    companyId: new Types.ObjectId(params.companyId),
    assigneeId: { $in: params.employeeIds.map((id) => new Types.ObjectId(id)) },
    status: 'done',
    $or: [
      { completedAt: { $gte: rangeStart, $lte: rangeEnd } },
      {
        $and: [
          { $or: [{ completedAt: null }, { completedAt: { $exists: false } }] },
          { updatedAt: { $gte: rangeStart, $lte: rangeEnd } },
        ],
      },
    ],
  })
    .select('title assigneeId completedAt updatedAt')
    .lean()

  return tasks
    .map((task) => {
      const at = taskCompletionTime({
        completedAt: task.completedAt ?? null,
        updatedAt: task.updatedAt,
      })
      if (at < rangeStart || at > rangeEnd) return null
      return {
        at,
        title: task.title,
        assigneeId: task.assigneeId?.toString() ?? '',
      }
    })
    .filter((row): row is { at: Date; title: string; assigneeId: string } => row !== null)
}

function buildMonthActivity(params: {
  days: AttendanceDayDto[]
  tasks: Array<{ at: Date; title: string }>
  timeZone: string
  fromDate: string
  toDate: string
}): MonthActivityDayDto[] {
  const tasksByDate = new Map<string, string[]>()
  for (const task of params.tasks) {
    const date = getZonedParts(task.at, params.timeZone).date
    if (date < params.fromDate || date > params.toDate) continue
    const list = tasksByDate.get(date) ?? []
    list.push(task.title)
    tasksByDate.set(date, list)
  }

  const dayByDate = new Map(params.days.map((d) => [d.date, d]))
  const dates = eachDateInRange(params.fromDate, params.toDate)

  return dates.map((date) => {
    const day = dayByDate.get(date)
    const titles = tasksByDate.get(date) ?? []
    return {
      date,
      status: day?.status ?? 'not_arrived',
      clockInAt: day?.clockInAt ?? null,
      clockOutAt: day?.clockOutAt ?? null,
      workHoursLabel: day?.workHoursLabel ?? '0h 00m',
      tasksCompleted: titles.length,
      taskTitles: titles.slice(0, MAX_ACTIVITY_TASK_TITLES),
    }
  })
}

function toLocationSummary(
  loc?: AttendancePunchLocation | AttendanceClockInLocation | null,
): PunchLocationSummaryDto | null {
  if (!loc) return null
  const punchLoc = loc as AttendancePunchLocation
  return {
    label: loc.label,
    status: loc.status,
    lat: loc.lat,
    lng: loc.lng,
    distanceMeters: punchLoc.distanceMeters,
    nearestSiteName: punchLoc.nearestSiteName,
    ip: punchLoc.ip,
  }
}

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6_371_000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

function resolvePunchLocation(
  clientLoc: PunchInput['location'] | undefined,
  meta: { ip?: string; userAgent?: string },
  sites: AttendanceOfficeSite[],
): AttendancePunchLocation {
  const base: AttendancePunchLocation = {
    status: 'unknown',
    ip: meta.ip,
    userAgent: meta.userAgent,
  }

  if (
    clientLoc == null ||
    typeof clientLoc.lat !== 'number' ||
    typeof clientLoc.lng !== 'number'
  ) {
    return base
  }

  base.lat = clientLoc.lat
  base.lng = clientLoc.lng
  if (clientLoc.accuracyMeters != null) base.accuracyMeters = clientLoc.accuracyMeters
  if (clientLoc.label) base.label = clientLoc.label

  if (!sites.length) {
    return base
  }

  let best: { site: AttendanceOfficeSite; distance: number } | null = null
  for (const site of sites) {
    const distance = haversineMeters(clientLoc.lat, clientLoc.lng, site.lat, site.lng)
    if (!best || distance < best.distance) {
      best = { site, distance }
    }
  }

  if (!best) return base

  base.distanceMeters = Math.round(best.distance)
  base.nearestSiteName = best.site.name
  base.status = best.distance <= best.site.radiusMeters ? 'on_site' : 'remote'
  return base
}

function toDayDto(
  doc: IAttendanceDay,
  employee?: {
    fullName?: string
    avatar?: string | null
    jobTitle?: string
    department?: string
  },
): AttendanceDayDto {
  return {
    id: doc._id.toString(),
    employeeId: doc.employeeId.toString(),
    employeeName: employee?.fullName,
    avatar: employee?.avatar,
    jobTitle: employee?.jobTitle,
    department: employee?.department,
    date: doc.date,
    status: doc.status,
    clockInAt: doc.clockInAt ? doc.clockInAt.toISOString() : null,
    clockOutAt: doc.clockOutAt ? doc.clockOutAt.toISOString() : null,
    totalWorkMinutes: doc.totalWorkMinutes,
    workHoursLabel: formatMinutes(doc.totalWorkMinutes),
    breakMinutes: doc.breakMinutes,
    isLate: doc.isLate,
    lateMinutes: doc.lateMinutes,
    source: doc.source,
    notes: doc.notes,
    clockInLocation: toLocationSummary(doc.clockInLocation),
  }
}

function toSettingsDto(doc: ICompanyAttendanceSettings): AttendanceSettingsDto {
  return {
    companyId: doc.companyId.toString(),
    timezone: doc.timezone,
    workDays: doc.workDays,
    defaultShift: {
      start: doc.defaultShift.start,
      end: doc.defaultShift.end,
      breakMinutes: doc.defaultShift.breakMinutes,
      graceMinutes: doc.defaultShift.graceMinutes,
    },
    halfDayHours: doc.halfDayHours,
    fullDayHours: doc.fullDayHours,
    officeSites: (doc.officeSites ?? []).map((s) => ({
      name: s.name,
      lat: s.lat,
      lng: s.lng,
      radiusMeters: s.radiusMeters,
    })),
  }
}

export async function ensureAttendanceSettings(
  companyId: string,
): Promise<ICompanyAttendanceSettings> {
  let settings = await CompanyAttendanceSettings.findOne({ companyId })
  if (!settings) {
    settings = await CompanyAttendanceSettings.create({
      companyId: new Types.ObjectId(companyId),
    })
  }
  return settings
}

async function getDirectReportIds(managerId: string, companyId: string): Promise<string[]> {
  const reports = await User.find({
    companyId,
    managerId: new Types.ObjectId(managerId),
  }).select('_id')
  return reports.map((u) => u._id.toString())
}

async function resolveScopedEmployeeIds(
  acting: AttendanceActor,
  scope?: 'mine' | 'team' | 'company',
): Promise<string[] | 'all'> {
  if (acting.canManage || acting.role === 'admin' || acting.role === 'hr') {
    if (scope === 'mine') return [acting.id]
    return 'all'
  }

  if (acting.canTeam && acting.role === 'manager') {
    if (scope === 'mine') return [acting.id]
    const reportIds = await getDirectReportIds(acting.id, acting.companyId)
    return reportIds
  }

  return [acting.id]
}

async function canAccessEmployee(acting: AttendanceActor, employeeId: string): Promise<boolean> {
  if (employeeId === acting.id && acting.canSelf) return true
  if (acting.canManage || acting.role === 'admin' || acting.role === 'hr') return true
  if (acting.canTeam) {
    const reports = await getDirectReportIds(acting.id, acting.companyId)
    return reports.includes(employeeId)
  }
  return false
}

async function employeeOnLeave(
  companyId: string,
  employeeId: string,
  date: string,
  timeZone: string,
): Promise<boolean> {
  const dayStart = zonedDateTime(date, '00:00', timeZone)
  const dayEnd = zonedDateTime(addCalendarDays(date, 1), '00:00', timeZone)
  const found = await LeaveRequest.findOne({
    companyId: new Types.ObjectId(companyId),
    employeeId: new Types.ObjectId(employeeId),
    status: 'approved',
    startDate: { $lt: dayEnd },
    endDate: { $gte: dayStart },
  }).select('_id')
  return Boolean(found)
}

async function loadPunchesForDay(
  companyId: string,
  employeeId: string,
  date: string,
): Promise<PunchEvent[]> {
  const punches = await AttendancePunch.find({
    companyId: new Types.ObjectId(companyId),
    employeeId: new Types.ObjectId(employeeId),
    date,
  }).sort({ at: 1 })

  return punches.map((p) => ({ type: p.type, at: p.at }))
}

async function loadClockInLocationForDay(
  companyId: string,
  employeeId: string,
  date: string,
): Promise<AttendanceClockInLocation | undefined> {
  const clockIn = await AttendancePunch.findOne({
    companyId: new Types.ObjectId(companyId),
    employeeId: new Types.ObjectId(employeeId),
    date,
    type: 'clock_in',
  })
    .sort({ at: 1 })
    .select('location')

  if (!clockIn?.location) return undefined
  return {
    label: clockIn.location.label,
    status: clockIn.location.status,
    lat: clockIn.location.lat,
    lng: clockIn.location.lng,
  }
}

export async function recomputeAttendanceDay(
  companyId: string,
  employeeId: string,
  date: string,
  options?: {
    preserveManual?: boolean
    settings?: ICompanyAttendanceSettings
    existing?: IAttendanceDay | null
  },
): Promise<IAttendanceDay> {
  const settings = options?.settings ?? (await ensureAttendanceSettings(companyId))
  const existing =
    options?.existing !== undefined
      ? options.existing
      : await AttendanceDay.findOne({
          companyId,
          employeeId,
          date,
        })

  if (options?.preserveManual !== false && existing?.source === 'manual') {
    return existing
  }

  const { now, isToday } = effectiveNowForDay(date, settings.timezone)
  const weekdayGuess = getZonedParts(
    zonedDateTime(date, '12:00', settings.timezone),
    settings.timezone,
  ).weekday
  const isWorkDay = settings.workDays.includes(weekdayGuess)
  const onLeave = await employeeOnLeave(companyId, employeeId, date, settings.timezone)
  const punches = await loadPunchesForDay(companyId, employeeId, date)

  const computed = finalizeDayStatus({
    date,
    punches,
    onLeave,
    isWorkDay,
    isToday,
    shift: settings.defaultShift,
    halfDayHours: settings.halfDayHours,
    timeZone: settings.timezone,
    now,
  })

  const clockInLocation = await loadClockInLocationForDay(companyId, employeeId, date)

  const payload: Record<string, unknown> = {
    companyId: new Types.ObjectId(companyId),
    employeeId: new Types.ObjectId(employeeId),
    date,
    status: computed.status,
    clockInAt: computed.clockInAt,
    clockOutAt: computed.clockOutAt,
    totalWorkMinutes: computed.totalWorkMinutes,
    breakMinutes: computed.breakMinutes,
    isLate: computed.isLate,
    lateMinutes: computed.lateMinutes,
    source: computed.source,
  }

  const update: { $set: Record<string, unknown>; $unset?: Record<string, 1> } = {
    $set: payload,
  }
  if (clockInLocation) {
    payload.clockInLocation = clockInLocation
  } else {
    update.$unset = { clockInLocation: 1 }
  }

  const day = await AttendanceDay.findOneAndUpdate(
    { companyId, employeeId, date },
    update,
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )

  return day!
}

const PUNCH_LOCK_MS = 8_000
const PUNCH_LOCK_RETRIES = 8
const PUNCH_LOCK_WAIT_MS = 40

async function acquirePunchLock(
  companyId: string,
  employeeId: string,
  date: string,
): Promise<void> {
  const companyOid = new Types.ObjectId(companyId)
  const employeeOid = new Types.ObjectId(employeeId)

  for (let attempt = 0; attempt < PUNCH_LOCK_RETRIES; attempt++) {
    const lockUntil = new Date(Date.now() + PUNCH_LOCK_MS)
    const claimed = await AttendanceDay.findOneAndUpdate(
      {
        companyId: companyOid,
        employeeId: employeeOid,
        date,
        $or: [
          { punchLockUntil: { $exists: false } },
          { punchLockUntil: null },
          { punchLockUntil: { $lte: new Date() } },
        ],
      },
      { $set: { punchLockUntil: lockUntil } },
      { new: true },
    )

    if (claimed) return

    try {
      await AttendanceDay.create({
        companyId: companyOid,
        employeeId: employeeOid,
        date,
        status: 'not_arrived',
        totalWorkMinutes: 0,
        breakMinutes: 0,
        isLate: false,
        lateMinutes: 0,
        source: 'system',
        punchLockUntil: lockUntil,
      })
      return
    } catch (err) {
      const code = (err as { code?: number })?.code
      if (code !== 11000) throw err
    }

    await new Promise((r) => setTimeout(r, PUNCH_LOCK_WAIT_MS * (attempt + 1)))
  }

  throw new AppError('Attendance is busy, try again', 409, 'PUNCH_LOCKED')
}

async function releasePunchLock(
  companyId: string,
  employeeId: string,
  date: string,
): Promise<void> {
  await AttendanceDay.updateOne(
    { companyId, employeeId, date },
    { $unset: { punchLockUntil: 1 } },
  )
}

/** Materialize AttendanceDay rows for every calendar date in range (company TZ rules). */
export async function ensureDaysInRange(
  companyId: string,
  employeeId: string,
  from: string,
  to: string,
): Promise<void> {
  const settings = await ensureAttendanceSettings(companyId)
  const today = getZonedParts(new Date(), settings.timezone).date
  const end = to > today ? today : to
  if (from > end) return

  for (const date of eachDateInRange(from, end)) {
    await recomputeAttendanceDay(companyId, employeeId, date)
  }
}

function hasOpenSession(punches: PunchEvent[]): boolean {
  const state = sessionStateFromPunches(punches)
  return state === 'working' || state === 'on_break'
}

async function resolvePunchDate(
  companyId: string,
  employeeId: string,
  type: AttendancePunchType,
  today: string,
): Promise<string> {
  if (type === 'clock_in') return today

  const todayPunches = await loadPunchesForDay(companyId, employeeId, today)
  if (hasOpenSession(todayPunches)) return today

  const yesterday = addCalendarDays(today, -1)
  const yesterdayPunches = await loadPunchesForDay(companyId, employeeId, yesterday)
  if (hasOpenSession(yesterdayPunches)) return yesterday

  return today
}

function sessionStateFromPunches(punches: PunchEvent[]): TodaySessionDto['sessionState'] {
  const last = [...punches].sort((a, b) => a.at.getTime() - b.at.getTime()).at(-1)
  if (!last || last.type === 'clock_out') return 'not_clocked_in'
  if (last.type === 'break_start') return 'on_break'
  if (last.type === 'clock_in' || last.type === 'break_end') return 'working'
  return 'not_clocked_in'
}

function assertPunchTransition(
  state: TodaySessionDto['sessionState'],
  type: AttendancePunchType,
  punches: PunchEvent[],
): void {
  const alreadyClockedOut = punches.some((p) => p.type === 'clock_out')
  if (type === 'clock_in') {
    if (alreadyClockedOut) {
      throw new AppError('Already completed attendance for today', 400, 'INVALID_PUNCH')
    }
    if (state !== 'not_clocked_in') {
      throw new AppError('Already clocked in today', 400, 'INVALID_PUNCH')
    }
  }
  if (type === 'break_start' && state !== 'working') {
    throw new AppError('Must be working to start a break', 400, 'INVALID_PUNCH')
  }
  if (type === 'break_end' && state !== 'on_break') {
    throw new AppError('Not currently on break', 400, 'INVALID_PUNCH')
  }
  if (type === 'clock_out' && state !== 'working' && state !== 'on_break') {
    throw new AppError('Must be clocked in to clock out', 400, 'INVALID_PUNCH')
  }
}

export async function punch(
  input: PunchInput,
  acting: AttendanceActor,
  meta?: { ip?: string; userAgent?: string },
): Promise<TodaySessionDto> {
  if (!acting.canSelf) {
    throw new AppError('Not allowed to punch', 403, 'FORBIDDEN')
  }

  const settings = await ensureAttendanceSettings(acting.companyId)
  const now = new Date()
  const parts = getZonedParts(now, settings.timezone)
  const today = parts.date

  const date = await resolvePunchDate(acting.companyId, acting.id, input.type, today)

  const dateWeekday = getZonedParts(
    zonedDateTime(date, '12:00', settings.timezone),
    settings.timezone,
  ).weekday

  if (input.type === 'clock_in') {
    if (!settings.workDays.includes(dateWeekday)) {
      throw new AppError('Today is not a work day', 400, 'NOT_WORK_DAY')
    }
    const onLeave = await employeeOnLeave(
      acting.companyId,
      acting.id,
      date,
      settings.timezone,
    )
    if (onLeave) {
      throw new AppError('Cannot punch while on approved leave', 400, 'ON_LEAVE')
    }
  }

  const location = resolvePunchLocation(input.location, {
    ip: meta?.ip,
    userAgent: meta?.userAgent,
  }, settings.officeSites ?? [])

  await acquirePunchLock(acting.companyId, acting.id, date)
  let day: IAttendanceDay
  try {
    const punches = await loadPunchesForDay(acting.companyId, acting.id, date)
    const state = sessionStateFromPunches(punches)
    assertPunchTransition(state, input.type, punches)

    await AttendancePunch.create({
      companyId: new Types.ObjectId(acting.companyId),
      employeeId: new Types.ObjectId(acting.id),
      type: input.type,
      at: now,
      date,
      location,
    })

    day = await recomputeAttendanceDay(acting.companyId, acting.id, date, {
      preserveManual: false,
    })
  } finally {
    await releasePunchLock(acting.companyId, acting.id, date)
  }

  const actorUser = await User.findById(acting.id).select('fullName')
  if (input.type === 'clock_in' || input.type === 'clock_out') {
    await dispatchDomainEventSafe({
      type: input.type === 'clock_in' ? 'attendance.clocked_in' : 'attendance.clocked_out',
      actor: {
        id: acting.id,
        fullName: actorUser?.fullName ?? 'Employee',
        companyId: acting.companyId,
      },
      entityId: day._id.toString(),
      subjectUserId: acting.id,
      context: {
        subjectName: actorUser?.fullName,
        entityLabel: date,
      },
    })
  }

  const session = await getTodaySession(acting)
  return {
    ...session,
    lastPunchLocation: toLocationSummary(location),
  }
}

export async function getTodaySession(acting: AttendanceActor): Promise<TodaySessionDto> {
  const settings = await ensureAttendanceSettings(acting.companyId)
  const now = new Date()
  const date = getZonedParts(now, settings.timezone).date
  const yesterday = addCalendarDays(date, -1)

  let punches = await loadPunchesForDay(acting.companyId, acting.id, date)
  let sessionDate = date
  if (!hasOpenSession(punches)) {
    const yesterdayPunches = await loadPunchesForDay(acting.companyId, acting.id, yesterday)
    if (hasOpenSession(yesterdayPunches)) {
      punches = yesterdayPunches
      sessionDate = yesterday
    }
  }

  const day = await recomputeAttendanceDay(acting.companyId, acting.id, sessionDate)
  // Keep today's day row fresh for roster when session is overnight on yesterday
  if (sessionDate !== date) {
    await recomputeAttendanceDay(acting.companyId, acting.id, date)
  }

  const state = sessionStateFromPunches(punches)
  const clockedOut = state === 'not_clocked_in' && punches.some((p) => p.type === 'clock_out')
  const sessionState: TodaySessionDto['sessionState'] = clockedOut
    ? 'clocked_out'
    : state

  const canClockIn =
    sessionState === 'not_clocked_in' &&
    sessionDate === date &&
    settings.workDays.includes(getZonedParts(now, settings.timezone).weekday)

  return {
    date,
    status: day.status,
    sessionState,
    clockInAt: day.clockInAt ? day.clockInAt.toISOString() : null,
    clockOutAt: day.clockOutAt ? day.clockOutAt.toISOString() : null,
    totalWorkMinutes: day.totalWorkMinutes,
    workHoursLabel: formatMinutes(day.totalWorkMinutes),
    breakMinutes: day.breakMinutes,
    canClockIn,
    canBreakStart: sessionState === 'working',
    canBreakEnd: sessionState === 'on_break',
    canClockOut: sessionState === 'working' || sessionState === 'on_break',
    day: toDayDto(day),
    timezone: settings.timezone,
  }
}

function defaultRange(settings: ICompanyAttendanceSettings): { from: string; to: string } {
  const parts = getZonedParts(new Date(), settings.timezone)
  const from = `${parts.year}-${String(parts.month).padStart(2, '0')}-01`
  return { from, to: parts.date }
}

export async function listEmployeeAttendance(
  employeeId: string,
  query: ListAttendanceQuery,
  acting: AttendanceActor,
): Promise<{
  days: AttendanceDayDto[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
  summary: {
    workingDaysThisMonth: number
    today: TodaySessionDto | null
    timezone: string
    statusCounts: { onTime: number; late: number; notArrived: number; absent: number; onLeave: number }
    chartDays: AttendanceDayDto[]
    monthActivity: MonthActivityDayDto[]
  }
}> {
  if (!(await canAccessEmployee(acting, employeeId))) {
    throw new AppError('Employee attendance not found', 404, 'NOT_FOUND')
  }

  const settings = await ensureAttendanceSettings(acting.companyId)
  const range = {
    from: query.from ?? defaultRange(settings).from,
    to: query.to ?? defaultRange(settings).to,
  }

  await ensureDaysInRange(acting.companyId, employeeId, range.from, range.to)

  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10))
  const filter: Record<string, unknown> = {
    companyId: new Types.ObjectId(acting.companyId),
    employeeId: new Types.ObjectId(employeeId),
    date: { $gte: range.from, $lte: range.to },
  }
  if (query.status) filter.status = query.status

  const total = await AttendanceDay.countDocuments(filter)
  const skip = (page - 1) * limit
  const docs = await AttendanceDay.find(filter)
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit)

  const employee = await User.findById(employeeId).select(
    'fullName avatar jobTitle department',
  )

  let today: TodaySessionDto | null = null
  if (employeeId === acting.id && acting.canSelf) {
    today = await getTodaySession(acting)
  } else {
    const settings = await ensureAttendanceSettings(acting.companyId)
    const date = getZonedParts(new Date(), settings.timezone).date
    const day = await recomputeAttendanceDay(acting.companyId, employeeId, date)
    const punches = await loadPunchesForDay(acting.companyId, employeeId, date)
    const state = sessionStateFromPunches(punches)
    const clockedOut = state === 'not_clocked_in' && punches.some((p) => p.type === 'clock_out')
    const sessionState: TodaySessionDto['sessionState'] = clockedOut ? 'clocked_out' : state
    today = {
      date,
      status: day.status,
      sessionState,
      clockInAt: day.clockInAt ? day.clockInAt.toISOString() : null,
      clockOutAt: day.clockOutAt ? day.clockOutAt.toISOString() : null,
      totalWorkMinutes: day.totalWorkMinutes,
      workHoursLabel: formatMinutes(day.totalWorkMinutes),
      breakMinutes: day.breakMinutes,
      canClockIn: false,
      canBreakStart: false,
      canBreakEnd: false,
      canClockOut: false,
      day: toDayDto(day),
      timezone: settings.timezone,
    }
  }

  const monthParts = getZonedParts(new Date(), settings.timezone)
  const monthPrefix = `${monthParts.year}-${String(monthParts.month).padStart(2, '0')}`
  const workingDaysThisMonth = await AttendanceDay.countDocuments({
    companyId: acting.companyId,
    employeeId,
    date: { $regex: `^${monthPrefix}` },
    status: { $in: ['present', 'late', 'half_day'] },
  })

  const rangeDays = await AttendanceDay.find({
    companyId: new Types.ObjectId(acting.companyId),
    employeeId: new Types.ObjectId(employeeId),
    date: { $gte: range.from, $lte: range.to },
  }).sort({ date: 1 })

  let onTime = 0
  let lateCount = 0
  let notArrivedCount = 0
  let absentCount = 0
  let onLeaveCount = 0
  for (const d of rangeDays) {
    if (d.status === 'present' || d.status === 'half_day') onTime += 1
    else if (d.status === 'late') lateCount += 1
    else if (d.status === 'not_arrived') notArrivedCount += 1
    else if (d.status === 'absent') absentCount += 1
    else if (d.status === 'on_leave') onLeaveCount += 1
  }

  const empMeta = {
    fullName: employee?.fullName,
    avatar: employee?.avatar,
    jobTitle: employee?.jobTitle,
    department: employee?.department,
  }

  const chartDays = rangeDays.map((d) => toDayDto(d, empMeta))
  const completedTasks = await loadCompletedTasksInRange({
    companyId: acting.companyId,
    employeeIds: [employeeId],
    fromDate: range.from,
    toDate: range.to,
    timeZone: settings.timezone,
  })
  const monthActivity = buildMonthActivity({
    days: chartDays,
    tasks: completedTasks.map((t) => ({ at: t.at, title: t.title })),
    timeZone: settings.timezone,
    fromDate: range.from,
    toDate: range.to,
  })

  return {
    days: docs.map((d) => toDayDto(d, empMeta)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
    summary: {
      workingDaysThisMonth,
      today,
      timezone: settings.timezone,
      statusCounts: {
        onTime,
        late: lateCount,
        notArrived: notArrivedCount + absentCount,
        absent: absentCount,
        onLeave: onLeaveCount,
      },
      chartDays,
      monthActivity,
    },
  }
}

export async function listMyAttendance(
  query: ListAttendanceQuery,
  acting: AttendanceActor,
) {
  return listEmployeeAttendance(acting.id, query, acting)
}

export async function getAttendanceDashboard(
  query: DashboardQuery,
  acting: AttendanceActor,
) {
  if (!acting.canManage && !acting.canTeam) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN')
  }

  const settings = await ensureAttendanceSettings(acting.companyId)
  const scope = query.scope ?? (acting.canManage ? 'company' : 'team')
  const scopedIds = await resolveScopedEmployeeIds(acting, scope)
  const date = query.date ?? getZonedParts(new Date(), settings.timezone).date

  const userFilter: Record<string, unknown> = {
    companyId: new Types.ObjectId(acting.companyId),
    status: 'active',
    role: { $in: ['employee', 'manager', 'hr', 'admin'] },
  }
  if (scopedIds !== 'all') {
    userFilter._id = { $in: scopedIds.map((id) => new Types.ObjectId(id)) }
  }
  if (query.department) {
    userFilter.department = query.department
  }

  const employees = await User.find(userFilter).select(
    'fullName avatar jobTitle department role',
  )
  const employeeIds = employees.map((e) => e._id.toString())
  const employeeObjectIds = employeeIds.map((id) => new Types.ObjectId(id))

  const existingDays = await AttendanceDay.find({
    companyId: acting.companyId,
    employeeId: { $in: employeeObjectIds },
    date,
  })
  const existingByEmployee = new Map(existingDays.map((d) => [d.employeeId.toString(), d]))

  const todayDate = getZonedParts(new Date(), settings.timezone).date
  const isDashboardToday = date === todayDate

  const toRecompute = employeeIds.filter((id) => {
    const day = existingByEmployee.get(id)
    if (!day) return true
    if (!isDashboardToday) return false
    if (day.status === 'not_arrived') return true
    // Still clocked in — refresh work minutes / status for the live roster.
    if (day.clockInAt && !day.clockOutAt) return true
    return false
  })

  if (toRecompute.length > 0) {
    await Promise.all(
      toRecompute.map((id) =>
        recomputeAttendanceDay(acting.companyId, id, date, {
          settings,
          existing: existingByEmployee.get(id) ?? null,
        }).catch(() => null),
      ),
    )
  }

  const days = await AttendanceDay.find({
    companyId: acting.companyId,
    employeeId: { $in: employeeObjectIds },
    date,
  })

  const dayByEmployee = new Map(days.map((d) => [d.employeeId.toString(), d]))

  let present = 0
  let absent = 0
  let late = 0
  let onTime = 0
  let notArrived = 0
  let onLeave = 0

  const fullRoster: AttendanceDayDto[] = []
  for (const emp of employees) {
    const day = dayByEmployee.get(emp._id.toString())
    if (!day) {
      notArrived += 1
      continue
    }
    if (day.status === 'present') {
      present += 1
      onTime += 1
    } else if (day.status === 'late') {
      present += 1
      late += 1
    } else if (day.status === 'half_day') {
      present += 1
      onTime += 1
    } else if (day.status === 'absent') {
      absent += 1
    } else if (day.status === 'not_arrived') {
      notArrived += 1
    } else if (day.status === 'on_leave') {
      onLeave += 1
    }

    fullRoster.push(
      toDayDto(day, {
        fullName: emp.fullName,
        avatar: emp.avatar,
        jobTitle: emp.jobTitle,
        department: emp.department,
      }),
    )
  }

  // Full roster for client-side filter/pagination (avoids refetching the whole dashboard).
  const roster = fullRoster

  const totalEmployees = employees.length
  const arrivedTotal = onTime + late + notArrived
  const onTimePct = arrivedTotal === 0 ? 0 : Math.round((onTime / arrivedTotal) * 100)

  // Week range for charts
  const dateParts = getZonedParts(zonedDateTime(date, '12:00', settings.timezone), settings.timezone)
  const weekDay = dateParts.weekday === 0 ? 7 : dateParts.weekday
  const weekStartDate = new Date(zonedDateTime(date, '12:00', settings.timezone).getTime())
  weekStartDate.setUTCDate(weekStartDate.getUTCDate() - (weekDay - 1))
  const weekDates: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStartDate.getTime() + i * 24 * 60 * 60_000)
    weekDates.push(getZonedParts(d, settings.timezone).date)
  }
  if (query.weekFrom) {
    weekDates.length = 0
    for (let i = 0; i < 7; i++) {
      const base = zonedDateTime(query.weekFrom, '12:00', settings.timezone)
      const d = new Date(base.getTime() + i * 24 * 60 * 60_000)
      weekDates.push(getZonedParts(d, settings.timezone).date)
    }
  }

  const weekPunches = await AttendancePunch.find({
    companyId: acting.companyId,
    employeeId: { $in: employeeIds.map((id) => new Types.ObjectId(id)) },
    date: { $in: weekDates },
  }).sort({ at: 1 })

  const punchesByEmpDate = new Map<string, PunchEvent[]>()
  for (const p of weekPunches) {
    const key = `${p.employeeId.toString()}:${p.date}`
    const list = punchesByEmpDate.get(key) ?? []
    list.push({ type: p.type, at: p.at })
    punchesByEmpDate.set(key, list)
  }

  const intervals: Array<{ start: Date; end: Date; timeZone: string }> = []
  const hoursByDay: Record<string, number> = {}
  for (const d of weekDates) hoursByDay[d] = 0

  for (const [key, punches] of punchesByEmpDate) {
    const dateKey = key.split(':')[1]
    const workIntervals = punchWorkIntervals(punches)
    for (const iv of workIntervals) {
      intervals.push({ ...iv, timeZone: settings.timezone })
      hoursByDay[dateKey] =
        (hoursByDay[dateKey] ?? 0) + (iv.end.getTime() - iv.start.getTime()) / 3_600_000
    }
  }

  const expected = expectedWorkMinutes(settings.defaultShift) / 60
  const workingHours = weekDates.map((d) => {
    const weekday = getZonedParts(zonedDateTime(d, '12:00', settings.timezone), settings.timezone)
      .weekday
    const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return {
      date: d,
      label: labels[weekday],
      hours: Math.round((hoursByDay[d] ?? 0) * 10) / 10,
      expectedHours: expected,
    }
  })

  const totalWeekHours = workingHours.reduce((s, w) => s + w.hours, 0)

  const weekFrom = weekDates[0]!
  const weekTo = weekDates[weekDates.length - 1]!
  const completedTasks = await loadCompletedTasksInRange({
    companyId: acting.companyId,
    employeeIds,
    fromDate: weekFrom,
    toDate: weekTo,
    timeZone: settings.timezone,
  })

  const checkIns = weekPunches
    .filter((p) => p.type === 'clock_in')
    .map((p) => ({ at: p.at, timeZone: settings.timezone }))

  const workRhythm = buildWorkRhythm(intervals, {
    checkIns,
    taskCompletions: completedTasks.map((t) => ({
      at: t.at,
      timeZone: settings.timezone,
    })),
  })

  const recentPunches = await AttendancePunch.find({
    companyId: acting.companyId,
    employeeId: { $in: employeeIds.map((id) => new Types.ObjectId(id)) },
  })
    .sort({ at: -1 })
    .limit(12)

  const nameMap = new Map(employees.map((e) => [e._id.toString(), e.fullName]))
  const activities = recentPunches.map((p) => ({
    id: p._id.toString(),
    employeeId: p.employeeId.toString(),
    employeeName: nameMap.get(p.employeeId.toString()) ?? 'Employee',
    type: p.type,
    at: p.at.toISOString(),
    date: p.date,
    location: toLocationSummary(p.location),
  }))

  return {
    date,
    weekFrom,
    weekTo,
    stats: {
      totalEmployees,
      present,
      absent,
      late,
      onLeave,
      notArrived,
    },
    clockInStatus: {
      onTime,
      late,
      notArrived,
      onTimePercent: onTimePct,
    },
    workRhythm,
    workingHours: {
      totalHours: Math.round(totalWeekHours * 10) / 10,
      days: workingHours,
    },
    activities,
    roster,
    settings: toSettingsDto(settings),
  }
}

export async function getSettings(acting: AttendanceActor): Promise<AttendanceSettingsDto> {
  if (!acting.canSettings && !acting.canManage) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN')
  }
  const settings = await ensureAttendanceSettings(acting.companyId)
  return toSettingsDto(settings)
}

export async function updateSettings(
  input: UpdateAttendanceSettingsInput,
  acting: AttendanceActor,
): Promise<AttendanceSettingsDto> {
  if (!acting.canSettings) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN')
  }
  const settings = await ensureAttendanceSettings(acting.companyId)
  if (input.timezone !== undefined) settings.timezone = input.timezone
  if (input.workDays !== undefined) settings.workDays = input.workDays
  if (input.defaultShift !== undefined) settings.defaultShift = input.defaultShift
  if (input.halfDayHours !== undefined) settings.halfDayHours = input.halfDayHours
  if (input.fullDayHours !== undefined) settings.fullDayHours = input.fullDayHours
  if (input.officeSites !== undefined) settings.officeSites = input.officeSites
  await settings.save()
  return toSettingsDto(settings)
}

export async function updateAttendanceDay(
  dayId: string,
  input: UpdateAttendanceDayInput,
  acting: AttendanceActor,
): Promise<AttendanceDayDto> {
  if (!acting.canManage) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN')
  }
  if (!Types.ObjectId.isValid(dayId)) {
    throw new AppError('Attendance day not found', 404, 'NOT_FOUND')
  }

  const day = await AttendanceDay.findById(dayId)
  if (!day || day.companyId.toString() !== acting.companyId) {
    throw new AppError('Attendance day not found', 404, 'NOT_FOUND')
  }

  if (input.status !== undefined) day.status = input.status
  if (input.clockInAt !== undefined) {
    day.clockInAt = input.clockInAt ? new Date(input.clockInAt) : undefined
  }
  if (input.clockOutAt !== undefined) {
    day.clockOutAt = input.clockOutAt ? new Date(input.clockOutAt) : undefined
  }
  if (input.totalWorkMinutes !== undefined) day.totalWorkMinutes = input.totalWorkMinutes
  if (input.notes !== undefined) day.notes = input.notes

  const settings = await ensureAttendanceSettings(acting.companyId)
  if (day.clockInAt) {
    const late = computeLate(
      day.clockInAt,
      day.date,
      settings.defaultShift,
      settings.timezone,
    )
    day.isLate = late.isLate
    day.lateMinutes = late.lateMinutes
    if (late.isLate && day.status === 'present') day.status = 'late'
  } else {
    day.isLate = false
    day.lateMinutes = 0
  }

  day.source = 'manual'
  day.editedBy = new Types.ObjectId(acting.id)
  day.editedAt = new Date()
  await day.save()

  const employee = await User.findById(day.employeeId).select(
    'fullName avatar jobTitle department',
  )
  return toDayDto(day, {
    fullName: employee?.fullName,
    avatar: employee?.avatar,
    jobTitle: employee?.jobTitle,
    department: employee?.department,
  })
}

export async function exportAttendanceCsv(
  query: ExportAttendanceQuery,
  acting: AttendanceActor,
): Promise<string> {
  const employeeId = query.employeeId ?? acting.id
  if (!(await canAccessEmployee(acting, employeeId))) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN')
  }

  const days = await AttendanceDay.find({
    companyId: acting.companyId,
    employeeId,
    date: { $gte: query.from, $lte: query.to },
  }).sort({ date: 1 })

  const header = 'Date,Status,Clock In,Clock Out,Work Minutes,Late Minutes,Source\n'
  const rows = days
    .map((d) =>
      [
        d.date,
        d.status,
        d.clockInAt?.toISOString() ?? '',
        d.clockOutAt?.toISOString() ?? '',
        d.totalWorkMinutes,
        d.lateMinutes,
        d.source,
      ].join(','),
    )
    .join('\n')
  return header + rows
}

export async function getMonthlyAttendancePercent(
  companyId: string,
  employeeId: string,
  year: number,
  month: number,
): Promise<number> {
  const settings = await ensureAttendanceSettings(companyId)
  const today = getZonedParts(new Date(), settings.timezone).date
  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  const lastOfMonth = addCalendarDays(
    `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`,
    -1,
  )
  const to = lastOfMonth < today ? lastOfMonth : today

  if (from > to) return 100

  await ensureDaysInRange(companyId, employeeId, from, to)

  const days = await AttendanceDay.find({
    companyId,
    employeeId,
    date: { $gte: from, $lte: to },
  }).select('status date')

  const elapsedWorkdays = days.filter((d) => {
    if (!d.date) return false
    const weekday = getZonedParts(
      zonedDateTime(d.date, '12:00', settings.timezone),
      settings.timezone,
    ).weekday
    return settings.workDays.includes(weekday)
  })

  if (elapsedWorkdays.length === 0) return 100
  return attendancePercent(elapsedWorkdays.map((d) => ({ status: d.status })))
}

export async function getEmployeeProfileHeader(
  employeeId: string,
  acting: AttendanceActor,
) {
  if (!(await canAccessEmployee(acting, employeeId))) {
    throw new AppError('Employee not found', 404, 'NOT_FOUND')
  }
  const user = await User.findById(employeeId)
  if (!user || user.companyId?.toString() !== acting.companyId) {
    throw new AppError('Employee not found', 404, 'NOT_FOUND')
  }
  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    jobTitle: user.jobTitle,
    department: user.department,
    avatar: user.avatar,
    joinDate: user.joinDate?.toISOString() ?? null,
    status: user.status,
  }
}
