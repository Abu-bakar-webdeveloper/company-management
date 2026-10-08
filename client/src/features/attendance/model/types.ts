export type AttendanceDayStatus =
  | 'present'
  | 'late'
  | 'absent'
  | 'on_leave'
  | 'half_day'
  | 'weekend'
  | 'holiday'
  | 'not_arrived'

export type AttendancePunchType = 'clock_in' | 'break_start' | 'break_end' | 'clock_out'

export type SessionState = 'not_clocked_in' | 'working' | 'on_break' | 'clocked_out'

export type PunchLocationStatus = 'on_site' | 'remote' | 'unknown'

export type PunchLocationSummary = {
  label?: string
  status: PunchLocationStatus
  lat?: number
  lng?: number
  distanceMeters?: number
  nearestSiteName?: string
  ip?: string
}

export type PunchClientLocation = {
  lat: number
  lng: number
  accuracyMeters?: number
  label?: string
}

export type AttendanceOfficeSite = {
  name: string
  lat: number
  lng: number
  radiusMeters: number
}

export type AttendanceDay = {
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
  clockInLocation?: PunchLocationSummary | null
}

export type TodaySession = {
  date: string
  status: AttendanceDayStatus
  sessionState: SessionState
  clockInAt: string | null
  clockOutAt: string | null
  totalWorkMinutes: number
  workHoursLabel: string
  breakMinutes: number
  canClockIn: boolean
  canBreakStart: boolean
  canBreakEnd: boolean
  canClockOut: boolean
  day: AttendanceDay | null
  timezone: string
  lastPunchLocation?: PunchLocationSummary | null
}

export type AttendanceSettings = {
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

export type WorkRhythmCell = {
  day: number
  hour: number
  intensity: number
  checkIns: number
  tasksCompleted: number
}

export type MonthActivityDay = {
  date: string
  status: AttendanceDayStatus
  clockInAt: string | null
  clockOutAt: string | null
  workHoursLabel: string
  tasksCompleted: number
  taskTitles: string[]
}

export type AttendancePagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type AttendanceDashboard = {
  date: string
  weekFrom?: string
  weekTo?: string
  stats: {
    totalEmployees: number
    present: number
    absent: number
    late: number
    onLeave: number
    notArrived: number
  }
  clockInStatus: {
    onTime: number
    late: number
    notArrived: number
    onTimePercent: number
  }
  workRhythm: WorkRhythmCell[]
  workingHours: {
    totalHours: number
    days: Array<{ date: string; label: string; hours: number; expectedHours: number }>
  }
  activities: Array<{
    id: string
    employeeId: string
    employeeName: string
    type: AttendancePunchType
    at: string
    date: string
    location?: PunchLocationSummary | null
  }>
  roster: AttendanceDay[]
  settings: AttendanceSettings
}

export type AttendanceEmployeeProfile = {
  id: string
  fullName: string
  email: string
  phone?: string
  jobTitle?: string
  department?: string
  avatar?: string | null
  joinDate: string | null
  status: string
}

export type ListAttendanceParams = {
  from?: string
  to?: string
  status?: AttendanceDayStatus
  page?: number
  limit?: number
  scope?: 'mine' | 'team' | 'company'
}

export type AttendanceListSummary = {
  workingDaysThisMonth: number
  today: TodaySession | null
  timezone: string
  statusCounts: {
    onTime: number
    late: number
    notArrived: number
    absent: number
    onLeave: number
  }
  chartDays: AttendanceDay[]
  monthActivity: MonthActivityDay[]
}
