export type ShiftConfig = {
  start: string
  end: string
  breakMinutes: number
  graceMinutes: number
}

export type PunchEvent = {
  type: 'clock_in' | 'break_start' | 'break_end' | 'clock_out'
  at: Date
}

export type DayComputeInput = {
  date: string
  punches: PunchEvent[]
  onLeave: boolean
  isWorkDay: boolean
  isToday: boolean
  shift: ShiftConfig
  halfDayHours: number
  now?: Date
}

export type DayComputeResult = {
  status:
    | 'present'
    | 'late'
    | 'absent'
    | 'on_leave'
    | 'half_day'
    | 'weekend'
    | 'not_arrived'
  clockInAt?: Date
  clockOutAt?: Date
  totalWorkMinutes: number
  breakMinutes: number
  isLate: boolean
  lateMinutes: number
  source: 'punch' | 'leave' | 'system'
}

export type ZonedParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
  weekday: number
  date: string
}

const WEEKDAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

export function getZonedParts(date: Date, timeZone: string): ZonedParts {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'short',
    hourCycle: 'h23',
  })
  const parts = Object.fromEntries(
    fmt.formatToParts(date).map((p) => [p.type, p.value]),
  ) as Record<string, string>

  const year = Number(parts.year)
  const month = Number(parts.month)
  const day = Number(parts.day)
  const hour = Number(parts.hour)
  const minute = Number(parts.minute)
  const second = Number(parts.second)
  const weekday = WEEKDAY_MAP[parts.weekday] ?? 0
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  return { year, month, day, hour, minute, second, weekday, date: dateStr }
}

export function parseHm(hm: string): { hour: number; minute: number } {
  const [h, m] = hm.split(':').map((v) => Number(v))
  return { hour: h || 0, minute: m || 0 }
}

/** Approximate offset ms for a timezone at a given instant (handles DST). */
export function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = getZonedParts(date, timeZone)
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  )
  return asUtc - date.getTime()
}

/** Build a Date for YYYY-MM-DD + HH:mm in the given timezone. */
export function zonedDateTime(dateStr: string, hm: string, timeZone: string): Date {
  const [y, mo, d] = dateStr.split('-').map(Number)
  const { hour, minute } = parseHm(hm)
  const guess = new Date(Date.UTC(y, mo - 1, d, hour, minute, 0))
  const offset = getTimeZoneOffsetMs(guess, timeZone)
  return new Date(guess.getTime() - offset)
}

/** Add (or subtract) whole calendar days to a YYYY-MM-DD string. */
export function addCalendarDays(dateStr: string, deltaDays: number): string {
  const [y, mo, d] = dateStr.split('-').map(Number)
  const utc = new Date(Date.UTC(y, mo - 1, d + deltaDays))
  const year = utc.getUTCFullYear()
  const month = utc.getUTCMonth() + 1
  const day = utc.getUTCDate()
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** Inclusive end of a calendar day in company timezone (23:59:59.999 local). */
export function endOfZonedDay(dateStr: string, timeZone: string): Date {
  const startNext = zonedDateTime(addCalendarDays(dateStr, 1), '00:00', timeZone)
  return new Date(startNext.getTime() - 1)
}

/**
 * Cap open-session accounting: past days freeze at TZ end-of-day; today uses wall clock.
 */
export function effectiveNowForDay(
  dateStr: string,
  timeZone: string,
  wallNow: Date = new Date(),
): { now: Date; isToday: boolean } {
  const today = getZonedParts(wallNow, timeZone).date
  if (dateStr === today) {
    return { now: wallNow, isToday: true }
  }
  if (dateStr < today) {
    return { now: endOfZonedDay(dateStr, timeZone), isToday: false }
  }
  // Future dates: no open-session accrual
  return { now: zonedDateTime(dateStr, '00:00', timeZone), isToday: false }
}

/** Enumerate YYYY-MM-DD dates from `from` through `to` inclusive. */
export function eachDateInRange(from: string, to: string): string[] {
  if (from > to) return []
  const dates: string[] = []
  let cursor = from
  while (cursor <= to) {
    dates.push(cursor)
    cursor = addCalendarDays(cursor, 1)
    if (dates.length > 400) break
  }
  return dates
}

export function minutesBetween(start: Date, end: Date): number {
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 60000))
}

