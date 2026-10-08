import assert from 'node:assert/strict'
import {
  addCalendarDays,
  attendancePercent,
  buildWorkRhythm,
  computeLate,
  computeWorkAndBreakMinutes,
  eachDateInRange,
  effectiveNowForDay,
  endOfZonedDay,
  expectedWorkMinutes,
  finalizeDayStatus,
  formatMinutes,
  parseHm,
  punchWorkIntervals,
} from './attendance-calc.ts'

function testParseHm() {
  assert.deepEqual(parseHm('09:15'), { hour: 9, minute: 15 })
  assert.deepEqual(parseHm('18:00'), { hour: 18, minute: 0 })
}

function testWorkMinutes() {
  const clockIn = new Date('2026-08-06T04:00:00.000Z') // 09:00 PKT approx depends TZ; use relative
  const breakStart = new Date(clockIn.getTime() + 3 * 60 * 60_000)
  const breakEnd = new Date(breakStart.getTime() + 60 * 60_000)
  const clockOut = new Date(breakEnd.getTime() + 4 * 60 * 60_000)

  const { workMinutes, breakMinutes, clockInAt, clockOutAt } = computeWorkAndBreakMinutes([
    { type: 'clock_in', at: clockIn },
    { type: 'break_start', at: breakStart },
    { type: 'break_end', at: breakEnd },
    { type: 'clock_out', at: clockOut },
  ])

  assert.equal(workMinutes, 7 * 60)
  assert.equal(breakMinutes, 60)
  assert.equal(clockInAt?.getTime(), clockIn.getTime())
  assert.equal(clockOutAt?.getTime(), clockOut.getTime())
  assert.equal(formatMinutes(workMinutes), '7h 00m')
}

function testLate() {
  const date = '2026-08-06'
  const shift = { start: '09:00', end: '18:00', breakMinutes: 60, graceMinutes: 15 }
  const onTime = computeLate(
    new Date('2026-08-06T04:10:00.000Z'),
    date,
    shift,
    'UTC',
  )
  // 04:10 UTC = 04:10 against 09:00 UTC start + 15 grace → on time if start is 09:00 UTC
  // zonedDateTime with UTC: start = 2026-08-06T09:00:00Z, grace → 09:15
  // 04:10 is before → on time
  assert.equal(onTime.isLate, false)

  const late = computeLate(new Date('2026-08-06T09:30:00.000Z'), date, shift, 'UTC')
  assert.equal(late.isLate, true)
  assert.equal(late.lateMinutes, 15)
}

function testFinalizeDay() {
  const shift = { start: '09:00', end: '18:00', breakMinutes: 60, graceMinutes: 15 }
  const leaveDay = finalizeDayStatus({
    date: '2026-08-06',
    punches: [],
    onLeave: true,
    isWorkDay: true,
    isToday: false,
    shift,
    halfDayHours: 4,
    timeZone: 'UTC',
  })
  assert.equal(leaveDay.status, 'on_leave')

  const weekend = finalizeDayStatus({
    date: '2026-08-08',
    punches: [],
    onLeave: false,
    isWorkDay: false,
    isToday: false,
    shift,
    halfDayHours: 4,
    timeZone: 'UTC',
  })
  assert.equal(weekend.status, 'weekend')

  const absent = finalizeDayStatus({
    date: '2026-08-06',
    punches: [],
    onLeave: false,
    isWorkDay: true,
    isToday: false,
    shift,
    halfDayHours: 4,
    timeZone: 'UTC',
  })
  assert.equal(absent.status, 'absent')

  const present = finalizeDayStatus({
    date: '2026-08-06',
    punches: [{ type: 'clock_in', at: new Date('2026-08-06T09:00:00.000Z') }],
    onLeave: false,
    isWorkDay: true,
    isToday: true,
    shift,
    halfDayHours: 4,
    timeZone: 'UTC',
    now: new Date('2026-08-06T12:00:00.000Z'),
  })
  assert.equal(present.status, 'present')
  assert.ok((present.totalWorkMinutes ?? 0) >= 180)
}

function testAttendancePercent() {
  assert.equal(
    attendancePercent([
      { status: 'present' },
      { status: 'late' },
      { status: 'absent' },
      { status: 'on_leave' },
      { status: 'weekend' },
    ]),
    67,
  )
  assert.equal(attendancePercent([{ status: 'on_leave' }, { status: 'weekend' }]), 100)
}

