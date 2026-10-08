export function formatTimeLabel(
  iso: string | null | undefined,
  timeZone?: string,
): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    ...(timeZone ? { timeZone } : {}),
  })
}

export function formatDateLabel(date: string, timeZone?: string): string {
  const d = new Date(`${date}T12:00:00`)
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...(timeZone ? { timeZone } : {}),
  })
}

export function punchActionLabel(type: string): string {
  switch (type) {
    case 'clock_in':
      return 'Clocked in'
    case 'clock_out':
      return 'Clocked out'
    case 'break_start':
      return 'Started break'
    case 'break_end':
      return 'Ended break'
    default:
      return type
  }
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

/** Local calendar YYYY-MM-DD (avoids UTC day skew from toISOString). */
export function localDateString(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function localMonthBounds(d: Date = new Date()): { from: string; to: string } {
  const from = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
  return { from, to: localDateString(d) }
}

/** Monday (YYYY-MM-DD) of the week containing `dateStr` (local calendar). */
export function mondayOfWeek(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return localDateString(d)
}

export function addLocalDays(dateStr: string, delta: number): string {
  const d = new Date(`${dateStr}T12:00:00`)
  d.setDate(d.getDate() + delta)
  return localDateString(d)
}

/** `YYYY-MM` from a date string. */
export function yearMonth(dateStr: string): string {
  return dateStr.slice(0, 7)
}

export function monthBoundsFromYm(ym: string): { from: string; to: string } {
  const y = Number(ym.slice(0, 4))
  const m = Number(ym.slice(5, 7))
  const from = `${ym}-01`
  const lastDay = new Date(y, m, 0).getDate()
  const to = `${ym}-${String(lastDay).padStart(2, '0')}`
  return { from, to }
}

export function shiftYearMonth(ym: string, deltaMonths: number): string {
  const y = Number(ym.slice(0, 4))
  const m = Number(ym.slice(5, 7)) - 1 + deltaMonths
  const d = new Date(y, m, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function formatWeekRangeLabel(weekFrom: string): string {
  const weekTo = addLocalDays(weekFrom, 6)
  const from = new Date(`${weekFrom}T12:00:00`)
  const to = new Date(`${weekTo}T12:00:00`)
  const sameMonth = from.getMonth() === to.getMonth()
  const fromLabel = from.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
  const toLabel = to.toLocaleDateString(undefined, {
    month: sameMonth ? undefined : 'short',
    day: 'numeric',
    year: 'numeric',
  })
  return `${fromLabel} – ${toLabel}`
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export type PersonalWorkingHoursDay = {
  date: string
  label: string
  hours: number
  expectedHours: number
}

function hoursFromMinutes(totalWorkMinutes: number | undefined): number {
  if (!totalWorkMinutes || totalWorkMinutes <= 0) return 0
  return Math.round((totalWorkMinutes / 60) * 10) / 10
}

function isWeekday(dateStr: string): boolean {
  const day = new Date(`${dateStr}T12:00:00`).getDay()
  return day !== 0 && day !== 6
}

function eachLocalDate(from: string, to: string): string[] {
  if (from > to) return []
  const dates: string[] = []
  for (let date = from; date <= to; date = addLocalDays(date, 1)) {
    dates.push(date)
  }
  return dates
}

/** Build Mon–Sun personal working-hours bars from attendance day rows. */
export function buildPersonalWorkingHoursWeek(params: {
  days: Array<{ date: string; totalWorkMinutes: number }>
  weekFrom: string
  expectedHours: number
}): {
  totalHours: number
  expectedTotal: number
  days: PersonalWorkingHoursDay[]
} {
  return buildPersonalWorkingHoursRange({
    days: params.days,
    from: params.weekFrom,
    to: addLocalDays(params.weekFrom, 6),
    expectedHours: params.expectedHours,
    labelMode: 'weekday',
  })
}

/** Build daily working-hours bars for an inclusive date range (e.g. month). */
export function buildPersonalWorkingHoursRange(params: {
  days: Array<{ date: string; totalWorkMinutes: number }>
  from: string
  to: string
  expectedHours: number
  labelMode?: 'weekday' | 'day'
}): {
  totalHours: number
  expectedTotal: number
  days: PersonalWorkingHoursDay[]
} {
  const byDate = new Map(params.days.map((d) => [d.date, d]))
  const labelMode = params.labelMode ?? 'day'
  const days = eachLocalDate(params.from, params.to).map((date) => {
    const row = byDate.get(date)
    const weekday = new Date(`${date}T12:00:00`).getDay()
    const expectedHours = isWeekday(date) ? params.expectedHours : 0
    return {
      date,
      label:
        labelMode === 'weekday'
          ? (WEEKDAY_LABELS[weekday] ?? '—')
          : String(new Date(`${date}T12:00:00`).getDate()),
      hours: hoursFromMinutes(row?.totalWorkMinutes),
      expectedHours,
    }
  })
  const totalHours = Math.round(days.reduce((sum, d) => sum + d.hours, 0) * 10) / 10
  const expectedTotal =
    Math.round(days.reduce((sum, d) => sum + d.expectedHours, 0) * 10) / 10
  return { totalHours, expectedTotal, days }
}

export function formatMonthRangeLabel(from: string, to: string): string {
  const start = new Date(`${from}T12:00:00`)
  const end = new Date(`${to}T12:00:00`)
  if (yearMonth(from) === yearMonth(to)) {
    return start.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
  }
  const fromLabel = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const toLabel = end.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  return `${fromLabel} – ${toLabel}`
}

/** Weekday 1–7 (Mon–Sun) and hour in a timezone for rhythm cells. */
export function zonedWeekdayAndHour(
  iso: string,
  timeZone?: string,
): { weekday: number; hour: number } {
  const dt = new Date(iso)
  if (!timeZone) {
    const weekday = dt.getDay() === 0 ? 7 : dt.getDay()
    return { weekday, hour: dt.getHours() }
  }
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      weekday: 'short',
      hour: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(dt)
      .map((p) => [p.type, p.value]),
  ) as Record<string, string>
  const map: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  }
  return {
    weekday: map[parts.weekday] ?? 1,
    hour: Number(parts.hour) || 0,
  }
}