export function formatMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${h}h ${String(m).padStart(2, '0')}m`
}

/**
 * Sum working minutes from punch timeline (excludes open breaks).
 * Pairs clock_in→break_start, break_end→break_start, break_end→clock_out, clock_in→clock_out.
 */
export function computeWorkAndBreakMinutes(
  punches: PunchEvent[],
  now: Date = new Date(),
): { workMinutes: number; breakMinutes: number; clockInAt?: Date; clockOutAt?: Date } {
  const sorted = [...punches].sort((a, b) => a.at.getTime() - b.at.getTime())
  let workMinutes = 0
  let breakMinutes = 0
  let clockInAt: Date | undefined
  let clockOutAt: Date | undefined
  let workStart: Date | undefined
  let breakStart: Date | undefined

  for (const punch of sorted) {
    if (punch.type === 'clock_in') {
      clockInAt = punch.at
      workStart = punch.at
      breakStart = undefined
    } else if (punch.type === 'break_start' && workStart && !breakStart) {
      workMinutes += minutesBetween(workStart, punch.at)
      workStart = undefined
      breakStart = punch.at
    } else if (punch.type === 'break_end' && breakStart) {
      breakMinutes += minutesBetween(breakStart, punch.at)
      breakStart = undefined
      workStart = punch.at
    } else if (punch.type === 'clock_out') {
      clockOutAt = punch.at
      if (breakStart) {
        breakMinutes += minutesBetween(breakStart, punch.at)
        breakStart = undefined
      }
      if (workStart) {
        workMinutes += minutesBetween(workStart, punch.at)
        workStart = undefined
      }
    }
  }

  // Open session: count work until now if still working
  if (workStart && !clockOutAt) {
    workMinutes += minutesBetween(workStart, now)
  }
  if (breakStart && !clockOutAt) {
    breakMinutes += minutesBetween(breakStart, now)
  }

  return { workMinutes, breakMinutes, clockInAt, clockOutAt }
}

export function computeDayStatus(input: DayComputeInput): DayComputeResult {
  const now = input.now ?? new Date()

  if (!input.isWorkDay) {
    return {
      status: 'weekend',
      totalWorkMinutes: 0,
      breakMinutes: 0,
      isLate: false,
      lateMinutes: 0,
      source: 'system',
    }
  }

  if (input.onLeave) {
    return {
      status: 'on_leave',
      totalWorkMinutes: 0,
      breakMinutes: 0,
      isLate: false,
      lateMinutes: 0,
      source: 'leave',
    }
  }

  const { workMinutes, breakMinutes, clockInAt, clockOutAt } = computeWorkAndBreakMinutes(
    input.punches,
    now,
  )

  if (!clockInAt) {
    return {
      status: input.isToday ? 'not_arrived' : 'absent',
      totalWorkMinutes: 0,
      breakMinutes: 0,
      isLate: false,
      lateMinutes: 0,
      source: 'system',
    }
  }

  const halfDayMinutes = input.halfDayHours * 60
  let status: DayComputeResult['status'] = 'present'
  if (workMinutes > 0 && workMinutes < halfDayMinutes && clockOutAt) {
    status = 'half_day'
  }

  return {
    status,
    clockInAt,
    clockOutAt,
    totalWorkMinutes: workMinutes,
    breakMinutes,
    isLate: false,
    lateMinutes: 0,
    source: 'punch',
  }
}

export function computeLate(
  clockInAt: Date,
  date: string,
  shift: ShiftConfig,
  timeZone: string,
): { isLate: boolean; lateMinutes: number } {
  const deadline = zonedDateTime(date, shift.start, timeZone)
  deadline.setTime(deadline.getTime() + shift.graceMinutes * 60_000)
  if (clockInAt.getTime() <= deadline.getTime()) {
    return { isLate: false, lateMinutes: 0 }
  }
  return {
    isLate: true,
    lateMinutes: minutesBetween(deadline, clockInAt),
  }
}

export function finalizeDayStatus(input: DayComputeInput & { timeZone: string }): DayComputeResult {
  const base = computeDayStatus(input)
  if (!base.clockInAt || base.status === 'on_leave' || base.status === 'weekend') {
    return base
  }

  const late = computeLate(base.clockInAt, input.date, input.shift, input.timeZone)
  let status = base.status
  if (late.isLate && status === 'present') {
    status = 'late'
  } else if (late.isLate && status === 'half_day') {
    status = 'half_day'
  }

  return {
    ...base,
    status,
    isLate: late.isLate,
    lateMinutes: late.lateMinutes,
  }
}

export type RhythmCell = {
  day: number
  hour: number
  intensity: number
  checkIns: number
  tasksCompleted: number
}

export type RhythmEvent = { at: Date; timeZone: string }

function rhythmKey(day: number, hour: number): string {
  return `${day}:${hour}`
}

function bucketRhythmEvent(
  at: Date,
  timeZone: string,
  hourFrom: number,
  hourTo: number,
  target: Map<string, number>,
): void {
  const parts = getZonedParts(at, timeZone)
  const day = parts.weekday === 0 ? 7 : parts.weekday
  if (parts.hour < hourFrom || parts.hour > hourTo) return
  const key = rhythmKey(day, parts.hour)
  target.set(key, (target.get(key) ?? 0) + 1)
}

/**
 * Build Mon–Sun (1–7) × hour cells.
 * Intensity is driven only by check-ins + completed tasks (not continuous work intervals),
 * so an hour stays empty unless someone punched in or finished a task then.
 */
export function buildWorkRhythm(
  _intervals: Array<{ start: Date; end: Date; timeZone: string }>,
  options: {
    hourFrom?: number
    hourTo?: number
    checkIns?: RhythmEvent[]
    taskCompletions?: RhythmEvent[]
  } = {},
): RhythmCell[] {
  const hourFrom = options.hourFrom ?? 9
  const hourTo = options.hourTo ?? 19
  const checkInCounts = new Map<string, number>()
  const taskCounts = new Map<string, number>()

  for (let d = 1; d <= 7; d++) {
    for (let h = hourFrom; h <= hourTo; h++) {
      const key = rhythmKey(d, h)
      checkInCounts.set(key, 0)
      taskCounts.set(key, 0)
    }
  }

  for (const event of options.checkIns ?? []) {
    bucketRhythmEvent(event.at, event.timeZone, hourFrom, hourTo, checkInCounts)
  }
  for (const event of options.taskCompletions ?? []) {
    bucketRhythmEvent(event.at, event.timeZone, hourFrom, hourTo, taskCounts)
  }

  // Tasks weigh slightly more so productive hours read darker than check-in-only hours.
  const scoreFor = (checkIns: number, tasks: number) => checkIns + tasks * 2

  const scores: number[] = []
  for (const key of checkInCounts.keys()) {
    scores.push(scoreFor(checkInCounts.get(key) ?? 0, taskCounts.get(key) ?? 0))
  }
  const max = Math.max(1, ...scores)

  const cells: RhythmCell[] = []
  for (const key of checkInCounts.keys()) {
    const [day, hour] = key.split(':').map(Number)
    const tasksCompleted = taskCounts.get(key) ?? 0
    const checkIns = checkInCounts.get(key) ?? 0
    cells.push({
      day,
      hour,
      intensity: scoreFor(checkIns, tasksCompleted) / max,
      checkIns,
      tasksCompleted,
    })
  }
  return cells
}

/** Extract work intervals from punches for rhythm (skip breaks). */
export function punchWorkIntervals(
  punches: PunchEvent[],
  now: Date = new Date(),
): Array<{ start: Date; end: Date }> {
  const sorted = [...punches].sort((a, b) => a.at.getTime() - b.at.getTime())
  const intervals: Array<{ start: Date; end: Date }> = []
  let workStart: Date | undefined

  for (const punch of sorted) {
    if (punch.type === 'clock_in') {
      workStart = punch.at
    } else if (punch.type === 'break_start' && workStart) {
      intervals.push({ start: workStart, end: punch.at })
      workStart = undefined
    } else if (punch.type === 'break_end') {
      workStart = punch.at
    } else if (punch.type === 'clock_out' && workStart) {
      intervals.push({ start: workStart, end: punch.at })
      workStart = undefined
    }
  }
  if (workStart) {
    intervals.push({ start: workStart, end: now })
  }
  return intervals
}

export function expectedWorkMinutes(shift: ShiftConfig): number {
  const start = parseHm(shift.start)
  const end = parseHm(shift.end)
  const total = end.hour * 60 + end.minute - (start.hour * 60 + start.minute)
  return Math.max(0, total - shift.breakMinutes)
}

export function attendancePercent(
  days: Array<{ status: string }>,
): number {
  const eligible = days.filter(
    (d) =>
      d.status !== 'weekend' &&
      d.status !== 'holiday' &&
      d.status !== 'on_leave' &&
      d.status !== 'not_arrived',
  )
  if (eligible.length === 0) return 100
  const present = eligible.filter((d) =>
    d.status === 'present' || d.status === 'late' || d.status === 'half_day',
  ).length
  return Math.round((present / eligible.length) * 100)
}