function testExpectedAndIntervals() {
  assert.equal(
    expectedWorkMinutes({ start: '09:00', end: '18:00', breakMinutes: 60, graceMinutes: 15 }),
    480,
  )
  const intervals = punchWorkIntervals([
    { type: 'clock_in', at: new Date('2026-08-06T09:00:00.000Z') },
    { type: 'break_start', at: new Date('2026-08-06T12:00:00.000Z') },
    { type: 'break_end', at: new Date('2026-08-06T13:00:00.000Z') },
    { type: 'clock_out', at: new Date('2026-08-06T18:00:00.000Z') },
  ])
  assert.equal(intervals.length, 2)
}

function testEodCapOpenSession() {
  const clockIn = new Date('2026-08-05T09:00:00.000Z')
  const eod = endOfZonedDay('2026-08-05', 'UTC')
  const weekLater = new Date('2026-08-12T12:00:00.000Z')

  const capped = computeWorkAndBreakMinutes([{ type: 'clock_in', at: clockIn }], eod)
  const runaway = computeWorkAndBreakMinutes([{ type: 'clock_in', at: clockIn }], weekLater)

  assert.ok(capped.workMinutes < runaway.workMinutes)
  assert.equal(capped.workMinutes, 14 * 60 + 59) // 09:00 → 23:59

  const past = effectiveNowForDay('2026-08-05', 'UTC', weekLater)
  assert.equal(past.isToday, false)
  assert.equal(past.now.getTime(), eod.getTime())
}

function testLeaveShortCircuit() {
  const shift = { start: '09:00', end: '18:00', breakMinutes: 60, graceMinutes: 15 }
  const result = finalizeDayStatus({
    date: '2026-08-06',
    punches: [{ type: 'clock_in', at: new Date('2026-08-06T09:00:00.000Z') }],
    onLeave: true,
    isWorkDay: true,
    isToday: false,
    shift,
    halfDayHours: 4,
    timeZone: 'UTC',
    now: new Date('2026-08-06T18:00:00.000Z'),
  })
  assert.equal(result.status, 'on_leave')
  assert.equal(result.totalWorkMinutes, 0)
}

function testLateHalfDayPrecedence() {
  const shift = { start: '09:00', end: '18:00', breakMinutes: 60, graceMinutes: 15 }
  const result = finalizeDayStatus({
    date: '2026-08-06',
    punches: [
      { type: 'clock_in', at: new Date('2026-08-06T10:00:00.000Z') },
      { type: 'clock_out', at: new Date('2026-08-06T12:00:00.000Z') },
    ],
    onLeave: false,
    isWorkDay: true,
    isToday: false,
    shift,
    halfDayHours: 4,
    timeZone: 'UTC',
  })
  assert.equal(result.status, 'half_day')
  assert.equal(result.isLate, true)
  assert.ok(result.lateMinutes > 0)
}

function testDateHelpers() {
  assert.equal(addCalendarDays('2026-08-06', -1), '2026-08-05')
  assert.deepEqual(eachDateInRange('2026-08-05', '2026-08-07'), [
    '2026-08-05',
    '2026-08-06',
    '2026-08-07',
  ])
}

function testWorkRhythmIncludesTasksAndCheckIns() {
  // Work intervals alone must not color a cell; only check-ins + tasks do.
  const intervals = [
    {
      start: new Date('2026-08-05T10:00:00.000Z'),
      end: new Date('2026-08-05T12:00:00.000Z'),
      timeZone: 'UTC',
    },
  ]
  const cells = buildWorkRhythm(intervals, {
    checkIns: [{ at: new Date('2026-08-05T10:15:00.000Z'), timeZone: 'UTC' }],
    taskCompletions: [
      { at: new Date('2026-08-05T11:30:00.000Z'), timeZone: 'UTC' },
      { at: new Date('2026-08-05T11:45:00.000Z'), timeZone: 'UTC' },
    ],
  })

  const wed10 = cells.find((c) => c.day === 3 && c.hour === 10)
  const wed11 = cells.find((c) => c.day === 3 && c.hour === 11)
  assert.ok(wed10)
  assert.ok(wed11)
  assert.equal(wed10.checkIns, 1)
  assert.equal(wed10.tasksCompleted, 0)
  assert.equal(wed11.checkIns, 0)
  assert.equal(wed11.tasksCompleted, 2)
  assert.ok(wed10.intensity > 0)
  assert.ok(wed11.intensity > wed10.intensity) // tasks weigh more than check-ins
}

testParseHm()
testWorkMinutes()
testLate()
testFinalizeDay()
testAttendancePercent()
testExpectedAndIntervals()
testEodCapOpenSession()
testLeaveShortCircuit()
testLateHalfDayPrecedence()
testDateHelpers()
testWorkRhythmIncludesTasksAndCheckIns()
console.log('attendance-calc tests passed')
